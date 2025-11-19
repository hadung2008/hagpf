import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

// Combined Props
interface ProductAndCategoryManagementProps {
    products: Product[];
    categories: string[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onSaveCategory: (oldName: string | null, newName: string) => void;
    onDeleteCategory: (name: string) => void;
}

// Product Editor Component
const ProductEditor: React.FC<{
    product: Product | null;
    onSave: (product: Product) => void;
    onCancel: () => void;
    categories: string[];
}> = ({ product, onSave, onCancel, categories }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'stock'>>({
        name: '', category: '', price: 0, costPrice: 0,
        supplier: '', warrantyPeriodInMonths: 0,
    });
    const [markup, setMarkup] = useState<number>(0);

    const isEditing = !!product;

    useEffect(() => {
        const initialData = product || {
            name: '', category: categories.length > 0 ? categories[0] : '', price: 0, costPrice: 0,
            supplier: '', warrantyPeriodInMonths: 0,
        };

        const { stock, ...editableData } = initialData as Product;
        setFormData({
            name: editableData.name,
            category: editableData.category,
            price: editableData.price,
            costPrice: editableData.costPrice || 0,
            supplier: editableData.supplier || '',
            warrantyPeriodInMonths: editableData.warrantyPeriodInMonths || 0,
        });

        const cost = editableData.costPrice || 0;
        if (cost > 0) {
            const newMarkup = ((editableData.price / cost) - 1) * 100;
            setMarkup(isFinite(newMarkup) ? newMarkup : 0);
        } else {
            setMarkup(0);
        }
    }, [product, categories]);

    const handleValueChange = (field: keyof Omit<Product, 'id' | 'stock'> | 'markup', value: string) => {
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
            alert(t('repairShop.products.editor.alertNameRequired'));
            return;
        }
        onSave({
            id: product?.id || `prod-${Date.now()}`,
            stock: product?.stock || 0, // Preserve existing stock or default to 0
            ...formData
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-700 space-y-6">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? t('repairShop.products.editor.editTitle') : t('repairShop.products.editor.addTitle')}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.nameLabel')}</label>
                    <input type="text" name="name" value={formData.name} onChange={e => handleValueChange('name', e.target.value)} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.categoryLabel')}</label>
                    <select name="category" value={formData.category} onChange={e => handleValueChange('category', e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.costPriceLabel')}</label>
                    <input type="number" name="costPrice" value={formData.costPrice} onChange={e => handleValueChange('costPrice', e.target.value)} min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.markupLabel')}</label>
                    <input type="number" name="markup" value={markup.toFixed(2)} onChange={e => handleValueChange('markup', e.target.value)} step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.sellingPriceLabel')}</label>
                    <input type="number" name="price" value={formData.price.toFixed(2)} onChange={e => handleValueChange('price', e.target.value)} required min="0" step="0.01" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.supplierLabel')}</label>
                    <input type="text" name="supplier" value={formData.supplier || ''} onChange={e => handleValueChange('supplier', e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.products.editor.warrantyLabel')}</label>
                    <input type="number" name="warrantyPeriodInMonths" value={formData.warrantyPeriodInMonths || 0} onChange={e => handleValueChange('warrantyPeriodInMonths', e.target.value)} min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                </div>
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">{t('general.cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">{t('repairShop.products.editor.saveBtn')}</button>
            </div>
        </form>
    );
};

// Main Combined Component
export const ProductAndCategoryManagement: React.FC<ProductAndCategoryManagementProps> = ({
    products, categories, onSaveProduct, onDeleteProduct, onSaveCategory, onDeleteCategory
}) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ oldName: string, newName: string } | null>(null);

    const filterableCategories = useMemo(() => [t('general.all'), ...categories], [categories, t]);

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === t('general.all') || p.category === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter, t]);

    const handleNewProduct = () => { setEditingProduct(null); setView('editor'); };
    const handleEditProduct = (product: Product) => { setEditingProduct(product); setView('editor'); };
    const handleSaveProductAndSwitchView = (product: Product) => { onSaveProduct(product); setView('list'); };
    const handleCancelProductEdit = () => { setView('list'); setEditingProduct(null); };

    const handleAddNewCategory = (e: React.FormEvent) => { e.preventDefault(); onSaveCategory(null, newCategoryName); setNewCategoryName(''); };
    const handleStartEditCategory = (name: string) => { setEditingCategory({ oldName: name, newName: name }); };
    const handleCancelEditCategory = () => { setEditingCategory(null); };
    const handleSaveEditCategory = () => { if (editingCategory) { onSaveCategory(editingCategory.oldName, editingCategory.newName); setEditingCategory(null); } };

    const isLowStock = (stock: number) => stock <= 5;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {view === 'editor' ? (
                    <ProductEditor product={editingProduct} onSave={handleSaveProductAndSwitchView} onCancel={handleCancelProductEdit} categories={categories} />
                ) : (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('repairShop.products.title')}</h2>
                            <button onClick={handleNewProduct} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                                <PlusIcon className="w-5 h-5 mr-2 -ml-1" /> {t('repairShop.products.newProduct')}
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <input type="text" placeholder={t('repairShop.products.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200" />
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200">
                                {filterableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.products.nameHeader')}</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden sm:table-cell">{t('repairShop.products.stockHeader')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden sm:table-cell">{t('repairShop.products.priceHeader')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('general.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">
                                                {product.name}
                                                <dl className="sm:hidden mt-1 text-xs text-gray-500 dark:text-slate-400">
                                                    <dt className="sr-only">Stock</dt>
                                                    <dd className="float-left mr-4">{t('repairShop.products.stockHeader')}: <span className={`font-bold ${isLowStock(product.stock) ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-slate-300'}`}>{product.stock}</span></dd>
                                                    <dt className="sr-only">Price</dt>
                                                    <dd className="float-left">{t('repairShop.products.priceHeader')}: <span className="font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</span></dd>
                                                </dl>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold hidden sm:table-cell">
                                                {isLowStock(product.stock) ? <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 rounded-full">{product.stock} ({t('repairShop.products.lowStock')})</span> : <span className="text-gray-700 dark:text-slate-300">{product.stock}</span>}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:table-cell">${product.price.toFixed(2)}</td>
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
                )}
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('repairShop.categories.title')}</h2>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="p-4">
                        <form onSubmit={handleAddNewCategory} className="flex space-x-2">
                            <input
                                type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                                placeholder={t('repairShop.categories.addNewPlaceholder')}
                                className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" required
                            />
                            <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                                <PlusIcon className="w-5 h-5 mr-2 -ml-1" /> {t('general.add')}
                            </button>
                        </form>
                    </div>
                    <ul className="space-y-2 p-4">
                        {categories.map(cat => (
                            <li key={cat} className="flex items-center justify-between bg-white dark:bg-slate-700/50 p-3 rounded-md">
                                {editingCategory?.oldName === cat ? (
                                    <input
                                        type="text" value={editingCategory.newName} onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                        className="flex-grow bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md p-1 text-sm text-gray-900 dark:text-slate-200" autoFocus
                                    />
                                ) : (
                                    <span className="text-gray-800 dark:text-slate-200">{cat}</span>
                                )}
                                <div className="flex items-center space-x-3 ml-4">
                                    {editingCategory?.oldName === cat ? (
                                        <>
                                            <button onClick={handleSaveEditCategory} className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300"><CheckCircleIcon className="w-5 h-5" /></button>
                                            <button onClick={handleCancelEditCategory} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><XCircleIcon className="w-5 h-5" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEditCategory(cat)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onDeleteCategory(cat)} className="text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};