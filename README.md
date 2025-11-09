This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker 部署

构建镜像：

```bash
docker build -t xipilabs-web .
```

或使用 docker-compose：

```bash
docker compose up --build
```

镜像会先执行 `pnpm exec contentlayer build` 再 `pnpm build`，运行时直接 `pnpm start`，默认监听 3210 端口。

## 本地环境变量

- 新增 `.env.development.local.example`，复制为 `.env.development.local` 后即可按照本地需求修改，不会影响线上使用的 `.env.local`。
- Next.js 在 `pnpm dev` 时会优先加载 `.env.development.local`，因此本地变量会覆盖生产变量，而不会改动到原有文件。
- 本地容器可通过下列方式显式指定 env 文件：

```bash
LOCAL_ENV_FILE=.env.development.local docker compose -f docker-compose.local.yml up --build
```

如无需本地短信，可保持示例文件中的 `OTP_DEV_MODE=true` 以跳过阿里云短信发送。
