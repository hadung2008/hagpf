import React, { useState, useMemo } from 'react';
import { Invoice, Product } from '../../types';
import { User } from '../../../../types';
import { ArrowUturnLeftIcon, UserGroupIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface SalesByEmployeeReportProps {
    invoices: Invoice[];
    allUsers: User[];
    products: Product[];
    onBack: () => void;
}

const filterDataByTime = (data: Invoice[], period: string): Invoice[] => {
    const now = new Date();
    let startDate = new Date(0);

    switch(period) {
        case '7d': startDate = new Date(new Date().setDate(now.getDate() - 7)); break;
        case '30d': startDate = new Date(new Date().setDate(now.getDate() - 30)); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        case 'all': default: break;
    }
    
    startDate.setHours(0, 0, 0, 0);
    return data.filter(item => new Date(item.date) >= startDate);
};

export const SalesByEmployeeReport: React.FC<SalesByEmployeeReportProps> = ({ invoices, allUsers, products, onBack }) => {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState('30d');
    
    const productMap = useMemo(() => new Map<string, Product>(products.map(p => [p.id, p])), [products]);

    const reportData = useMemo(() => {
        const filteredInvoices = filterDataByTime(invoices, timeFilter);
        const salesByEmployee: Record<string, { name: string, totalRevenue: number, salesCount: number, totalProfit: number }> = {};

        for (const invoice of filteredInvoices) {
            if (!salesByEmployee[invoice.salespersonId]) {
                 const employeeName = allUsers.find(u => u.id === invoice.salespersonId)?.name.split(' (')[0] || 'Unknown';
                 salesByEmployee[invoice.salespersonId] = { name: employeeName, totalRevenue: 0, salesCount: 0, totalProfit: 0 };
            }
            
            const invoiceProfit = invoice.items.reduce((profit, item) => {
                const product = productMap.get(item.productId);
                const cost = product?.costPrice || 0;
                return profit + ((item.unitPrice - cost) * item.quantity);
            }, 0);

            salesByEmployee[invoice.salespersonId].totalRevenue += invoice.total;
            salesByEmployee[invoice.salespersonId].salesCount++;
            salesByEmployee[invoice.salespersonId].totalProfit += invoiceProfit;
        }
        
        return Object.values(salesByEmployee).map(emp => ({
            ...emp,
            averageSaleValue: emp.salesCount > 0 ? emp.totalRevenue / emp.salesCount : 0
        })).sort((a,b) => b.totalRevenue - a.totalRevenue);

    }, [invoices, allUsers, timeFilter, productMap]);

    const timeFilters = [
        { id: '7d', label: t('repairShop.reports.last7Days') }, { id: '30d', label: t('repairShop.reports.last30Days') },
        { id: 'year', label: t('repairShop.reports.thisYear') }, { id: 'all', label: t('repairShop.reports.allTime') },
    ];
    
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('repairShop.reports.backBtn')}>
                        <ArrowUturnLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.salesEmployeeTitle')}</h1>
                </div>
                 <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-1 flex">
                    {timeFilters.map(filter => (
                        <button key={filter.id} onClick={() => setTimeFilter(filter.id)} className={`px-3 py-1 text-sm font-semibold rounded-md ${timeFilter === filter.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

             <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.employeeHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.totalProfitHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.totalRevenueHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.salesCountHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.avgSaleValueHeader')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {reportData.length > 0 ? reportData.map(row => (
                            <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{row.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-teal-600 dark:text-teal-400">${row.totalProfit.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400">${row.totalRevenue.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-slate-300">{row.salesCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-slate-300">${row.averageSaleValue.toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-500 dark:text-slate-400">{t('repairShop.reports.noSalesData')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};