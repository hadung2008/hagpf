import React from 'react';
import { RepairStatus } from '../types';
import { useTranslation } from '../../../lib/i18n';

interface RepairStatusBadgeProps {
  status: RepairStatus;
}

const statusStyles: Record<RepairStatus, { bg: string, text: string, dot: string }> = {
  [RepairStatus.PENDING]: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-400', dot: 'bg-yellow-500' },
  [RepairStatus.DIAGNOSING]: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
  [RepairStatus.REPAIRING]: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-800 dark:text-purple-400', dot: 'bg-purple-500' },
  [RepairStatus.WAITING_FOR_PART]: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-800 dark:text-orange-400', dot: 'bg-orange-500' },
  [RepairStatus.COMPLETED]: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-800 dark:text-green-400', dot: 'bg-green-500' },
  [RepairStatus.DELIVERED]: { bg: 'bg-gray-200 dark:bg-slate-500/10', text: 'text-gray-800 dark:text-slate-400', dot: 'bg-slate-500' },
  [RepairStatus.CANCELLED]: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-400', dot: 'bg-red-500' },
};

export const RepairStatusBadge: React.FC<RepairStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();
  const style = statusStyles[status] || statusStyles[RepairStatus.PENDING];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-2 h-2 mr-2 rounded-full ${style.dot}`}></span>
      {t(`repairShop.enums.repairStatus.${status}`)}
    </span>
  );
};