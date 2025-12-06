import React, { useState, useEffect } from 'react';
import './App.css';
import ExcelViewer from './components/ExcelViewer';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

function App() {
  const [excelData, setExcelData] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    openaiBaseUrl: '',
    openaiToken: ''
  });
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const handleExcelDataChange = (data) => {
    setExcelData(data);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const container = document.querySelector('.main-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      // 计算鼠标相对于容器的位置
      const mouseX = e.clientX;
      const newWidth = containerRect.right - mouseX;

      // 设置最小和最大宽度
      const minWidth = 250;
      const maxWidth = Math.min(containerWidth * 0.9, window.innerWidth * 0.9);
      
      // 限制宽度范围
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setChatWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Excel Copilot</h1>
        <button 
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          ⚙️
        </button>
      </header>
      
      <div className="main-container">
        <div className="excel-section">
          <ExcelViewer onDataChange={handleExcelDataChange} />
        </div>
        
        <div 
          className={`resizer ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleResizeStart}
        ></div>
        
        <div 
          className="chat-section"
          style={{ width: `${chatWidth}px` }}
        >
          <ChatInterface 
            excelData={excelData}
            settings={settings}
          />
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsChange}
        />
      )}
    </div>
  );
}

export default App;
