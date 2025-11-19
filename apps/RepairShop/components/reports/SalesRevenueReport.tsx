import React, { useState, useMemo } from 'react';
import { Invoice, RepairTicket, RepairStatus, Product } from '../../types';
import { ArrowUturnLeftIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, ChartPieIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface SalesRevenueReportProps {
    invoices: Invoice[];
    repairTickets: RepairTicket[];
    products: Product[];
    onBack: () => void;
}

const filterDataByTime = (data: (Invoice | RepairTicket)[], dateKey: 'date' | 'dateCompleted', period: string): any[] => {
    const now = new Date();
    let startDate = new Date(0); 

    switch(period) {
        case '7d':
            startDate = new Date(new Date().setDate(now.getDate() - 7));
            break;
        case '30d':
            startDate = new Date(new Date().setDate(now.getDate() - 30));
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'all':
        default:
            break;
    }
    
    startDate.setHours(0, 0, 0, 0);

    return data.filter(item => new Date(item[dateKey]!) >= startDate);
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const SalesRevenueReport: React.FC<SalesRevenueReportProps> = ({ invoices, repairTickets, products, onBack }) => {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState('30d');

    const productMap = useMemo(() => new Map<string, Product>(products.map(p => [p.id, p])), [products]);

    const reportData = useMemo(() => {
        const filteredInvoices = filterDataByTime(invoices, 'date', timeFilter);
        const filteredRepairs = filterDataByTime(
            repairTickets.filter(t => t.status === RepairStatus.COMPLETED && t.dateCompleted), 
            'dateCompleted', 
            timeFilter
        );

        const revenueByDate: Record<string, { sales: number, repairs: number, total: number, salesProfit: number, repairProfit: number, totalProfit: number }> = {};

        for (const invoice of filteredInvoices) {
            const date = new Date(invoice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            if (!revenueByDate[date]) {
                revenueByDate[date] = { sales: 0, repairs: 0, total: 0, salesProfit: 0, repairProfit: 0, totalProfit: 0 };
            }

            const invoiceProfit = invoice.items.reduce((profit, item) => {
                const product = productMap.get(item.productId);
                const cost = product?.costPrice || 0;
                return profit + ((item.unitPrice - cost) * item.quantity);
            }, 0);
            
            revenueByDate[date].sales += invoice.total;
            revenueByDate[date].salesProfit += invoiceProfit;
            revenueByDate[date].total += invoice.total;
            revenueByDate[date].totalProfit += invoiceProfit;
        }

        for (const repair of filteredRepairs) {
            const date = new Date(repair.dateCompleted!).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
             if (!revenueByDate[date]) {
                revenueByDate[date] = { sales: 0, repairs: 0, total: 0, salesProfit: 0, repairProfit: 0, totalProfit: 0 };
            }

            const partsProfit = (repair.partsUsed || []).reduce((profit, part) => {
                const product = productMap.get(part.productId);
                const cost = product?.costPrice || 0;
                return profit + ((part.unitPrice - cost) * part.quantity);
            }, 0);
            const repairProfit = partsProfit + (repair.laborCost || 0);

            revenueByDate[date].repairs += repair.totalCost || 0;
            revenueByDate[date].repairProfit += repairProfit;
            revenueByDate[date].total += repair.totalCost || 0;
            revenueByDate[date].totalProfit += repairProfit;
        }

        const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalRepairs = filteredRepairs.reduce((sum, rep) => sum + (rep.totalCost || 0), 0);
        const totalRevenue = totalSales + totalRepairs;
        const totalProfit = Object.values(revenueByDate).reduce((sum, day) => sum + day.totalProfit, 0);

        
        const sortedDates = Object.keys(revenueByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        return {
            dailyBreakdown: sortedDates.map(date => ({ date, ...revenueByDate[date] })),
            totalSales,
            totalRepairs,
            totalRevenue,
            totalProfit,
        };

    }, [invoices, repairTickets, timeFilter, productMap]);

    const timeFilters = [
        { id: '7d', label: t('repairShop.reports.last7Days') },
        { id: '30d', label: t('repairShop.reports.last30Days') },
        { id: 'year', label: t('repairShop.reports.thisYear') },
        { id: 'all', label: t('repairShop.reports.allTime') },
    ];

    const summaryCards = [
        { title: t('repairShop.reports.totalRevenue'), value: formatCurrency(reportData.totalRevenue), icon: <ChartPieIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> },
        { title: t('repairShop.reports.grossProfit'), value: formatCurrency(reportData.totalProfit), icon: <CurrencyDollarIcon className="w-8 h-8 text-teal-500 dark:text-teal-400" /> },
        { title: t('repairShop.reports.totalSales'), value: formatCurrency(reportData.totalSales), icon: <CurrencyDollarIcon className="w-8 h-8 text-green-500 dark:text-green-400" /> },
        { title: t('repairShop.reports.totalRepairIncome'), value: formatCurrency(reportData.totalRepairs), icon: <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400" /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('repairShop.reports.backBtn')}>
                        <ArrowUturnLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.salesRevenueTitle')}</h1>
                </div>
                <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-1 flex self-stretch sm:self-center">
                    {timeFilters.map(filter => (
                        <button key={filter.id} onClick={() => setTimeFilter(filter.id)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors grow sm:grow-0 ${timeFilter === filter.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map(card => (
                    <div key={card.title} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">{card.icon}</div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.dateHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.salesProfitHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.repairProfitHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.totalProfitHeader')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.totalRevenueHeader')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {reportData.dailyBreakdown.length > 0 ? reportData.dailyBreakdown.map(row => (
                                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{row.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-slate-300">{formatCurrency(row.salesProfit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-slate-300">{formatCurrency(row.repairProfit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-teal-600 dark:text-teal-400">{formatCurrency(row.totalProfit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(row.total)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-slate-400">{t('repairShop.reports.noData')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};