import React, { useState } from 'react';
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

  const handleExcelDataChange = (data) => {
    setExcelData(data);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
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
        
        <div className="resizer"></div>
        
        <div className="chat-section">
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
