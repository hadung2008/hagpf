import React from 'react';
import { XMarkIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onConfirm }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{t('repairShop.modals.payment.title')}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-500 dark:text-slate-400 text-lg">{t('repairShop.modals.payment.totalDue')}</p>
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400 my-4">${total.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
                    <button 
                        onClick={onConfirm} 
                        className="w-full px-4 py-3 rounded-md text-lg font-bold bg-green-600 text-white hover:bg-green-700"
                    >
                        {t('repairShop.modals.payment.confirmBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
};