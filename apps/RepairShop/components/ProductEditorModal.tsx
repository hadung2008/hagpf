
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { XMarkIcon } from '../../../components/icons';

interface ProductEditorModalProps {
    product: Product | null;
    onSave: (product: Product) => void;
    onClose: () => void;
    categories: string[];
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ product, onSave, onClose, categories }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '', category: '', price: 0, costPrice: 0,
        supplier: '', stock: 0, warrantyPeriodInMonths: 0,
    });
    const [markup, setMarkup] = useState<number>(0);

    const isEditing = !!product;

    useEffect(() => {
        const initialData = product || {
            name: '', category: categories[0] || '', price: 0, costPrice: 0,
            supplier: '', stock: 0, warrantyPeriodInMonths: 0,
        };
        
        setFormData({
            name: initialData.name,
            category: initialData.category,
            price: initialData.price,
            costPrice: initialData.costPrice || 0,
            supplier: initialData.supplier || '',
            stock: initialData.stock,
            warrantyPeriodInMonths: initialData.warrantyPeriodInMonths || 0,
        });

        const cost = initialData.costPrice || 0;
        if (cost > 0) {
            const newMarkup = ((initialData.price / cost) - 1) * 100;
            setMarkup(isFinite(newMarkup) ? newMarkup : 0);
        } else {
            setMarkup(0);
        }
    }, [product, categories]);
    
    const handleValueChange = (field: keyof Omit<Product, 'id'> | 'markup', value: string) => {
        const numericValue = parseFloat(value);
        
        setFormData(prevFormData => {
            let newFormData = { ...prevFormData };
            let newMarkup = markup;

            switch (field) {
                case 'markup':
                    newMarkup = isNaN(numericValue) ? 0 : numericValue;
                    if (newFormData.costPrice) {
                        const calculatedPrice = newFormData.costPrice * (1 + newMarkup / 100);
                        newFormData.price = parseFloat(calculatedPrice.toFixed(2));
                    }
                    setMarkup(newMarkup);
                    break;
                case 'costPrice':
                    const newCost = isNaN(numericValue) ? 0 : numericValue;
                    newFormData.costPrice = newCost;
                    const calculatedPriceFromCost = newCost * (1 + markup / 100);
                    newFormData.price = parseFloat(calculatedPriceFromCost.toFixed(2));
                    break;
                case 'price':
                    const newPrice = isNaN(numericValue) ? 0 : numericValue;
                    newFormData.price = newPrice;
                    if (newFormData.costPrice && newFormData.costPrice > 0) {
                        const calculatedMarkup = ((newPrice / newFormData.costPrice) - 1) * 100;
                        setMarkup(isFinite(calculatedMarkup) ? calculatedMarkup : 0);
                    } else {
                        setMarkup(0);
                    }
                    break;
                case 'name':
                case 'category':
                case 'supplier':
                     (newFormData as any)[field] = value;
                     break;
                default:
                    (newFormData as any)[field] = isNaN(numericValue) ? 0 : numericValue;
            }
            return newFormData;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Product name is required.');
            return;
        }
        onSave({
            id: product?.id || `prod-${Date.now()}`,
            ...formData,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={(e) => handleValueChange('name', e.target.value)} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={(e) => handleValueChange('category', e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Cost Price ($)</label>
                            <input type="number" name="costPrice" value={formData.costPrice} onChange={(e) => handleValueChange('costPrice', e.target.value)} min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Markup (%)</label>
                            <input type="number" name="markup" value={markup.toFixed(2)} onChange={(e) => handleValueChange('markup', e.target.value)} step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Selling Price ($)</label>
                            <input type="number" name="price" value={formData.price.toFixed(2)} onChange={(e) => handleValueChange('price', e.target.value)} required min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Stock Quantity</label>
                            <input type="number" name="stock" value={formData.stock} onChange={(e) => handleValueChange('stock', e.target.value)} required min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Supplier</label>
                            <input type="text" name="supplier" value={formData.supplier || ''} onChange={(e) => handleValueChange('supplier', e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Warranty (Months)</label>
                            <input type="number" name="warrantyPeriodInMonths" value={formData.warrantyPeriodInMonths || 0} onChange={(e) => handleValueChange('warrantyPeriodInMonths', e.target.value)} min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Save Product</button>
                </div>
            </form>
        </div>
    );
};
