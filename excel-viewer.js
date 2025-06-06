const excelFileInput = document.getElementById('excelFile');
// 监听文件选择事件
excelFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) {
    alert('Please select an Excel file');
    return;
  }

  try {
    const arrayBuffer = file.arrayBuffer();
    // 1. 加载Excel文件
    const workbook = new ExcelJS.Workbook();
    // 加载 Excel 数据
    workbook.xlsx.load(arrayBuffer).then(() => {
        const worksheet = workbook.getWorksheet(1);
        const container = document.getElementById('excel-container');
        
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
    }).catch(error => {
        console.error('Error loading Excel file:', error);
        document.getElementById('excel-container').innerHTML = 'Error loading Excel file';
    });
  } catch (error) {
    document.getElementById('excel-container').innerHTML = 'Error loading file: ' + error.message;
  }
});