import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ settings, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    openaiBaseUrl: '',
    openaiToken: ''
  });
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
      onClose();
    }, 1500);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="openaiBaseUrl">OpenAI Base URL</label>
            <input
              type="text"
              id="openaiBaseUrl"
              name="openaiBaseUrl"
              value={formData.openaiBaseUrl}
              onChange={handleInputChange}
              placeholder="e.g. https://api.openai.com/v1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="openaiToken">OpenAI Token</label>
            <input
              type="password"
              id="openaiToken"
              name="openaiToken"
              value={formData.openaiToken}
              onChange={handleInputChange}
              placeholder="sk-..."
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          {showSavedMessage && (
            <div className="saved-message">
              Settings saved!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
