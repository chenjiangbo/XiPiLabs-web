# 生产环境配置说明（门户 / 网关 / Redis / Apple 登录）

本文汇总生产环境（`/workspace/xipilabs`）官网门户的关键配置、依赖和排查要点，部署或故障排查时对照使用。

## 目录结构
- `/workspace/xipilabs/web`：官网门户（Next.js，容器名 `xipilabs-web`）。
- `/workspace/xipilabs/gateway`：总网关（Nginx + auth_service）。
- `/workspace/xipilabs/taleweave`：核心业务；其中 Redis 可供门户复用。

## 网络与服务
- 生产网络：`xipi-network`（portal/gateway/taleweave 共用）。
- Redis：容器 `taleweave-redis`，端口 6379（宿主映射 6380）。**门户必须连这个实例。**
  - 连通测试：`docker run --rm --network xipi-network redis:7 redis-cli -h taleweave-redis -p 6379 ping`
  - 查看 OAuth state：`docker run --rm --network xipi-network redis:7 redis-cli -h taleweave-redis -p 6379 keys 'oauth:apple:*'`

## 环境变量（门户容器必需）
由 GitHub Secrets 写入 `.env`（流水线：`.github/workflows/deploy.yml`）：
- Apple 登录（Web）  
  `APPLE_CLIENT_ID=com.xipilabs.taleweave.web`  
  `APPLE_TEAM_ID=QDNGW4U8HJ`  
  `APPLE_KEY_ID=Z56S5M7Z95`  
  `APPLE_PRIVATE_KEY`：P8 原文（多行存储），部署脚本自动转为 `\n` 单行  
  `APPLE_REDIRECT_URI=https://www.xipilabs.com/api/auth/callback/apple`
- 通用  
  `JWT_SECRET`：需与 gateway `auth_service` 一致  
  `REDIS_URL=redis://taleweave-redis:6379`（指向生产 Redis）  
  `DATABASE_URL`、`GOOGLE_*`、`ALIYUN_*`、`OTP_DEV_MODE`
- 前端开关：无，Apple 按钮默认启用。

## 部署流程（GitHub Actions）
- Workflow：`.github/workflows/deploy.yml`（push main 自动触发）。
- 关键步骤：从 Secrets 重建 `.env` → `docker compose up -d`（使用 `deploy/docker-compose.yml`，端口 3210，网络 `xipi-network`）。

## 常见问题与排查
- 回调报 “Invalid or expired state”：  
  1) 检查 Redis 连通：`redis-cli -h taleweave-redis -p 6379 ping`。  
  2) 点击 Apple 登录后即刻查 `keys 'oauth:apple:*'`，无 key 多半是 `REDIS_URL` 指错（应为 `taleweave-redis:6379`）。  
  3) Redis 若被清空/重启，state 会丢（TTL 600s），检查 Redis 状态/持久化。
- 授权页打不开：本地/浏览器代理阻断 `appleid.apple.com`。
- Audience 错误：确认 Web 用 `com.xipilabs.taleweave.web`，勿与 iOS Bundle ID 混用。
- 私钥格式：Secrets 可存多行原文，流水线自动转义。

## 发布后验证
1) `docker run --rm --network xipi-network redis:7 redis-cli -h taleweave-redis -p 6379 ping` 返回 PONG。  
2) 访问 `https://www.xipilabs.com/login`，点击 Apple 授权。  
3) 回调后应 302，浏览器得到 `auth-token`（域 `.xipilabs.com`）；受保护域正常访问。  
4) 状态键应短暂存在于 Redis（消费后删除）。

## 网关要点
- `JWT_SECRET` 与门户一致，`auth_service` 用于校验 Cookie/Authorization 并注入用户头。  
- Nginx 配置位于 `gateway/nginx_config`，入口分发需保证能访问门户/业务服务。
