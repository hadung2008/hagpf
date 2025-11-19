import React, { useState, useMemo } from 'react';
import { Invoice, RepairTicket, Product } from '../../types';
import { ArrowUturnLeftIcon, TagIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface BestSellingProductsReportProps {
    invoices: Invoice[];
    repairTickets: RepairTicket[];
    products: Product[];
    onBack: () => void;
}

const filterDataByTime = (data: (Invoice | RepairTicket)[], dateKey: 'date' | 'dateReceived', period: string): any[] => {
    const now = new Date();
    let startDate = new Date(0); 

    switch(period) {
        case '7d': startDate = new Date(new Date().setDate(now.getDate() - 7)); break;
        case '30d': startDate = new Date(new Date().setDate(now.getDate() - 30)); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        case 'all': default: break;
    }
    
    startDate.setHours(0, 0, 0, 0);
    return data.filter(item => new Date(item[dateKey]!) >= startDate);
};

export const BestSellingProductsReport: React.FC<BestSellingProductsReportProps> = ({ invoices, repairTickets, products, onBack }) => {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState('30d');

    const productMap = useMemo(() => new Map<string, Product>(products.map(p => [p.id, p])), [products]);

    const reportData = useMemo(() => {
        const filteredInvoices = filterDataByTime(invoices, 'date', timeFilter);
        const filteredRepairs = filterDataByTime(repairTickets, 'dateReceived', timeFilter);

        const productSales: Record<string, { name: string, quantity: number, revenue: number, profit: number }> = {};
        for (const invoice of filteredInvoices) {
            for (const item of invoice.items) {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0, profit: 0 };
                }
                const product = productMap.get(item.productId);
                const cost = product?.costPrice || 0;
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.total;
                productSales[item.productId].profit += (item.unitPrice - cost) * item.quantity;
            }
        }

        const partUsage: Record<string, { name: string, quantity: number, profit: number }> = {};
        for (const ticket of filteredRepairs) {
            for (const part of ticket.partsUsed || []) {
                const product = productMap.get(part.productId);
                if (!product) continue;
                
                if (!partUsage[part.productId]) {
                     partUsage[part.productId] = { name: product.name, quantity: 0, profit: 0 };
                }
                const cost = product.costPrice || 0;
                partUsage[part.productId].quantity += part.quantity;
                partUsage[part.productId].profit += (part.unitPrice - cost) * part.quantity;
            }
        }
        
        const topSellingProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
        const mostUsedParts = Object.values(partUsage).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
        
        return { topSellingProducts, mostUsedParts };
    }, [invoices, repairTickets, timeFilter, productMap]);

    const timeFilters = [
        { id: '7d', label: t('repairShop.reports.last7Days') }, { id: '30d', label: t('repairShop.reports.last30Days') },
        { id: 'year', label: t('repairShop.reports.thisYear') }, { id: 'all', label: t('repairShop.reports.allTime') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('repairShop.reports.backBtn')}>
                        <ArrowUturnLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.bestSellingTitle')} & Parts</h1>
                </div>
                 <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-1 flex self-stretch sm:self-center">
                    {timeFilters.map(filter => (
                        <button key={filter.id} onClick={() => setTimeFilter(filter.id)} className={`px-3 py-1 text-sm font-semibold rounded-md grow sm:grow-0 ${timeFilter === filter.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 overflow-hidden">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('repairShop.reports.top10Products')}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                             <thead className="bg-gray-50 dark:bg-slate-700/50"><tr><th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.productHeader')}</th><th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.unitsSoldHeader')}</th><th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.totalProfitHeader')}</th><th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.revenueHeader')}</th></tr></thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {reportData.topSellingProducts.map(p => (<tr key={p.name}>
                                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-slate-200 whitespace-nowrap">{p.name}</td>
                                    <td className="py-2 px-4 text-sm text-right font-bold text-gray-700 dark:text-slate-300">{p.quantity}</td>
                                    <td className="py-2 px-4 text-sm text-right text-teal-600 dark:text-teal-400">${p.profit.toFixed(2)}</td>
                                    <td className="py-2 px-4 text-sm text-right text-green-600 dark:text-green-400">${p.revenue.toFixed(2)}</td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 overflow-hidden">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('repairShop.reports.top10Parts')}</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50"><tr><th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.partHeader')}</th><th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.unitsUsedHeader')}</th><th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('repairShop.reports.totalProfitHeader')}</th></tr></thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                               {reportData.mostUsedParts.map(p => (<tr key={p.name}>
                                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-slate-200 whitespace-nowrap">{p.name}</td>
                                    <td className="py-2 px-4 text-sm text-right font-bold text-gray-700 dark:text-slate-300">{p.quantity}</td>
                                    <td className="py-2 px-4 text-sm text-right text-teal-600 dark:text-teal-400">${p.profit.toFixed(2)}</td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};