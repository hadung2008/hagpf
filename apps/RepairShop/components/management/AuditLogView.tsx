import React from 'react';
import { AuditLogEntry } from '../../types';
import { User } from '../../../../types';
import { DocumentTextIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface AuditLogViewProps {
    auditLogs: AuditLogEntry[];
    allUsers: User[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs, allUsers }) => {
    const { t } = useTranslation();
    
    const getUserName = (userId: string) => {
        return allUsers.find(u => u.id === userId)?.name.split(' (')[0] || userId;
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('repairShop.management.auditLog')}</h1>
            </div>
            
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.inventory.dateHeader')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rolePermissions.userTab.table.username')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('general.actions')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('repairShop.inventory.detailsHeader')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {auditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{getUserName(log.userId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};