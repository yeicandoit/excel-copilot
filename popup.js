// 全局变量
let currentExcelData = null;

// DOM 元素
const excelFileInput = document.getElementById('excelFile');
const loadFileButton = document.getElementById('loadFile');
const userInput = document.getElementById('userInput');
const sendMessageButton = document.getElementById('sendMessage');
const chatHistory = document.getElementById('chatHistory');
const statusDiv = document.getElementById('status');

// 加载Excel文件
loadFileButton.addEventListener('click', async () => {
  const file = excelFileInput.files[0];
  if (!file) {
    updateStatus('Please select an Excel file first');
    return;
  }

  try {
    updateStatus('Loading file...');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = await readExcelFile(arrayBuffer);
    currentExcelData = workbook;
    updateStatus('File loaded successfully');
    addMessage('System', 'Excel file loaded successfully. You can now ask questions about the data.');

    // 发送消息到 content script 以在新标签页中显示 Excel 内容
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'OPEN_EXCEL',
        excelData: arrayBuffer
      });
    });
  } catch (error) {
    updateStatus('Error loading file: ' + error.message);
  }
});

// 发送消息
sendMessageButton.addEventListener('click', async () => {
  const message = userInput.value.trim();
  if (!message) return;

  if (!currentExcelData) {
    updateStatus('Please load an Excel file first');
    return;
  }

  addMessage('User', message);
  userInput.value = '';

  try {
    updateStatus('Processing...');
    const response = await processUserMessage(message, currentExcelData);
    addMessage('Assistant', response);
    updateStatus('Ready');
  } catch (error) {
    updateStatus('Error: ' + error.message);
    addMessage('System', 'An error occurred while processing your request.');
  }
});

// 辅助函数
function updateStatus(message) {
  statusDiv.textContent = message;
}

function addMessage(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender.toLowerCase()}-message`;
  messageDiv.textContent = `${sender}: ${message}`;
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Excel文件读取函数
async function readExcelFile(arrayBuffer) {
  // 这里需要集成一个Excel解析库，比如SheetJS
  // 示例实现
  return new Promise((resolve, reject) => {
    try {
      // 这里应该使用实际的Excel解析库
      // 暂时返回模拟数据
      resolve({
        sheets: ['Sheet1'],
        data: {
          Sheet1: [
            ['A1', 'B1', 'C1'],
            ['A2', 'B2', 'C2']
          ]
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// 处理用户消息
async function processUserMessage(message, excelData) {
  // 这里需要集成大语言模型API
  // 示例实现
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`I've processed your request: "${message}"\nThe Excel data contains ${excelData.sheets.length} sheets.`);
    }, 1000);
  });
} 