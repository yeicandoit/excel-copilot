// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROCESS_EXCEL') {
    handleExcelProcessing(request.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // 保持消息通道开放
  } else if (request.type === 'OPEN_EXCEL') {
    // 创建新标签页的 URL
    const viewerUrl = chrome.runtime.getURL('excel-viewer.html');
    const fullUrl = `${viewerUrl}`;
    
    // 在新标签页中打开
    chrome.tabs.create({ url: fullUrl });
    
    sendResponse({ success: true });
  }
});

// 处理Excel数据
async function handleExcelProcessing(data) {
  try {
    // 这里可以添加与Excel数据相关的处理逻辑
    return {
      success: true,
      message: 'Excel data processed successfully'
    };
  } catch (error) {
    throw new Error('Failed to process Excel data: ' + error.message);
  }
}

// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Excel Assistant extension installed');
}); 