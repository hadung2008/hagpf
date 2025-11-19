

import React from 'react';
import { WorkflowStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from './icons';

interface StatusBadgeProps {
  status: WorkflowStatus;
}

const statusStyles: Record<WorkflowStatus, { bg: string, text: string, icon: React.ReactElement }> = {
  [WorkflowStatus.PENDING_APPROVAL]: { 
    bg: 'bg-yellow-100 dark:bg-yellow-800', 
    text: 'text-yellow-800 dark:text-yellow-200', 
    icon: <ClockIcon className="w-4 h-4 mr-1.5" /> 
  },
  [WorkflowStatus.COMPLETED]: { 
    bg: 'bg-green-100 dark:bg-green-800', 
    text: 'text-green-800 dark:text-green-200', 
    icon: <CheckCircleIcon className="w-4 h-4 mr-1.5" /> 
  },
   [WorkflowStatus.APPROVED]: { 
    bg: 'bg-green-100 dark:bg-green-800', 
    text: 'text-green-800 dark:text-green-200', 
    icon: <CheckCircleIcon className="w-4 h-4 mr-1.5" /> 
  },
  [WorkflowStatus.REJECTED]: { 
    bg: 'bg-red-100 dark:bg-red-800', 
    text: 'text-red-800 dark:text-red-200', 
    icon: <XCircleIcon className="w-4 h-4 mr-1.5" /> 
  },
  [WorkflowStatus.DRAFT]: { 
    bg: 'bg-gray-100 dark:bg-gray-700', 
    text: 'text-gray-800 dark:text-gray-200', 
    icon: <ClockIcon className="w-4 h-4 mr-1.5" />
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || statusStyles[WorkflowStatus.DRAFT];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {status}
    </span>
  );
};