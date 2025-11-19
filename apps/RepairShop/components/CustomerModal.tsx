import React, { useState } from 'react';
import { Customer } from '../types';
import { XMarkIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface CustomerModalProps {
    onClose: () => void;
    onSave: (customer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ onClose, onSave }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            alert(t('repairShop.modals.customer.alertRequired'));
            return;
        }
        onSave({
            id: `cust-${Date.now()}`,
            name,
            phone,
            email,
            purchaseHistory: [],
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{t('repairShop.modals.customer.addTitle')}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.customer.nameLabel')}</label>
                            <input
                                type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.customer.phoneLabel')}</label>
                            <input
                                type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} required
                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.customer.emailLabel')}</label>
                            <input
                                type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">{t('repairShop.modals.customer.saveBtn')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};