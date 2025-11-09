import React from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'premium':
        return '👑';
      default:
        return 'ℹ️';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)';
      case 'error':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)';
      case 'warning':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)';
      case 'premium':
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.5)';
      case 'error':
        return 'rgba(239, 68, 68, 0.5)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.5)';
      case 'premium':
        return 'rgba(255, 215, 0, 0.5)';
      default:
        return 'rgba(139, 92, 246, 0.5)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: getGradient(),
          border: `2px solid ${getBorderColor()}`
        }}
      >
        <div className="modal-header">
          <div className="modal-icon">{getIcon()}</div>
          <h2 className="modal-title">{title}</h2>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-btn"
            onClick={onClose}
            style={{
              background: type === 'premium' 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: type === 'premium' ? '#000' : '#fff'
            }}
          >
            {type === 'premium' ? 'Got it! 👑' : 'OK'}
          </button>
        </div>

        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export default Modal;

