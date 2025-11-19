import React from 'react';
import { RepairTicket, RepairStatus } from '../types';
import { XMarkIcon, CogIcon, LightBulbIcon } from '../../../components/icons';
import { RepairStatusBadge } from './StatusBadge';
import { useTranslation } from '../../../lib/i18n';

interface CustomerStatusViewProps {
    ticket: RepairTicket;
    onClose: () => void;
    theme: string;
}

const getStatusIcon = (status: RepairStatus) => {
    const commonClasses = "w-6 h-6 bg-white dark:bg-slate-700 rounded-full ring-4 ring-gray-100 dark:ring-slate-800 flex items-center justify-center";
    const dotClasses = "w-3 h-3 rounded-full";

    switch(status) {
        case RepairStatus.PENDING: return <div className={commonClasses}><div className={`${dotClasses} bg-yellow-400`}></div></div>;
        case RepairStatus.DIAGNOSING: return <div className={commonClasses}><div className={`${dotClasses} bg-blue-400`}></div></div>;
        case RepairStatus.REPAIRING: return <div className={commonClasses}><div className={`${dotClasses} bg-purple-400`}></div></div>;
        case RepairStatus.WAITING_FOR_PART: return <div className={commonClasses}><div className={`${dotClasses} bg-orange-400`}></div></div>;
        case RepairStatus.COMPLETED: return <div className={commonClasses}><div className={`${dotClasses} bg-green-400`}></div></div>;
        case RepairStatus.DELIVERED: return <div className={commonClasses}><div className={`${dotClasses} bg-slate-500`}></div></div>;
        case RepairStatus.CANCELLED: return <div className={commonClasses}><div className={`${dotClasses} bg-red-500`}></div></div>;
        default: return null;
    }
};

export const CustomerStatusView: React.FC<CustomerStatusViewProps> = ({ ticket, onClose, theme }) => {
    const { t } = useTranslation();
    const shareableLink = `${window.location.origin}${window.location.pathname}?ticket=${ticket.id}`;
    
    const qrCodeUrl = theme === 'dark'
      ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareableLink)}&size=150x150&bgcolor=1E293B&color=CBD5E1&qzone=1`
      : `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareableLink)}&size=150x150&bgcolor=F1F5F9&color=0F172A&qzone=1`;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('repairShop.modals.customerStatus.title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t('repairShop.modals.customerStatus.ticketId', { id: ticket.id })}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-slate-800">
                    <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="flex-grow">
                             <h4 className="font-semibold text-lg text-gray-800 dark:text-slate-200 flex items-center mb-3"><CogIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400"/>{t('repairShop.modals.customerStatus.deviceInfo')}</h4>
                            <p className="text-gray-700 dark:text-slate-300"><strong>{t('repairShop.modals.customerStatus.device')}</strong> {ticket.deviceModel}</p>
                            <p className="text-gray-700 dark:text-slate-300"><strong>{t('repairShop.modals.customerStatus.serviceRequested')}</strong> {ticket.reportedIssue}</p>
                            <div className="mt-4">
                                <p className="font-semibold text-gray-600 dark:text-slate-300">{t('repairShop.modals.customerStatus.currentStatus')}</p>
                                <RepairStatusBadge status={ticket.status} />
                            </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                             <img src={qrCodeUrl} alt="QR Code for status link" className="w-36 h-36 rounded-lg border-4 border-gray-200 dark:border-slate-700 mx-auto" />
                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">{t('repairShop.modals.customerStatus.scanQr')}</p>
                            <input
                                type="text"
                                readOnly
                                value={shareableLink}
                                className="w-full text-center bg-gray-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-xs p-1 rounded mt-2 border border-gray-300 dark:border-slate-600"
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    </div>

                     <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <h4 className="font-semibold text-lg text-gray-800 dark:text-slate-200 mb-3">{t('repairShop.modals.customerStatus.historyTitle')}</h4>
                        <ol className="relative border-l border-gray-200 dark:border-slate-600">
                            {ticket.statusHistory.slice().reverse().map((update, index) => (
                                <li key={index} className="relative mb-6 pl-10">
                                    <span className="absolute -left-3 top-0 flex items-center justify-center">
                                        {getStatusIcon(update.status)}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-slate-300">{t(`repairShop.enums.repairStatus.${update.status}`)}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-500">{new Date(update.timestamp).toLocaleString()}</p>
                                        {update.notes && <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 italic">"{update.notes}"</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                        {t('general.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};