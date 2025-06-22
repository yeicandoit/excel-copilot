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