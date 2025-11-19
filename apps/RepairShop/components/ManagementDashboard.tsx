import React, { useState } from 'react';
import { User } from '../../../types';
import { AuditLogEntry, Invoice, RepairTicket, Product, StockReceiveLog } from '../types';
import { ChartPieIcon, DocumentTextIcon } from '../../../components/icons';
import { ReportsDashboard } from './reports/ReportsDashboard';
import { AuditLogView } from './management/AuditLogView';
import { SalesRevenueReport } from './reports/SalesRevenueReport';
import { BestSellingProductsReport } from './reports/BestSellingProductsReport';
import { RepairWarrantyVolumeReport } from './reports/RepairWarrantyVolumeReport';
import { SalesByEmployeeReport } from './reports/SalesByEmployeeReport';
import { InventoryReport } from './reports/InventoryReport';
import { ExportDataModal } from './reports/ExportDataModal';
import { useTranslation } from '../../../lib/i18n';


interface ManagementDashboardProps {
    allUsers: User[];
    auditLogs: AuditLogEntry[];
    invoices: Invoice[];
    repairTickets: RepairTicket[];
    products: Product[];
    stockReceiveLogs: StockReceiveLog[];
}

type ManagementView = 'reports-dashboard' | 'audit' | 'reports-sales-revenue' | 'reports-best-selling' | 'reports-repair-volume' | 'reports-sales-employee' | 'reports-inventory';

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ allUsers, auditLogs, invoices, repairTickets, products, stockReceiveLogs }) => {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState<ManagementView>('reports-dashboard');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const navItems = [
        { id: 'reports-dashboard', label: t('repairShop.management.reportsDashboard'), icon: <ChartPieIcon className="w-5 h-5 mr-3" /> },
        { id: 'audit', label: t('repairShop.management.auditLog'), icon: <DocumentTextIcon className="w-5 h-5 mr-3" /> },
    ];

    const handleSelectReport = (reportId: string) => {
        if (reportId === 'export-data') {
            setIsExportModalOpen(true);
        } else {
            setActiveView(`reports-${reportId}` as ManagementView);
        }
    };

    const renderContent = () => {
        switch(activeView) {
            case 'reports-dashboard':
                return <ReportsDashboard onSelectReport={handleSelectReport} />;
            case 'audit':
                return <AuditLogView auditLogs={auditLogs} allUsers={allUsers} />;
            case 'reports-sales-revenue':
                return <SalesRevenueReport 
                    invoices={invoices}
                    repairTickets={repairTickets}
                    products={products}
                    onBack={() => setActiveView('reports-dashboard')}
                />;
            case 'reports-best-selling':
                return <BestSellingProductsReport
                    invoices={invoices}
                    repairTickets={repairTickets}
                    products={products}
                    onBack={() => setActiveView('reports-dashboard')}
                />;
            case 'reports-repair-volume':
                return <RepairWarrantyVolumeReport
                    repairTickets={repairTickets}
                    onBack={() => setActiveView('reports-dashboard')}
                />;
            case 'reports-sales-employee':
                return <SalesByEmployeeReport
                    invoices={invoices}
                    allUsers={allUsers}
                    products={products}
                    onBack={() => setActiveView('reports-dashboard')}
                />;
            case 'reports-inventory':
                return <InventoryReport
                    products={products}
                    onBack={() => setActiveView('reports-dashboard')}
                />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('repairShop.management.menuTitle')}</h2>
                        <nav className="space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as ManagementView)}
                                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                                        (activeView === item.id || (item.id === 'reports-dashboard' && activeView.startsWith('reports-')))
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>
                <main className="flex-grow min-w-0">
                    {renderContent()}
                </main>
            </div>
            {isExportModalOpen && (
                <ExportDataModal 
                    invoices={invoices}
                    repairTickets={repairTickets}
                    stockReceiveLogs={stockReceiveLogs}
                    products={products}
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}
        </>
    );
};