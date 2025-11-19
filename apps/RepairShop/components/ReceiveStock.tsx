
import React, { useState, useMemo } from 'react';
import { Product, StockReceiveItem, StockReceiveLog } from '../types';
import { User } from '../../../types';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, XCircleIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface ReceiveStockProps {
    products: Product[];
    onReceiveStock: (items: StockReceiveItem[], supplier?: string, notes?: string) => void;
    stockReceiveLogs: StockReceiveLog[];
    allUsers: User[];
    categories: string[];
}

export const ReceiveStock: React.FC<ReceiveStockProps> = ({ products, onReceiveStock, stockReceiveLogs, allUsers, categories }) => {
    const { t } = useTranslation();
    const [itemsToReceive, setItemsToReceive] = useState<StockReceiveItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [supplier, setSupplier] = useState('');
    const [notes, setNotes] = useState('');
    const [feedback, setFeedback] = useState<string>('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // Modal state
    const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    const filteredProducts = useMemo(() => {
        if (categoryFilter === 'All') {
            return products;
        }
        return products.filter(p => p.category === categoryFilter);
    }, [products, categoryFilter]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryFilter(e.target.value);
        setSelectedProductId('');
    };

    const handleAddItem = () => {
        if (!selectedProductId || quantity <= 0) {
            setErrorModal({ isOpen: true, message: t('repairShop.inventory.alertSelectProduct') });
            return;
        }
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        setItemsToReceive(prev => {
            const existingItemIndex = prev.findIndex(item => item.productId === selectedProductId);
            if (existingItemIndex > -1) {
                // Update quantity if product already in list
                const updatedItems = [...prev];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Add new product to list
                return [...prev, {
                    productId: product.id,
                    productName: product.name,
                    quantity: quantity
                }];
            }
        });
        // Reset form
        setSelectedProductId('');
        setQuantity(1);
    };

    const handleRemoveItem = (productId: string) => {
        setItemsToReceive(prev => prev.filter(item => item.productId !== productId));
    };

    const handleReceiveAll = () => {
        if (itemsToReceive.length === 0) {
            setErrorModal({ isOpen: true, message: t('repairShop.inventory.alertAddItems') });
            return;
        }
        onReceiveStock(itemsToReceive, supplier, notes);
        setFeedback(t('repairShop.inventory.feedbackSuccess', { count: itemsToReceive.length }));
        setItemsToReceive([]);
        setSupplier('');
        setNotes('');
        setTimeout(() => setFeedback(''), 4000);
    };

    const getUserName = (userId: string) => {
        return allUsers.find(u => u.id === userId)?.name.split(' (')[0] || 'Unknown User';
    };

    return (
        <div className="space-y-8">
            {/* Form Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('repairShop.inventory.receiveTitle')}</h2>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-700 space-y-6">
                    {/* Item add form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.inventory.categoryLabel')}</label>
                            <select id="category" value={categoryFilter} onChange={handleCategoryChange} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                <option value="All">{t('repairShop.inventory.allCategories')}</option>
                                {categories.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="product" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.inventory.productLabel')}</label>
                            <select id="product" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                <option value="">{t('repairShop.inventory.selectProduct')}</option>
                                {filteredProducts.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.inventory.quantityLabel')}</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                    </div>
                    <button type="button" onClick={handleAddItem} className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">
                        <PlusIcon className="w-5 h-5 mr-2 -ml-1" /> {t('repairShop.inventory.addToList')}
                    </button>
                    
                    {itemsToReceive.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">{t('repairShop.inventory.receivingList')}</h3>
                            <div className="space-y-2">
                                {itemsToReceive.map(item => (
                                    <div key={item.productId} className="flex items-center justify-between bg-white dark:bg-slate-700/50 p-2 rounded-md">
                                        <span className="text-gray-900 dark:text-slate-200 text-sm truncate pr-2">{item.productName}</span>
                                        <div className="flex items-center flex-shrink-0">
                                            <span className="font-bold mr-4 text-gray-800 dark:text-slate-300 text-sm">{t('repairShop.inventory.qty', { qty: item.quantity })}</span>
                                            <button onClick={() => handleRemoveItem(item.productId)} className="text-gray-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.inventory.supplierLabel')}</label>
                                    <input type="text" id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                                </div>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.inventory.notesLabel')}</label>
                                    <input type="text" id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                                </div>
                            </div>
                            <button onClick={handleReceiveAll} className="w-full mt-6 px-4 py-2 rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700">{t('repairShop.inventory.receiveAll')}</button>
                        </div>
                    )}
                </div>
                 {feedback && <p className="mt-4 text-center text-green-600 dark:text-green-400">{feedback}</p>}
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('repairShop.inventory.historyTitle')}</h2>
                 <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 relative">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                           <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.inventory.dateHeader')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.inventory.receivedByHeader')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden sm:table-cell">{t('repairShop.inventory.supplierHeader')}</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.inventory.totalItemsHeader')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.inventory.detailsHeader')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                {stockReceiveLogs.map(log => (
                                    <React.Fragment key={log.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">{getUserName(log.userId)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">{log.supplier || t('general.na')}</td>
                                            <td className="px-4 py-3 text-sm text-center font-bold text-gray-800 dark:text-slate-200">{log.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                    {expandedLogId === log.id ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="bg-gray-100 dark:bg-slate-900">
                                                <td colSpan={5} className="p-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-gray-700 dark:text-slate-300">{t('repairShop.inventory.logDetails', { id: log.id.slice(-4) })}</h4>
                                                        {log.notes && <p className="text-sm italic text-gray-500 dark:text-slate-400">{t('repairShop.inventory.logNotes', { notes: log.notes })}</p>}
                                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-slate-400">
                                                        {log.items.map(item => (
                                                            <li key={item.productId}>{item.productName} - <strong>{t('repairShop.inventory.qty', { qty: item.quantity })}</strong></li>
                                                        ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* Error/Validation Modal */}
            {errorModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 ring-1 ring-gray-200 dark:ring-slate-700">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {t('general.required')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                {errorModal.message}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 flex justify-center border-t border-gray-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                            >
                                {t('general.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
