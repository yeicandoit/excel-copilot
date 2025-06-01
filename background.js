// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROCESS_EXCEL') {
    handleExcelProcessing(request.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // 保持消息通道开放
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