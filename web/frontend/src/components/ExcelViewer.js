import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './ExcelViewer.css';

const ExcelViewer = ({ onDataChange }) => {
  const [workbook, setWorkbook] = useState(null);
  const [currentSheet, setCurrentSheet] = useState('');
  const [tableData, setTableData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      setWorkbook(wb);
      
      if (wb.SheetNames.length > 0) {
        setCurrentSheet(wb.SheetNames[0]);
        renderSheet(wb.SheetNames[0], wb);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading Excel file: ' + error.message);
    }
  };

  const renderSheet = (sheetName, wb = workbook) => {
    if (!wb || !sheetName) return;

    const worksheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
    setTableData(data);

    // Convert to text format for AI processing
    const textRows = data.map(rowArray => 
      rowArray.map(v => (v != null ? String(v) : '')).join('\t')
    );
    const excelText = textRows.join('\n');
    onDataChange(excelText);
  };

  const handleSheetChange = (event) => {
    const sheetName = event.target.value;
    setCurrentSheet(sheetName);
    renderSheet(sheetName);
  };

  return (
    <div className="excel-viewer">
      <div className="file-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button 
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Upload Excel File
        </button>
        
        {workbook && workbook.SheetNames.length > 1 && (
          <select 
            value={currentSheet} 
            onChange={handleSheetChange}
            className="sheet-select"
          >
            {workbook.SheetNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="excel-container">
        {tableData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {tableData[0]?.map((header, index) => (
                  <th key={index}>{header != null ? String(header) : ''}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell != null ? String(cell) : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Please upload an Excel file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelViewer;
