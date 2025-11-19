import React, { useMemo } from 'react';
import { Product } from '../../types';
import { ArrowUturnLeftIcon, ServerStackIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface InventoryReportProps {
    products: Product[];
    onBack: () => void;
}

const LOW_STOCK_THRESHOLD = 5;

export const InventoryReport: React.FC<InventoryReportProps> = ({ products, onBack }) => {
    const { t } = useTranslation();

    const reportData = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + (p.costPrice || 0) * p.stock, 0);
        const totalSKUs = products.length;
        const lowStockItems = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
        const potentialProfit = products.reduce((sum, p) => {
            const profitPerItem = p.price - (p.costPrice || 0);
            return sum + (profitPerItem * p.stock);
        }, 0);
        
        return {
            totalValue,
            totalSKUs,
            lowStockItems,
            potentialProfit,
            sortedProducts: [...products].sort((a,b) => (a.costPrice || 0) * a.stock - (b.costPrice || 0) * b.stock)
        };
    }, [products]);

    const summaryCards = [
        { title: t('repairShop.reports.inventoryValue'), value: `$${reportData.totalValue.toFixed(2)}` },
        { title: t('repairShop.reports.potentialProfit'), value: `$${reportData.potentialProfit.toFixed(2)}` },
        { title: t('repairShop.reports.totalSKUs'), value: reportData.totalSKUs },
        { title: t('repairShop.reports.lowStockItems'), value: reportData.lowStockItems },
    ];
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('repairShop.reports.backBtn')}>
                    <ArrowUturnLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.inventoryTitle')}</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {summaryCards.map(card => (
                    <div key={card.title} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                        <p className="text-sm text-gray-500 dark:text-slate-400">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.productHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.stockHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.costPriceHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.potentialProfitHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.totalValueHeader')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {reportData.sortedProducts.map(p => (
                                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${p.stock <= LOW_STOCK_THRESHOLD ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{p.name}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${p.stock <= LOW_STOCK_THRESHOLD ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-slate-300'}`}>{p.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-slate-400">${(p.costPrice || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-teal-600 dark:text-teal-400">${((p.price - (p.costPrice || 0)) * p.stock).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-slate-200">${((p.costPrice || 0) * p.stock).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};