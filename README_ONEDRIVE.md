# OneDrive 集成设置指南

本项目支持使用OneDrive同步您的导航设置，实现跨设备访问。

## 设置步骤

### 1. Azure应用注册

1. 访问 [Azure Portal](https://portal.azure.com)
2. 搜索并选择"应用注册"
3. 点击"新注册"
4. 填写应用信息：
   - 名称：例如"MyNavApp"
   - 支持的账户类型：选择"任何组织目录(任何 Azure AD 目录 - 多租户)中的账户和个人 Microsoft 账户"
   - 重定向URI：选择"Web"并填入您的回调地址（开发时可用`http://localhost:3000/api/auth/callback`）

### 2. 配置API权限

1. 在应用注册页面，选择"API权限"
2. 添加以下权限：
   - **Microsoft Graph** → **委托的权限**：
     - `Files.ReadWrite.AppFolder` - 读写应用专用文件夹
     - `User.Read` - 读取用户基本信息
     - `offline_access` - 获取刷新令牌以实现长期访问

3. 添加权限后，点击"授予管理员同意"

### 3. 创建客户端密钥

1. 选择"证书和密钥"
2. 点击"新客户端密钥"
3. 添加描述并选择过期时间
4. 复制并保存密钥值（只显示一次）

### 4. 配置环境变量

1. 复制 `.env.example` 文件为 `.env.local`
2. 填入您的Azure应用信息：

```env
# Azure应用注册信息
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here
AZURE_TENANT_ID=your_tenant_id_here

# 回调URI（开发环境）
AZURE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# OneDrive应用文件夹名称
ONEDRIVE_APP_FOLDER=MyNavApp

# JWT密钥（用于会话管理）
JWT_SECRET=your_jwt_secret_here_generate_a_long_random_string
```

### 5. 安装依赖

```bash
npm install
```

### 6. 启动应用

```bash
npm run dev
```

## 使用方法

1. 打开应用后，在右下角会看到OneDrive登录按钮
2. 点击"登录OneDrive"进行授权
3. 登录成功后，可以启用OneDrive同步功能
4. 启用后，您的设置和链接将自动同步到OneDrive

## 数据存储结构

在您的OneDrive中，会创建一个名为"MyNavApp"的文件夹，包含以下文件：

- `settings.json` - 用户设置
- `links.json` - 链接数据

## 安全注意事项

1. **不要提交 `.env.local` 文件到版本控制系统**
2. 生产环境中应使用更安全的JWT密钥
3. 定期轮换Azure应用密钥
4. 考虑限制应用权限范围

## 故障排除

### 认证失败
- 检查Azure应用配置是否正确
- 确认重定向URI与Azure中配置的一致
- 检查API权限是否已正确设置并授予管理员同意

### 同步失败
- 检查网络连接
- 确认OneDrive存储空间是否足够
- 尝试手动同步

### 令牌过期
- 应用会自动尝试刷新令牌
- 如果刷新失败，需要重新登录

## 开发者注意事项

如果您计划修改此功能或将其用于其他项目，请注意：

1. 本实现使用Microsoft Graph API v1.0
2. 认证流程基于OAuth 2.0授权码流
3. 使用JWT进行会话管理
4. 数据存储在用户的OneDrive应用专用文件夹中

## 许可证

本功能遵循项目的整体许可证。在使用Azure服务时，请同时遵守Microsoft的服务条款。