
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../../../components/icons';

interface ProductManagementProps {
    products: Product[];
    categories: string[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
}

const ProductEditor: React.FC<{
    product: Product | null;
    onSave: (product: Product) => void;
    onCancel: () => void;
    categories: string[];
}> = ({ product, onSave, onCancel, categories }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '', category: categories[0] || '', price: 0, costPrice: 0,
        supplier: '', stock: 0, warrantyPeriodInMonths: 0,
    });

    const isEditing = !!product;

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name, category: product.category, price: product.price,
                costPrice: product.costPrice || 0, supplier: product.supplier || '',
                stock: product.stock, warrantyPeriodInMonths: product.warrantyPeriodInMonths || 0,
            });
        } else {
            setFormData({
                name: '', category: categories[0] || '', price: 0, costPrice: 0,
                supplier: '', stock: 0, warrantyPeriodInMonths: 0,
            });
        }
    }, [product, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['price', 'costPrice', 'stock', 'warrantyPeriodInMonths'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.price <= 0) {
            alert('Product name and a valid price are required.');
            return;
        }
        onSave({ id: product?.id || `prod-${Date.now()}`, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 space-y-6">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Selling Price ($)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Cost Price ($)</label>
                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Stock Quantity</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Supplier</label>
                    <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">Warranty (Months)</label>
                    <input type="number" name="warrantyPeriodInMonths" value={formData.warrantyPeriodInMonths} onChange={handleChange} min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Save Product</button>
            </div>
        </form>
    );
};

export const ProductManagement: React.FC<ProductManagementProps> = ({ products, categories, onSaveProduct, onDeleteProduct }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const filterableCategories = useMemo(() => ['All', ...categories], [categories]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === 'All' || p.category === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter]);
    
    const handleNewProduct = () => {
        setEditingProduct(null);
        setView('editor');
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setView('editor');
    };
    
    const handleSave = (product: Product) => {
        onSaveProduct(product);
        setView('list');
    };

    const handleCancel = () => {
        setView('list');
        setEditingProduct(null);
    };

    if (view === 'editor') {
        return <ProductEditor product={editingProduct} onSave={handleSave} onCancel={handleCancel} categories={categories} />;
    }

    const isLowStock = (stock: number) => stock <= 5;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
                <button onClick={handleNewProduct} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                    New Product
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200"
                />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200">
                    {filterableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Product Name</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Stock</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Sell Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{product.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold">
                                    {isLowStock(product.stock) ? <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 rounded-full">{product.stock} (Low)</span> : <span className="text-gray-700 dark:text-slate-300">{product.stock}</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditProduct(product)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteProduct(product.id)} className="text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 ml-2"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
