import React, { useState } from 'react';
import { Product, StockReceiveItem, StockReceiveLog } from '../types';
import { User } from '../../../types';
import { ReceiveStock } from './ReceiveStock';
import { ProductAndCategoryManagement } from './ProductAndCategoryManagement';
import { useTranslation } from '../../../lib/i18n';

interface InventoryDashboardProps {
    products: Product[];
    onSaveProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onReceiveStock: (items: StockReceiveItem[], supplier?: string, notes?: string) => void;
    categories: string[];
    onSaveCategory: (oldName: string | null, newName: string) => void;
    onDeleteCategory: (name: string) => void;
    stockReceiveLogs: StockReceiveLog[];
    allUsers: User[];
}

type InventoryTab = 'receive' | 'products-categories';

export const InventoryDashboard: React.FC<InventoryDashboardProps> = (props) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<InventoryTab>('products-categories');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products-categories':
                return <ProductAndCategoryManagement
                    products={props.products}
                    categories={props.categories}
                    onSaveProduct={props.onSaveProduct}
                    onDeleteProduct={props.onDeleteProduct}
                    onSaveCategory={props.onSaveCategory}
                    onDeleteCategory={props.onDeleteCategory}
                />;
            case 'receive':
                return <ReceiveStock
                    products={props.products}
                    onReceiveStock={props.onReceiveStock}
                    stockReceiveLogs={props.stockReceiveLogs}
                    allUsers={props.allUsers}
                    categories={props.categories}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <button onClick={() => setActiveTab('products-categories')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'products-categories' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                        {t('repairShop.inventory.productsCategoriesTab')}
                    </button>
                     <button onClick={() => setActiveTab('receive')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'receive' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                        {t('repairShop.inventory.receiveStockTab')}
                    </button>
                </div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};