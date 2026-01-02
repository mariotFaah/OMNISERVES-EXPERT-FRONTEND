import React from 'react';
import './AlertDialog.css';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title = 'Information',
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  onClose,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  return (
    <div className="alert-dialog-overlay">
      <div className={`alert-dialog alert-dialog--${type}`}>
        <div className="alert-dialog-header">
          <span className="alert-dialog-icon">{getIcon()}</span>
          <h3 className="alert-dialog-title">{title}</h3>
        </div>
        
        <div className="alert-dialog-body">
          <p className="alert-dialog-message">{message}</p>
        </div>

        <div className="alert-dialog-actions">
          {onCancel && (
            <button
              className="alert-dialog-button alert-dialog-button--cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          
          <button
            className={`alert-dialog-button alert-dialog-button--${type}`}
            onClick={onConfirm ? handleConfirm : onClose}
            autoFocus
          >
            {onConfirm ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;