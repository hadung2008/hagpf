import React, { useState, useMemo, useEffect } from 'react';
import { RepairTicket, Customer, Technician, Product, RepairStatus } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon, PrinterIcon } from '../../../components/icons';
import { RepairStatusBadge } from './StatusBadge';
import { useTranslation } from '../../../lib/i18n';

interface RepairTicketEditorProps {
    ticket: RepairTicket;
    customers: Customer[];
    technicians: Technician[];
    products: Product[];
    onSave: (ticket: RepairTicket) => void;
    onClose: () => void;
    onPrint: (ticket: RepairTicket) => void;
}

export const RepairTicketEditor: React.FC<RepairTicketEditorProps> = ({ ticket, customers, technicians, products, onSave, onClose, onPrint }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<RepairTicket>(ticket);
    const [newStatus, setNewStatus] = useState<RepairStatus>(ticket.status);
    const [statusNotes, setStatusNotes] = useState('');
    const [partToAdd, setPartToAdd] = useState('');

    const isNewTicket = !ticket.customerId; // A simple check for new vs existing

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPart = () => {
        if (!partToAdd) return;
        const product = products.find(p => p.id === partToAdd);
        if (!product) return;

        const newPart = {
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
        };

        setFormData(prev => ({
            ...prev,
            partsUsed: [...(prev.partsUsed || []), newPart]
        }));
        setPartToAdd('');
    };

    const handleRemovePart = (index: number) => {
        setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed?.filter((_, i) => i !== index)
        }));
    };
    
    const handleUpdateStatus = () => {
        if (newStatus === formData.status) return;
        setFormData(prev => ({
            ...prev,
            status: newStatus,
            statusHistory: [...prev.statusHistory, {
                timestamp: new Date().toISOString(),
                status: newStatus,
                notes: statusNotes,
            }]
        }));
        setStatusNotes('');
    };
    
    const totalPartsCost = useMemo(() => {
        return formData.partsUsed?.reduce((acc, part) => acc + (part.unitPrice * part.quantity), 0) || 0;
    }, [formData.partsUsed]);
    
    const totalCost = useMemo(() => {
        return totalPartsCost + (formData.laborCost || 0);
    }, [totalPartsCost, formData.laborCost]);

    // Auto-calculate warranty
    useEffect(() => {
        if (formData.partsUsed && formData.partsUsed.length > 0) {
            const maxWarranty = formData.partsUsed.reduce((max, part) => {
                const product = products.find(p => p.id === part.productId);
                const warranty = product?.warrantyPeriodInMonths || 0;
                return Math.max(max, warranty);
            }, 0);
            if (maxWarranty > (formData.warrantyPeriodInMonths || 0)) {
                setFormData(prev => ({ ...prev, warrantyPeriodInMonths: maxWarranty }));
            }
        }
    }, [formData.partsUsed, products]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, totalCost });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isNewTicket ? t('repairShop.modals.ticketEditor.newTitle') : t('repairShop.modals.ticketEditor.editTitle', { id: ticket.id })}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Customer & Device */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.customerLabel')}</label>
                            <select name="customerId" value={formData.customerId} onChange={handleChange} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                <option value="">{t('repairShop.modals.ticketEditor.selectCustomer')}</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.deviceModelLabel')}</label>
                            <input type="text" name="deviceModel" value={formData.deviceModel} onChange={handleChange} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.serialLabel')}</label>
                            <input type="text" name="deviceSerial" value={formData.deviceSerial} onChange={handleChange} required className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.technicianLabel')}</label>
                            <select name="technicianId" value={formData.technicianId || ''} onChange={handleChange} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                <option value="">{t('repairShop.modals.ticketEditor.unassigned')}</option>
                                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.issueLabel')}</label>
                            <textarea name="reportedIssue" value={formData.reportedIssue} onChange={handleChange} required rows={3} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                    </div>

                    {/* Diagnosis & Parts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.diagnosisLabel')}</label>
                            <textarea name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} rows={5} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.partsLabel')}</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                {formData.partsUsed?.map((part, index) => {
                                    const product = products.find(p => p.id === part.productId);
                                    return (<div key={index} className="flex items-center bg-gray-100 dark:bg-slate-700/50 p-2 rounded-md">
                                        <span className="flex-grow text-sm text-gray-800 dark:text-slate-200">{product?.name || 'Unknown Part'}</span>
                                        <span className="text-sm text-gray-700 dark:text-slate-300">${part.unitPrice.toFixed(2)}</span>
                                        <button type="button" onClick={() => handleRemovePart(index)} className="ml-3 text-gray-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                    </div>)
                                })}
                            </div>
                            <div className="flex mt-2 space-x-2">
                                <select value={partToAdd} onChange={e => setPartToAdd(e.target.value)} className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                    <option value="">{t('repairShop.modals.ticketEditor.addPartPlaceholder')}</option>
                                    {products.filter(p => p.category === 'Part' && p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name} ({t('repairShop.modals.ticketEditor.addPartStock', { stock: p.stock })})</option>)}
                                </select>
                                <button type="button" onClick={handleAddPart} className="p-2 bg-indigo-600 text-white rounded-md"><PlusIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>

                    {/* Costs & Warranty */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.laborCostLabel')}</label>
                            <input type="number" name="laborCost" value={formData.laborCost || ''} onChange={e => setFormData(p => ({...p, laborCost: Number(e.target.value)}))} className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.totalCostLabel')}</label>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.warrantyLabel')}</label>
                             <input type="number" name="warrantyPeriodInMonths" value={formData.warrantyPeriodInMonths || ''} onChange={e => setFormData(p => ({...p, warrantyPeriodInMonths: Number(e.target.value)}))} min="0" className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                        </div>
                    </div>

                    {/* Status Update */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{t('repairShop.modals.ticketEditor.updateStatusLabel')}</label>
                        <div className="flex space-x-2 items-center">
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value as RepairStatus)} className="w-48 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200">
                                {Object.values(RepairStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="text" value={statusNotes} onChange={e => setStatusNotes(e.target.value)} placeholder={t('repairShop.modals.ticketEditor.statusNotesPlaceholder')} className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200" />
                            <button type="button" onClick={handleUpdateStatus} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white text-sm rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">{t('repairShop.modals.ticketEditor.updateBtn')}</button>
                        </div>
                        <div className="mt-2">
                             <span className="text-sm font-medium mr-2 text-gray-700 dark:text-slate-300">{t('repairShop.modals.ticketEditor.currentStatus')}</span>
                            <RepairStatusBadge status={formData.status} />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <button type="button" onClick={() => onPrint(formData)} className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">
                        <PrinterIcon className="w-5 h-5 mr-2"/>
                        {t('repairShop.modals.ticketEditor.printBtn')}
                    </button>
                    <div className="flex space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">{t('repairShop.modals.ticketEditor.saveBtn')}</button>
                    </div>
                </div>
            </form>
        </div>
    );
};