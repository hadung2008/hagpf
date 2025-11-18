import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { useTranslation } from '../../../lib/i18n';

interface InvoiceHistoryProps {
    invoices: Invoice[];
    onViewInvoice: (invoice: Invoice) => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices, onViewInvoice }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv =>
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, searchTerm]);

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('repairShop.sales.historyTab')}</h2>
                <input
                    type="text"
                    placeholder={t('repairShop.dashboard.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.idHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.customerHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.dateHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.inventory.totalItemsHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.sales.total')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} onClick={() => onViewInvoice(invoice)} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">{invoice.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">{invoice.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(invoice.date).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-slate-300">
                                    {invoice.items.reduce((acc, item) => acc + item.quantity, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-slate-200">${invoice.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};