import React from 'react';
import { ChartPieIcon, CurrencyDollarIcon, ServerStackIcon, TagIcon, TicketIcon, UserGroupIcon, ArrowDownTrayIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:border-indigo-500 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-start gap-4">
            <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{description}</p>
            </div>
        </div>
    </div>
);


interface ReportsDashboardProps {
    onSelectReport: (reportId: string) => void;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ onSelectReport }) => {
    const { t } = useTranslation();

    const reports = [
        {
            id: 'sales-revenue',
            title: t('repairShop.reports.salesRevenueTitle'),
            description: t('repairShop.reports.salesRevenueDesc'),
            icon: <CurrencyDollarIcon className="w-8 h-8 text-green-500 dark:text-green-400" />
        },
        {
            id: 'best-selling',
            title: t('repairShop.reports.bestSellingTitle'),
            description: t('repairShop.reports.bestSellingDesc'),
            icon: <TagIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        },
        {
            id: 'repair-volume',
            title: t('repairShop.reports.repairVolumeTitle'),
            description: t('repairShop.reports.repairVolumeDesc'),
            icon: <TicketIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
        },
        {
            id: 'sales-employee',
            title: t('repairShop.reports.salesEmployeeTitle'),
            description: t('repairShop.reports.salesEmployeeDesc'),
            icon: <UserGroupIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        },
        {
            id: 'inventory',
            title: t('repairShop.reports.inventoryTitle'),
            description: t('repairShop.reports.inventoryDesc'),
            icon: <ServerStackIcon className="w-8 h-8 text-purple-500 dark:text-purple-400" />
        },
        {
            id: 'export-data',
            title: t('repairShop.reports.exportDataTitle'),
            description: t('repairShop.reports.exportDataDesc'),
            icon: <ArrowDownTrayIcon className="w-8 h-8 text-gray-500 dark:text-slate-400" />
        },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <ChartPieIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.reports.title')}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <ReportCard 
                        key={report.id} 
                        {...report} 
                        onClick={() => onSelectReport(report.id)}
                    />
                ))}
            </div>
        </div>
    );
};