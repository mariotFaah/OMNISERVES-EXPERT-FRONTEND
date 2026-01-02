import { useState, useCallback } from 'react';

export interface AlertDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export const useAlertDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<AlertDialogConfig>({
    message: '',
    confirmText: 'OK',
    cancelText: 'Annuler',
    type: 'info'
  });

  const alert = useCallback((message: string, config: Omit<AlertDialogConfig, 'message'> = {}) => {
    setDialogConfig({
      message,
      confirmText: 'OK',
      cancelText: 'Annuler',
      type: 'info',
      ...config
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(() => {
    dialogConfig.onConfirm?.();
    close();
  }, [dialogConfig, close]);

  const cancel = useCallback(() => {
    dialogConfig.onCancel?.();
    close();
  }, [dialogConfig, close]);

  return {
    isOpen,
    message: dialogConfig.message,
    title: dialogConfig.title,
    type: dialogConfig.type,
    confirmText: dialogConfig.confirmText,
    cancelText: dialogConfig.cancelText,
    alert,
    close,
    confirm,
    cancel,
    hasConfirmButton: !!dialogConfig.onConfirm,
    hasCancelButton: !!dialogConfig.onCancel
  };
};