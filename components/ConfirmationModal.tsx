import React from 'react';
import { useTranslation } from '../lib/i18n';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">
            {cancelText || t('general.cancel')}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700">
            {confirmText || t('general.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};