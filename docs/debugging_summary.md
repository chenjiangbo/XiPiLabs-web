# 调试复盘总结：官网国际化（i18n）问题

本文档旨在全面复盘在为官网项目启用国际化功能时遇到的一系列问题、错误的诊断思路、以及最终的解决方案。

## 第一阶段：初步构建失败与语法修复

在项目初次构建时，遇到了若干由依赖版本更新（尤其是 Next.js 16）引发的语法和类型错误。

1.  **问题：`cookies()` 函数类型错误**
    *   **错误日志**：`TypeError: Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'`
    *   **原因**：在 Next.js 16 中，从 `next/headers` 导入的 `cookies()` 函数从一个同步函数变为了一个返回 Promise 的异步函数。代码尝试在 Promise 本身上调用 `.get()` 方法，导致类型错误。
    *   **修复**：将使用该函数的组件改造为 `async` 组件，并通过 `await cookies()` 来获取 `cookieStore` 对象。

2.  **问题：`t.rich` 渲染 HTML 标签**
    *   **症状**：翻译文本中的 `<br/>` 标签被直接当成字符串显示，没有实现换行。
    *   **原因**：`next-intl` 的 `t.rich` 功能需要符合其内部 XML 解析器的规则。自闭合的 `<br/>` 标签无法被正确识别。
    *   **错误的修复**：最初尝试将 `<br/>` 改为 `<br>`，但这导致了更严重的 `UNCLOSED_TAG` 运行时崩溃。
    *   **正确修复**：应使用成对的闭合标签，即将 `<br>` 改为 `<br></br>`，以满足解析器的要求。

3.  **问题：Server Component 中使用客户端 Hook**
    *   **错误日志**：`Error: Expected a suspended thenable`
    *   **原因**：在将页面组件改为 `async` 以修复 `cookies()` 问题后，该组件成为了一个 React Server Component (RSC)。但组件内部依然保留了 `useTranslations` 和 `useMDXComponent` 这两个只能在客户端组件中运行的 Hook。
    *   **修复**：
        *   使用 `next-intl` 为服务端提供的 `await getTranslations()` 替代 `useTranslations` Hook。
        *   将使用 `useMDXComponent` 的 `SectionBlock` 组件剥离到独立的 `"use client";` 文件中。

4.  **其他语法错误**
    *   在修复过程中，因错误地从内存中调用函数，误用了不存在的 `getTranslator`（应为 `getTranslations`），导致构建失败。
    *   在一次代码替换中，意外删除了仍在使用的 `locale` 变量的定义，导致 `Cannot find name 'locale'` 错误。

---

## 第二阶段：核心谜题 - 内容板块丢失

在所有构建错误被修复后，项目最核心、最棘手的问题浮出水面：**主页上只有 Hero 区域，下面的所有内容板块都无法显示。**

### 错误的诊断路径

1.  **初步诊断**：通过在页面中添加 `console.log`，发现用于渲染内容的 `orderedSections` 数组为空。
2.  **定位原因**：`orderedSections` 为空是因为 `allSections.filter(s => s.locale === locale)` 过滤失败，而过滤失败是因为 `locale` 变量为空。
3.  **错误的假设**：我认为 `locale` 变量为空是因为缺少中间件（Middleware）来处理国际化路由。这引导我走上了一条漫长而错误的道路：
    *   尝试添加 `middleware.ts`，导致与项目中已存在的 `proxy.ts` 冲突，引发新的构建错误。
    *   发现 `proxy.ts` 才是此项目正确的中间件文件名后，删除了 `middleware.ts`。
    *   然而，即使 `proxy.ts` (已重命名为 `middleware.ts`) 配置正确且日志显示它**正在运行**，`locale` 参数依然为空。

### 最终的根本原因（由用户发现）

**真正的根源是 Next.js 16 的一个核心 breaking change：App Router 中，传递给页面和布局的 `params` 属性不再是一个普通对象，而是一个 Promise。**

*   **为何之前的诊断会出错？** 我用来打印参数的 `JSON.stringify(params)` 代码，在序列化一个 Promise 时，会得到一个空对象 `{}`。这让我错误地以为 `params` 对象是空的，从而坚定了我对“中间件未传参”的错误判断。
*   **为何代码会失效？** `const { locale } = params;` 这行代码试图从一个 Promise 中解构属性，自然无法得到 `locale` 值，导致其为 `undefined`。

### 最终解决方案

在所有需要使用 `params` 的地方（`layout.tsx`, `page.tsx` 等），先用 `await` 等待 Promise 解析，然后再使用其内部的值。

**正确代码示例：**
```typescript
// In src/app/[locale]/page.tsx
export default async function Home({ params }: { params: Promise<{locale: string}> }) {
  const { locale } = await params; // <--- The correct solution

  // Now 'locale' has the correct value (e.g., 'en')
  const orderedSections = allSections.filter(section => section.locale === locale);
  // ...
}
```

---

## 关键教训

1.  **警惕框架的核心 API 变更**：在处理与框架版本密切相关的问题时，尤其是遇到看似不合逻辑的现象（如中间件运行但参数丢失），应优先怀疑并查证框架核心 API（如页面 props）是否存在 Breaking Change。
2.  **诊断工具的局限性**：简单的 `console.log` 或 `JSON.stringify` 在面对框架返回的复杂或异步对象（如 Promise）时，可能会产生误导性的输出。
3.  **知识库需要持续更新**：作为 AI 助手，我的知识库必须跟上主流框架的快速迭代，否则就会像这次一样，基于过时的信息做出错误的判断。
