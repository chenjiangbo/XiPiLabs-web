# Taleweave iOS SSO 联调指南（Apple / Google）

适用对象：`/workspace/xipilabs/taleweave_app`（iOS），对接官网认证中心 `https://www.xipilabs.com`，获取 JWT 后访问 `https://taleweave.xipilabs.com/api`。

## 0. 环境前提（已就绪）
- 门户端已支持自定义 Scheme 跳转，`redirect_url` 可用 `taleweave-app://...`。
- 网关使用同一 `JWT_SECRET`，生产 Redis 指向 `taleweave-redis:6379`。
- Apple 配置（web Services ID）：`com.xipilabs.taleweave.web`；回调 `https://www.xipilabs.com/api/auth/callback/apple`。
- Google 配置：`/api/auth/google` 正常，回调 `https://www.xipilabs.com/api/auth/callback/google`。

## 1. iOS 端关键常量（已存在于 AppEnvironment.swift）
- `apiBaseURL = https://taleweave.xipilabs.com/api`
- `authBaseURL = https://www.xipilabs.com`
- `appScheme = taleweave-app`，`authCallbackHost = auth`  
  → 回调示例：`taleweave-app://auth/apple` 或 `taleweave-app://auth/google`

## 2. 登录流程（两种方式）
### 推荐：统一走门户 Web OAuth（免维护客户端密钥）
1) 触发登录时直接打开：`https://www.xipilabs.com/api/auth/apple?redirect_url=taleweave-app://auth/apple`（Google 同理替换为 `/api/auth/google`）。
2) 用户在浏览器完成授权后，门户回调至 `taleweave-app://...` 并附带 `token/user_id/email`。
3) 客户端拦截自定义 Scheme，保存 `auth-token`（JWT），后续请求在 Header 携带 `Authorization: Bearer <token>`。

### 备用：系统 Sign in with Apple（不建议混用）
- 若使用 `ASAuthorizationAppleIDProvider`，`client_id` 需为 web 的 Services ID（`com.xipilabs.taleweave.web`），并同样通过门户回调交换 token，否则 audience 将不匹配。

## 3. 联调要点
- Apple 名称兜底：后端会在 identity.display_name 为空时使用邮箱前缀，避免显示私密邮箱。
- 回调模式：已使用默认 GET，避免跨站 POST 被拦截（Next.js 16）。
- 退出：调用 `https://www.xipilabs.com/api/logout`，服务端会下发多条 Set-Cookie 删除 `auth-token`（.xipilabs.com / www / 根域）。
- 网络：测试设备需能直连 `appleid.apple.com`、`www.xipilabs.com`，不要被代理屏蔽。

## 4. 测试清单（移动端）
- [ ] Apple：调用 `/api/auth/apple?redirect_url=taleweave-app://auth/apple`，回跳后能收到 token，用户名展示为姓名或邮箱前缀。
- [ ] Google：调用 `/api/auth/google?redirect_url=taleweave-app://auth/google`，回跳后 token 可用。
- [ ] 持有 token 访问 `apiBaseURL`，网关放行并在后端获取到 `X-User-ID`。
- [ ] 退出：命中 `/api/logout` 后客户端清除本地 token；网页端 Cookie 已删除，不再自动登录。
