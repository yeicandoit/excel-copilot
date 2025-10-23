# Excel Copilot - 前后端分离版本

这是一个基于React前端和Rust Actix Web后端的Excel数据分析助手应用。

## 项目结构

```
excel-copilot/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   └── ...
│   └── package.json
├── backend/           # Rust Actix Web后端
│   ├── src/
│   │   ├── handlers/      # 请求处理器
│   │   ├── services/      # 业务逻辑服务
│   │   ├── models/        # 数据模型
│   │   └── ...
│   └── Cargo.toml
├── docker-compose.yml # Docker编排配置
└── README.md
```

## 功能特性

- 📊 **Excel文件处理**: 前端直接处理.xlsx和.xls格式文件
- 🤖 **AI聊天助手**: 基于OpenAI API的智能数据分析
- 💬 **实时流式响应**: 支持流式聊天响应
- ⚙️ **设置管理**: 可配置OpenAI API设置
- 📱 **响应式设计**: 支持桌面和移动设备
- 🐳 **Docker部署**: 完整的容器化部署方案

## 技术栈

### 前端
- React 18
- CSS3 (响应式设计)
- Axios (HTTP客户端)
- XLSX.js (Excel文件处理)
- Marked (Markdown渲染)

### 后端
- Rust
- Actix Web (Web框架)
- Reqwest (HTTP客户端)
- Serde (序列化/反序列化)

## 快速开始

### 使用Docker (推荐)

1. 克隆项目
```bash
git clone <repository-url>
cd excel-copilot
```

2. 启动服务
```bash
docker-compose up --build
```

3. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:8080
- 通过Nginx: http://localhost

### 本地开发

#### 后端开发

1. 安装Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. 启动后端服务
```bash
cd backend
cargo run
```

#### 前端开发

1. 安装Node.js (版本18+)

2. 安装依赖并启动
```bash
cd frontend
npm install
npm start
```

## 配置说明

### OpenAI API配置

在应用设置中配置以下参数：
- **OpenAI Base URL**: API基础URL (例如: https://api.openai.com/v1)
- **OpenAI Token**: API访问令牌

### 环境变量

#### 后端环境变量
- `PORT`: 服务端口 (默认: 8080)
- `RUST_LOG`: 日志级别 (默认: info)

#### 前端环境变量
- `REACT_APP_API_URL`: 后端API地址 (默认: http://localhost:8080)

## API接口

### 聊天接口
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "分析这个Excel数据"}
  ],
  "excel_data": "Excel数据文本",
  "settings": {
    "openai_base_url": "https://api.openai.com/v1",
    "openai_token": "sk-..."
  }
}
```

### 健康检查接口
```
GET /api/health
```

## 部署指南

### 生产环境部署

1. 构建生产镜像
```bash
docker-compose -f docker-compose.prod.yml up --build
```

2. 配置反向代理 (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

### 云平台部署

#### Heroku
```bash
# 后端部署
cd backend
heroku create your-app-backend
git push heroku main

# 前端部署
cd frontend
heroku create your-app-frontend
git push heroku main
```

#### AWS/GCP/Azure
使用相应的容器服务 (ECS/GKE/Container Instances) 部署Docker镜像。

## 开发指南

### 添加新功能

1. **前端组件**: 在 `frontend/src/components/` 中创建新组件
2. **API接口**: 在 `backend/src/handlers/` 中添加新的处理器
3. **业务逻辑**: 在 `backend/src/services/` 中实现业务逻辑

### 代码规范

- 前端: 使用ESLint和Prettier
- 后端: 使用rustfmt和clippy
```bash
# 后端代码格式化
cargo fmt
cargo clippy
```

## 故障排除

### 常见问题

1. **CORS错误**: 确保后端CORS配置正确
2. **文件上传失败**: 检查文件大小限制和格式支持
3. **API连接失败**: 验证后端服务是否正常运行

### 日志查看

```bash
# Docker日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 本地开发日志
# 后端: 控制台输出
# 前端: 浏览器开发者工具
```

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 创建Issue
- 发送邮件至: [your-email@example.com]

---

**注意**: 这是一个演示项目，生产环境使用前请确保：
1. 配置适当的安全措施
2. 使用HTTPS
3. 实施API速率限制
4. 添加用户认证和授权
5. 使用生产级数据库替代内存存储