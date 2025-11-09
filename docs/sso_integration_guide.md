# XipiLabs 应用 SSO 集成开发指南

## 1. 概述

本文档旨在为 XipiLabs 旗下的新产品应用提供一份清晰的单点登录（SSO）集成指南。通过遵循本指南，新应用可以快速接入现有的统一认证体系，实现与其他产品无缝的登录体验。

## 2. 核心概念

在集成开始前，请理解以下几个核心角色：

- **认证中心 (Auth Center)**
  - **服务**: `www.xipilabs.com`
  - **职责**: 提供统一的登录界面 (`/login`)，处理所有第三方登录（Google、手机等）的回调，管理用户数据，并在用户成功登录后，签发含有身份信息的 JWT (JSON Web Token)。

- **认证网关 (Auth Gateway)**
  - **服务**: `gateway.xipilabs.com` (即 `xipilabs-gateway` 项目)
  - **职责**: 作为所有应用流量的入口，拦截发往受保护应用的请求。其内置的 `auth_service` 服务负责校验请求中的 JWT。

- **受保护应用 (Protected Application)**
  - **服务**: 任何需要登录才能访问的应用，例如 `taleweave.xipilabs.com` 或您正在开发的新应用。
  - **职责**: 应用本身**不再处理任何登录和 Token 校验逻辑**。它完全信任认证网关，并直接从网关注入的 HTTP 请求头中获取用户信息。

- **认证流程 (SSO Flow)**
  1. 用户访问受保护应用的页面。
  2. 网关拦截请求，发现用户未登录（没有有效 JWT），返回 `401 Unauthorized` 状态。
  3. 网关捕获 `401` 状态，将用户重定向到认证中心的登录页，并附带一个 `redirect_url` 参数，指明登录后应跳回的原始地址。
  4. 用户在认证中心完成登录，认证中心将 JWT 写入用户浏览器中作用于 `*.xipilabs.com` 顶级域的 Cookie。
  5. 认证中心将用户重定向回 `redirect_url`。
  6. 浏览器带着含有 JWT 的 Cookie 再次访问受保护应用。
  7. 网关拦截请求，校验 JWT 成功，从 JWT 中解析出用户信息，将其放入请求头（如 `X-User-ID`），然后将请求放行到后端的应用服务。
  8. 应用服务处理请求，并通过读取 `X-User-ID` 头来识别当前用户。

## 3. 集成步骤

假设您正在开发一个新应用 `newapp.xipilabs.com`，它在服务器上的运行端口为 `8080`。

### 步骤 1: 更新认证网关配置

这是集成的核心步骤。您需要在 `xipilabs-gateway` 项目中，修改 Nginx 的主配置文件 `nginx_config/xipilabs.conf`。

在文件中，仿照 `taleweave.xipilabs.com` 的配置，为您的新应用添加一个新的 `server` 块。

**配置模板如下：**

```nginx
# newapp.xipilabs.com - 受 SSO 保护
server {
    listen 80;
    server_name newapp.xipilabs.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name newapp.xipilabs.com;

    # 允许在请求头中使用下划线
    underscores_in_headers on;

    # SSL 证书 (使用通配符证书)
    ssl_certificate /etc/letsencrypt/live/xipilabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xipilabs.com/privkey.pem;

    # --- SSO 认证逻辑 (这部分是固定的，直接复制) ---
    location = /_verify {
        internal;
        proxy_pass http://auth_service/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }

    location @do_redirect {
        return 302 https://www.xipilabs.com/login?redirect_url=$scheme://$host$request_uri;
    }
    # --- END SSO ---

    # --- 定义受保护的路径 ---
    # 示例：保护所有 /api/ 开头的路径
    location ^~ /api/ {
        # 1. 发起认证子请求
        auth_request /_verify;
        # 2. 如果认证失败 (401)，重定向到登录页
        error_page 401 = @do_redirect;

        # 3. (关键) 认证成功后，从 auth_service 的响应头中获取用户信息
        auth_request_set $auth_user_id $upstream_http_x_user_id;
        auth_request_set $auth_user_email $upstream_http_x_user_email;
        # ... 可按需添加更多字段

        # 4. (关键) 将用户信息注入到转发给后端应用的请求头中
        proxy_set_header 'X-User-ID' $auth_user_id;
        proxy_set_header 'X-User-Email' $auth_user_email;

        # 5. 将请求转发到您的应用服务
        proxy_pass http://host.docker.internal:8080; # <-- 修改为您的应用端口
        
        # --- 标准的代理请求头 (复制即可) ---
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- 定义公开访问的路径 ---
    # 示例：允许所有人访问根路径 / 和静态资源
    location / {
        proxy_pass http://host.docker.internal:8080; # <-- 修改为您的应用端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**关键修改点：**
- 将所有 `newapp.xipilabs.com` 替换为您的应用域名。
- 将所有 `proxy_pass http://host.docker.internal:8080;` 中的 `8080` 替换为您应用的实际端口。
- 根据您的应用需求，定义哪些 `location` 块需要 `auth_request` 保护，哪些是公开的。通常，API 接口和需要登录才能访问的前端页面路径都需要保护。

### 步骤 2: 在应用后端读取用户信息

您的应用后端**无需再关心认证**，只需在处理受保护的请求时，从请求头中直接读取用户信息即可。

**示例 (Node.js + Express):**
```javascript
app.get('/api/my-data', (req, res) => {
  // 直接从网关注入的 header 中获取 userId
  const userId = req.headers['x-user-id']; 
  const userEmail = req.headers['x-user-email'];

  if (!userId) {
    // 理论上这不应该发生，因为网关已经处理了未授权的情况。
    // 但作为安全兜底，可以返回 401。
    return res.status(401).send('Unauthorized');
  }

  // 您可以 100% 信任这个 userId，直接用它执行业务逻辑
  console.log(`Request received from user ${userId} with email ${userEmail}`);
  
  // ... 执行您的业务逻辑 ...
  const data = getMyDataForUser(userId);
  res.json(data);
});
```

### 步骤 3: 处理前端登出

您应用前端的“登出”按钮，不应调用自身的 API，而应直接链接到认证中心的统一登出接口。

**示例 (React):**
```jsx
function LogoutButton() {
  // 登出后希望跳转回的页面，通常是官网首页
  const redirectTo = 'https://www.xipilabs.com';
  const logoutUrl = `https://www.xipilabs.com/logout?redirect_url=${encodeURIComponent(redirectTo)}`;

  return (
    <a href={logoutUrl}>
      登出
    </a>
  );
}
```

## 4. 集成自查清单

- [ ] `xipilabs-gateway` 项目中的 `nginx_config/xipilabs.conf` 是否已添加了新应用的 `server` 块？
- [ ] Nginx 配置中的域名和端口是否已修改为新应用的正确值？
- [ ] 是否已明确划分了哪些 `location` 是受保护的（需要 `auth_request`），哪些是公开的？
- [ ] 应用后端是否已移除所有 Token 校验逻辑？
- [ ] 应用后端是否从 `X-User-ID` 等请求头中读取用户信息？
- [ ] 应用前端的登出按钮是否链接到了 `www.xipilabs.com/logout`？
- [ ] 新应用的 CI/CD 流程是否已配置？
- [ ] `xipilabs-gateway` 的 `docker-compose.yml` 是否已更新，以确保 Nginx 配置被正确映射和加载？

---
遵循以上步骤，您的新应用即可平滑地集成到 XipiLabs 的统一认证体系中。
