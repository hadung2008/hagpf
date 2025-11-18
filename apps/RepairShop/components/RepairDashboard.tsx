import React, { useState, useMemo } from 'react';
import { RepairTicket, Customer } from '../types';
import { PlusIcon, PencilIcon, QrCodeIcon } from '../../../components/icons';
import { RepairStatusBadge } from './StatusBadge';
import { useTranslation } from '../../../lib/i18n';

interface RepairDashboardProps {
    tickets: RepairTicket[];
    customers: Customer[];
    onEditTicket: (ticketId: string) => void;
    onNewTicket: () => void;
    onShowStatus: (ticketId: string) => void;
}

export const RepairDashboard: React.FC<RepairDashboardProps> = ({ tickets, customers, onEditTicket, onNewTicket, onShowStatus }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

    const filteredTickets = useMemo(() => {
        if (!searchTerm.trim()) {
            return tickets;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return tickets.filter(ticket => {
            const customerName = customerMap.get(ticket.customerId)?.toLowerCase() || '';
            return (
                ticket.id.toLowerCase().includes(lowercasedFilter) ||
                customerName.includes(lowercasedFilter) ||
                ticket.deviceModel.toLowerCase().includes(lowercasedFilter) ||
                ticket.deviceSerial.toLowerCase().includes(lowercasedFilter)
            );
        });
    }, [tickets, searchTerm, customerMap]);


    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('repairShop.dashboard.title')}</h2>
                 <input
                    type="text"
                    placeholder={t('repairShop.dashboard.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-gray-900 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button onClick={onNewTicket} className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                    {t('repairShop.dashboard.newTicket')}
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.idHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.customerHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.deviceHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.statusHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.dashboard.dateHeader')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">{ticket.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">{customerMap.get(ticket.customerId) || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{ticket.deviceModel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <RepairStatusBadge status={ticket.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(ticket.dateReceived).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onShowStatus(ticket.id)} className="text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 p-1" title={t('repairShop.dashboard.customerViewTooltip')}>
                                        <QrCodeIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onEditTicket(ticket.id)} className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 ml-2" title={t('repairShop.dashboard.editTooltip')}>
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTickets.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-slate-500">
                        <p>{t('repairShop.dashboard.noTickets')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};