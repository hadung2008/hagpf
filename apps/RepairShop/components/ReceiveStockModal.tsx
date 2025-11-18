
import React, { useState } from 'react';
import { Product } from '../types';
import { XMarkIcon } from '../../../components/icons';

interface ReceiveStockModalProps {
    products: Product[];
    onClose: () => void;
    onSave: (productId: string, quantity: number) => void;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({ products, onClose, onSave }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || quantity <= 0) {
            alert('Please select a product and enter a valid quantity.');
            return;
        }
        onSave(selectedProductId, quantity);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Receive Stock</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Product</label>
                        <select
                            id="product"
                            value={selectedProductId}
                            onChange={e => setSelectedProductId(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200"
                        >
                            <option value="">-- Select a product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Quantity Received</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            required
                            min="1"
                            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Add to Inventory</button>
                </div>
            </form>
        </div>
    );
};
