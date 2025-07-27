let currentExcelText = ''; // 用于保存当前Excel的文本内容

const excelFileInput = document.getElementById('excelFile');
// 监听文件选择事件
excelFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) {
    alert('Please select an Excel file');
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    // 1. 加载Excel文件
    const workbook = new ExcelJS.Workbook();
    // 加载 Excel 数据
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);
    const container = document.getElementById('excel-container');
    container.innerHTML = '';

    // 创建表格
    const table = document.createElement('table');

    // 添加表头
    const headerRow = document.createElement('tr');
    worksheet.getRow(1).eachCell((cell) => {
        const th = document.createElement('th');
        th.textContent = cell.value;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 添加数据行
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = document.createElement('tr');
        worksheet.getRow(rowNumber).eachCell((cell) => {
            const td = document.createElement('td');
            td.textContent = cell.value;
            row.appendChild(td);
        });
        table.appendChild(row);
    }

    container.appendChild(table);

    // 生成文本内容
    let textRows = [];
    worksheet.eachRow((row, rowNumber) => {
        let rowText = [];
        row.eachCell((cell) => {
            rowText.push(cell.value !== null && cell.value !== undefined ? cell.value : '');
        });
        textRows.push(rowText.join('\t'));
    });
    currentExcelText = textRows.join('\n');
  } catch (error) {
    document.getElementById('excel-container').innerHTML = 'Error loading file: ' + error.message;
    currentExcelText = '';
  }
});

// 暴露方法
window.getExcelDataAsText = async function() {
    return currentExcelText;
};

// 设置面板逻辑
const settingsIcon = document.getElementById('settingsIcon');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const openaiBaseUrlInput = document.getElementById('openaiBaseUrl');
const openaiTokenInput = document.getElementById('openaiToken');
const settingsSavedMsg = document.getElementById('settingsSavedMsg');

// 显示设置面板并填充已保存的值
settingsIcon.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
    // 读取已保存的设置
    if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['openaiBaseUrl', 'openaiToken'], (result) => {
            openaiBaseUrlInput.value = result.openaiBaseUrl || '';
            openaiTokenInput.value = result.openaiToken || '';
        });
    } else {
        // fallback: localStorage
        openaiBaseUrlInput.value = localStorage.getItem('openaiBaseUrl') || '';
        openaiTokenInput.value = localStorage.getItem('openaiToken') || '';
    }
    settingsSavedMsg.style.display = 'none';
});

// 关闭设置面板
closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// 保存设置
saveSettingsBtn.addEventListener('click', () => {
    const baseUrl = openaiBaseUrlInput.value.trim();
    const token = openaiTokenInput.value.trim();
    if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ openaiBaseUrl: baseUrl, openaiToken: token }, () => {
            settingsSavedMsg.style.display = 'block';
            setTimeout(() => { settingsSavedMsg.style.display = 'none'; }, 1500);
        });
    } else {
        // fallback: localStorage
        localStorage.setItem('openaiBaseUrl', baseUrl);
        localStorage.setItem('openaiToken', token);
        settingsSavedMsg.style.display = 'block';
        setTimeout(() => { settingsSavedMsg.style.display = 'none'; }, 1500);
    }
});

// 点击模态框外部关闭
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});