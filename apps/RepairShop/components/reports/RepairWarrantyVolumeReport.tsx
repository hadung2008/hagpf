import React, { useState, useMemo } from 'react';
import { RepairTicket } from '../../types';
import { ArrowUturnLeftIcon, TicketIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface RepairWarrantyVolumeReportProps {
    repairTickets: RepairTicket[];
    onBack: () => void;
}

const filterDataByTime = (data: RepairTicket[], period: string): RepairTicket[] => {
    const now = new Date();
    let startDate = new Date(0);

    switch(period) {
        case '7d': startDate = new Date(new Date().setDate(now.getDate() - 7)); break;
        case '30d': startDate = new Date(new Date().setDate(now.getDate() - 30)); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        case 'all': default: break;
    }
    
    startDate.setHours(0, 0, 0, 0);
    return data.filter(item => new Date(item.dateReceived) >= startDate);
};

export const RepairWarrantyVolumeReport: React.FC<RepairWarrantyVolumeReportProps> = ({ repairTickets, onBack }) => {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState('30d');

    const reportData = useMemo(() => {
        const filteredTickets = filterDataByTime(repairTickets, timeFilter);
        const volumeByDate: Record<string, number> = {};

        for (const ticket of filteredTickets) {
            const date = new Date(ticket.dateReceived).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            if (!volumeByDate[date]) {
                volumeByDate[date] = 0;
            }
            volumeByDate[date]++;
        }

        const sortedDates = Object.keys(volumeByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        return sortedDates.map(date => ({ date, count: volumeByDate[date] }));
    }, [repairTickets, timeFilter]);

     const timeFilters = [
        { id: '7d', label: t('repairShop.reports.last7Days') }, { id: '30d', label: t('repairShop.reports.last30Days') },
        { id: 'year', label: t('repairShop.reports.thisYear') }, { id: 'all', label: t('repairShop.reports.allTime') },
    ];
    
    const totalTickets = reportData.reduce((sum, row) => sum + row.count, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700" title={t('repairShop.reports.backBtn')}>
                        <ArrowUturnLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.repairVolumeTitle')}</h1>
                </div>
                 <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-1 flex self-stretch sm:self-center">
                    {timeFilters.map(filter => (
                        <button key={filter.id} onClick={() => setTimeFilter(filter.id)} className={`px-3 py-1 text-sm font-semibold rounded-md grow sm:grow-0 ${timeFilter === filter.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('repairShop.reports.totalTicketsPeriod')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalTickets}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.dateHeader')}</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.reports.newTicketsHeader')}</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {reportData.length > 0 ? reportData.map(row => (
                            <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{row.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-indigo-600 dark:text-indigo-400">{row.count}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={2} className="text-center py-10 text-gray-500 dark:text-slate-400">{t('repairShop.reports.noNewTickets')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};