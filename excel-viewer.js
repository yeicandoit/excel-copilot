// 从 URL 参数中获取 Excel 数据
const urlParams = new URLSearchParams(window.location.search);
const excelData = urlParams.get('data');

if (excelData) {
    // 解析 base64 编码的 Excel 数据
    const workbook = new ExcelJS.Workbook();
    const data = atob(excelData);
    const arrayBuffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < data.length; i++) {
        view[i] = data.charCodeAt(i);
    }

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
} else {
    document.getElementById('excel-container').innerHTML = 'No Excel data provided';
} 