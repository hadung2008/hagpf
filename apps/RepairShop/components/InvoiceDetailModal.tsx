import React from 'react';
import { Invoice } from '../types';
import { User } from '../../../types';
import { XMarkIcon } from '../../../components/icons';

interface InvoiceDetailModalProps {
    invoice: Invoice;
    allUsers: User[];
    onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, allUsers, onClose }) => {
    const salesperson = allUsers.find(u => u.id === invoice.salespersonId)?.name.split(' (')[0] || 'Unknown';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Detail: {invoice.id}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Date: {new Date(invoice.date).toLocaleString()}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-slate-400 font-semibold">Customer:</p>
                            <p className="text-lg text-gray-800 dark:text-slate-200">{invoice.customerName}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-slate-400 font-semibold">Salesperson:</p>
                            <p className="text-lg text-gray-800 dark:text-slate-200">{salesperson}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Items</h3>
                        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Product</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Unit Price</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {invoice.items.map(item => (
                                        <tr key={item.productId}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{item.productName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-700 dark:text-slate-300">{item.quantity}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-slate-400">${item.unitPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-slate-200">${item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2 text-sm">
                            <div className="flex justify-between text-gray-700 dark:text-slate-300">
                                <span>Subtotal:</span>
                                <span>${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-slate-300">
                                <span>Discount:</span>
                                <span>-${invoice.discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-slate-300">
                                <span>Tax ({invoice.taxRate}%):</span>
                                <span>${invoice.tax.toFixed(2)}</span>
                            </div>
                            <hr className="border-gray-300 dark:border-slate-600 !my-3" />
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                <span>Total:</span>
                                <span className="text-green-600 dark:text-green-400">${invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};