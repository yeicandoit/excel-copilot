# Excel Assistant Chrome Extension

这是一个Chrome浏览器插件，可以帮助用户通过自然语言处理Excel文件，并与大语言模型交互。

## 功能特点

- 读取Excel文件
- 通过自然语言与Excel数据交互
- 支持数据分析和计算
- 支持将结果写回Excel文件
- 集成大语言模型API

## 安装步骤

1. 克隆或下载此仓库
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
4. 在Chrome浏览器中加载插件：
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目目录

## 使用方法

1. 点击Chrome工具栏中的插件图标
2. 点击"选择文件"按钮上传Excel文件
3. 在输入框中输入自然语言指令
4. 等待AI助手处理并返回结果

## 开发说明

- 使用 `npm run dev` 启动开发模式
- 修改代码后会自动重新构建
- 在Chrome扩展管理页面点击刷新按钮更新插件

## 技术栈

- Chrome Extension Manifest V3
- SheetJS (xlsx) 用于Excel文件处理
- Webpack 用于构建
- 大语言模型API集成

## 注意事项

- 确保Excel文件格式正确
- 大文件处理可能需要较长时间
- 请确保网络连接稳定

## 许可证

MIT 