# Excel Copilot - AI驱动的Excel数据分析助手

Excel Copilot是一个多平台的AI驱动Excel数据分析助手，提供两种使用方式：

1. **Web应用** - 基于React前端的Web应用
2. **Chrome扩展** - 浏览器扩展，可在任何网页上直接分析Excel文件

## 项目架构

### 整体结构
```
excel-copilot/
├── web/                    # Web应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   └── ...
│   ├── public/             # 静态文件
│   ├── package.json
│   ├── docker-compose.yml  # Docker编排配置
│   └── nginx.conf          # Nginx配置
├── chrome-extension/       # Chrome浏览器扩展
│   ├── manifest.json       # 扩展清单
│   ├── popup.html          # 扩展弹窗界面
│   ├── popup.js            # 弹窗逻辑
│   ├── content.js          # 内容脚本
│   ├── background.js       # 后台脚本
│   ├── excel-viewer.html   # Excel查看器
│   ├── excel-viewer.js     # Excel处理逻辑
│   ├── chat.js             # 聊天功能
│   └── styles.css          # 样式文件
└── README.md
```

## 功能特性

### Web应用功能
- 📊 **Excel文件处理**: 前端直接处理.xlsx和.xls格式文件
- 🤖 **AI聊天助手**: 基于OpenAI API的智能数据分析
- 💬 **实时流式响应**: 支持流式聊天响应
- ⚙️ **设置管理**: 可配置OpenAI API设置
- 📱 **响应式设计**: 支持桌面和移动设备
- 🐳 **Docker部署**: 完整的容器化部署方案

### Chrome扩展功能
- 🌐 **全网页支持**: 可在任何网页上直接使用
- 📁 **Excel文件上传**: 支持拖拽上传Excel文件
- 🔍 **Excel数据查看**: 内置Excel查看器，支持多工作表
- 💬 **AI数据分析**: 与Excel数据交互的智能聊天
- ⚡ **快速访问**: 一键启动，无需离开当前页面
- 🔒 **隐私保护**: 本地处理，数据不离开浏览器

## 技术栈

### Web应用技术栈

- **React 18** - 用户界面框架
- **CSS3** - 响应式设计
- **Axios** - HTTP客户端
- **XLSX.js** - Excel文件处理
- **Marked** - Markdown渲染

### Chrome扩展技术栈
- **Manifest V3** - 扩展清单格式
- **Vanilla JavaScript** - 核心逻辑
- **HTML5/CSS3** - 界面和样式
- **XLSX.js** - Excel文件处理
- **Chrome APIs** - 浏览器扩展API
- **Service Worker** - 后台脚本

## 快速开始

### Web应用

#### 使用Docker (推荐)

1. 克隆项目
```bash
git clone <repository-url>
cd excel-copilot
```

2. 启动Web应用
```bash
cd web
docker-compose up --build
```

3. 访问应用
- Web应用: http://localhost:3000
- 通过Nginx: http://localhost

#### 本地开发

```bash
cd web
npm install
npm start
```

### Chrome扩展

#### 安装扩展

1. 下载或克隆项目
```bash
git clone <repository-url>
cd excel-copilot
```

2. 打开Chrome浏览器，访问 `chrome://extensions/`

3. 开启"开发者模式"

4. 点击"加载已解压的扩展程序"

5. 选择 `chrome-extension` 文件夹

6. 扩展安装完成，可在浏览器工具栏看到Excel Assistant图标

#### 使用扩展

1. 点击浏览器工具栏中的Excel Assistant图标
2. 点击"process excel"按钮
3. 上传Excel文件或拖拽文件到页面
4. 开始与AI助手对话分析数据

## 配置说明

### Web应用配置

#### OpenAI API配置
在Web应用设置中配置以下参数：
- **OpenAI Base URL**: API基础URL (例如: https://api.openai.com/v1)
- **OpenAI Token**: API访问令牌

#### 环境变量

- `REACT_APP_OPENAI_API_URL`: OpenAI API地址 (默认: /v1/chat/completions)
- `REACT_APP_OPENAI_API_KEY`: OpenAI API密钥
- `REACT_APP_PROXY_TARGET`: 代理目标地址 (默认: http://10.230.66.32:8080)

### Chrome扩展配置

#### 权限配置
扩展需要以下权限：
- `storage`: 存储用户设置
- `activeTab`: 访问当前标签页
- `scripting`: 注入脚本
- `host_permissions`: 访问AI API服务

#### 设置存储
扩展使用Chrome Storage API存储：
- OpenAI API配置
- 用户偏好设置
- 聊天历史记录

## API接口 (Web应用)

Web应用通过代理方式调用外部API服务（如OpenAI兼容的API），支持流式响应实现实时AI对话体验。

## 部署指南

### Web应用部署

#### 生产环境部署

1. 构建生产镜像
```bash
cd web
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
}
```

#### 云平台部署

**Heroku**
```bash
cd web
heroku create your-app
git push heroku main
```

**AWS/GCP/Azure**
使用相应的容器服务 (ECS/GKE/Container Instances) 部署Docker镜像。

### Chrome扩展部署

#### 发布到Chrome Web Store

1. 准备扩展包
```bash
cd chrome-extension
zip -r excel-assistant-extension.zip .
```

2. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

3. 上传扩展包并填写相关信息

4. 提交审核

#### 企业内部分发

1. 打包扩展为.crx文件
2. 通过企业策略或组策略分发
3. 或使用Chrome的"加载已解压的扩展程序"功能

## 开发指南

### Web应用开发

#### 添加新功能

1. **组件**: 在 `web/src/components/` 中创建新组件
2. **API服务**: 在 `web/src/services/` 中实现API调用逻辑

#### 代码规范

- 使用ESLint和Prettier

### Chrome扩展开发

#### 添加新功能

1. **弹窗界面**: 修改 `chrome-extension/popup.html` 和 `popup.js`
2. **内容脚本**: 在 `chrome-extension/content.js` 中添加页面交互功能
3. **后台脚本**: 在 `chrome-extension/background.js` 中添加后台逻辑
4. **Excel查看器**: 修改 `chrome-extension/excel-viewer.html` 和 `excel-viewer.js`

#### 调试扩展

1. 打开Chrome开发者工具
2. 访问 `chrome://extensions/`
3. 点击扩展的"检查视图"按钮
4. 在弹出窗口中调试代码

#### 扩展更新

1. 修改代码后，在 `chrome://extensions/` 页面点击刷新按钮
2. 重新加载扩展以应用更改

## 故障排除

### Web应用常见问题

1. **CORS错误**: 检查代理配置是否正确
2. **文件上传失败**: 检查文件大小限制和格式支持
3. **API连接失败**: 验证API服务是否正常运行
4. **Docker启动失败**: 检查端口占用和Docker配置

### Chrome扩展常见问题

1. **扩展无法加载**: 检查manifest.json格式和权限配置
2. **Excel文件无法解析**: 确认文件格式支持(.xlsx, .xls)
3. **AI API调用失败**: 检查网络连接和API配置
4. **弹窗无法打开**: 检查popup.html和popup.js文件

### 日志查看

#### Web应用日志
```bash
# Docker日志
cd web
docker-compose logs -f

# 本地开发日志
# 浏览器开发者工具查看控制台输出
```

#### Chrome扩展日志
1. 打开Chrome开发者工具
2. 访问 `chrome://extensions/`
3. 点击扩展的"检查视图"按钮
4. 在Console标签页查看错误信息

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

## 使用场景对比

### Web应用适用场景
- 需要完整功能的数据分析工作台
- 团队协作和共享分析结果
- 企业级部署和管理

### Chrome扩展适用场景
- 快速分析单个Excel文件
- 在浏览网页时临时需要数据分析
- 注重隐私，数据不离开本地
- 轻量级、即开即用的体验

## 注意事项

**生产环境使用前请确保**：

### Web应用
1. 配置适当的安全措施
2. 使用HTTPS
3. 实施API速率限制
4. 添加用户认证和授权

### Chrome扩展
1. 通过Chrome Web Store审核
2. 遵循Chrome扩展安全最佳实践
3. 定期更新以保持兼容性
4. 保护用户隐私和数据安全
5. 提供清晰的权限说明