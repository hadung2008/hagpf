import React, { useState, useMemo } from 'react';
import { Product, Customer, InvoiceItem, Invoice } from '../types';
import { CustomerModal } from './CustomerModal';
import { PaymentModal } from './PaymentModal';
import { ShoppingCartIcon, TrashIcon, PlusIcon, XCircleIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface SalesPOSProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    onCheckout: (invoice: Omit<Invoice, 'id' | 'salespersonId' | 'date'>) => void;
    categories: string[];
}

export const SalesPOS: React.FC<SalesPOSProps> = ({ products, setProducts, customers, setCustomers, onCheckout, categories }) => {
    const { t } = useTranslation();
    const [cart, setCart] = useState<InvoiceItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(8); // Default 8%
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const filterableCategories = useMemo(() => [t('general.all'), ...categories], [categories, t]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (categoryFilter === t('general.all') || p.category === categoryFilter)
        );
    }, [products, searchTerm, categoryFilter, t]);

    const addToCart = (productToAdd: Product) => {
        const currentProductState = products.find(p => p.id === productToAdd.id);
        if (!currentProductState || currentProductState.stock <= 0) {
            alert(t('repairShop.sales.alertOutOfStock'));
            return;
        }

        const existingItem = cart.find(item => item.productId === productToAdd.id);
        if (existingItem) {
            setCart(prevCart => prevCart.map(item => 
                item.productId === productToAdd.id 
                ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice } 
                : item
            ));
        } else {
            setCart(prevCart => [...prevCart, {
                productId: productToAdd.id,
                productName: productToAdd.name,
                quantity: 1,
                unitPrice: productToAdd.price,
                total: productToAdd.price
            }]);
        }

        // Decrement stock in parent state
        setProducts(prevProducts => prevProducts.map(p => 
            p.id === productToAdd.id ? { ...p, stock: p.stock - 1 } : p
        ));
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        const cartItem = cart.find(item => item.productId === productId);
        if (!cartItem) return;

        const quantityChange = newQuantity - cartItem.quantity;

        if (quantityChange > 0) { // Increasing quantity
            const product = products.find(p => p.id === productId);
            if (!product || product.stock < quantityChange) {
                alert(t('repairShop.sales.alertNoMoreStock'));
                return;
            }
        }
        
        // Adjust stock in parent state
        setProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, stock: p.stock - quantityChange } : p
        ));

        // Update or remove from cart
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(item => item.productId !== productId));
        } else {
            setCart(prev => prev.map(item => 
                item.productId === productId 
                ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
                : item
            ));
        }
    };
    
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);
    const tax = useMemo(() => (subtotal - Math.min(subtotal, discount)) * (taxRate / 100), [subtotal, discount, taxRate]);
    const total = useMemo(() => subtotal - Math.min(subtotal, discount) + tax, [subtotal, discount, tax]);

    const handleClearCart = () => {
        // Restore stock for all items in the cart
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            cart.forEach(cartItem => {
                const productIndex = newProducts.findIndex(p => p.id === cartItem.productId);
                if (productIndex !== -1) {
                    newProducts[productIndex].stock += cartItem.quantity;
                }
            });
            return newProducts;
        });

        // Clear cart and discount
        setCart([]);
        setDiscount(0);
    }

    const handleSaveCustomer = (newCustomer: Customer) => {
        setCustomers(prev => [...prev, newCustomer]);
        setSelectedCustomerId(newCustomer.id);
        setIsCustomerModalOpen(false);
    };

    const handleConfirmPayment = () => {
        if (!selectedCustomerId) {
            alert(t('repairShop.sales.alertSelectCustomer'));
            return;
        }
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) return;

        const finalDiscount = Math.min(subtotal, discount);

        const invoiceData = {
            customerId: customer.id,
            customerName: customer.name,
            items: cart,
            subtotal,
            discount: finalDiscount,
            taxRate: taxRate,
            tax,
            total,
        };
        
        onCheckout(invoiceData);
        // Reset the POS after a successful sale. Stock is not restored as it's now sold.
        setCart([]);
        setDiscount(0);
        setSelectedCustomerId('');
        setIsPaymentModalOpen(false);
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full lg:h-[calc(100vh-220px)]">
            {/* Products Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg flex flex-col overflow-hidden h-[50vh] lg:h-full">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 space-y-4">
                    <div className="flex justify-between items-center">
                        <input 
                            type="text"
                            placeholder={t('repairShop.sales.searchPlaceholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                        {filterableCategories.map(cat => (
                            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-50 dark:bg-slate-800">
                    {filteredProducts.map(product => {
                        const isOutOfStock = product.stock <= 0;
                        return (
                            <div key={product.id} className="group relative">
                                <button 
                                    onClick={() => addToCart(product)} 
                                    disabled={isOutOfStock} 
                                    className={`w-full h-full text-left bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg flex flex-col overflow-hidden transition-all duration-200 ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1'}`}
                                >
                                    <div className="h-24 bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                        <ShoppingCartIcon className="w-8 h-8 text-gray-400 dark:text-slate-500"/>
                                    </div>
                                    <div className="p-3 flex-grow flex flex-col">
                                        <p className="font-bold text-gray-800 dark:text-slate-200 text-sm flex-grow">{product.name}</p>
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{t('repairShop.inventory.stockStatus', { stock: product.stock })}</p>
                                            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </button>
                                {isOutOfStock && (
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                        <span className="text-white font-bold bg-red-600 px-3 py-1 rounded-md">{t('repairShop.sales.outOfStock')}</span>
                                     </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Cart Panel */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg flex flex-col overflow-hidden h-full">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center"><ShoppingCartIcon className="w-6 h-6 mr-2"/> {t('repairShop.sales.currentSale')}</h3>
                        {cart.length > 0 && 
                            <button onClick={handleClearCart} className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center">
                                <XCircleIcon className="w-4 h-4 mr-1"/> {t('repairShop.sales.clearCart')}
                            </button>
                        }
                    </div>
                     <div className="flex space-x-2">
                        <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="flex-grow bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-800 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">{t('repairShop.sales.selectCustomer')}</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={() => setIsCustomerModalOpen(true)} className="p-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500" title={t('repairShop.sales.addCustomerTooltip')}>
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {cart.length === 0 ? (
                         <div className="text-center text-gray-500 dark:text-slate-400 flex flex-col items-center justify-center h-full">
                            <ShoppingCartIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4"/>
                            <p className="font-semibold">{t('repairShop.sales.cartEmptyTitle')}</p>
                            <p className="text-sm">{t('repairShop.sales.cartEmptySubtitle')}</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.productId} className="flex items-center bg-gray-100 dark:bg-slate-700/50 p-2 rounded-md">
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-gray-800 dark:text-slate-200 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">${item.unitPrice.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center mx-2">
                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 bg-gray-200 dark:bg-slate-600 rounded-l-md hover:bg-gray-300 dark:hover:bg-slate-500">-</button>
                                <span className="w-10 h-7 text-center leading-7 bg-white dark:bg-slate-800 font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 bg-gray-200 dark:bg-slate-600 rounded-r-md hover:bg-gray-300 dark:hover:bg-slate-500">+</button>
                            </div>
                            <p className="w-20 text-right font-medium text-sm text-gray-800 dark:text-slate-200">${item.total.toFixed(2)}</p>
                            <button onClick={() => updateQuantity(item.productId, 0)} className="ml-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                {cart.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3 flex-shrink-0 bg-gray-50 dark:bg-slate-900/50">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-slate-300"><span>{t('repairShop.sales.subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between items-center text-sm text-gray-700 dark:text-slate-300">
                            <label htmlFor="discount" className="cursor-pointer">{t('repairShop.sales.discount')}</label>
                            <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input id="discount" type="number" value={discount} onChange={e => setDiscount(Math.min(subtotal, Math.max(0, Number(e.target.value))))} className="w-24 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-md p-1 text-right text-indigo-600 dark:text-indigo-300 font-semibold" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-700 dark:text-slate-300">
                            <label htmlFor="taxRate" className="cursor-pointer">{t('repairShop.sales.tax')}</label>
                            <div className="flex items-center">
                                <input id="taxRate" type="number" value={taxRate} onChange={e => setTaxRate(Math.max(0, Number(e.target.value)))} className="w-16 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-md p-1 text-right text-indigo-600 dark:text-indigo-300 font-semibold" />
                                <span className="ml-2 w-20 text-right">${tax.toFixed(2)}</span>
                            </div>
                        </div>
                        <hr className="border-gray-200 dark:border-slate-700"/>
                        <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white items-baseline"><span>{t('repairShop.sales.total')}</span><span className="text-green-600 dark:text-green-400">${total.toFixed(2)}</span></div>
                        <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0 || !selectedCustomerId} className="w-full mt-2 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                            {t('repairShop.sales.payNow')}
                        </button>
                    </div>
                )}
            </div>

            {isCustomerModalOpen && (
                <CustomerModal
                    onClose={() => setIsCustomerModalOpen(false)}
                    onSave={handleSaveCustomer}
                />
            )}
             {isPaymentModalOpen && (
                <PaymentModal
                    total={total}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </div>
    );
};