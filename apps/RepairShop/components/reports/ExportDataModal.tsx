import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Invoice, RepairTicket, StockReceiveLog, Product } from '../../types';
import { XMarkIcon, ArrowDownTrayIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../lib/i18n';

interface ExportDataModalProps {
    invoices: Invoice[];
    repairTickets: RepairTicket[];
    stockReceiveLogs: StockReceiveLog[];
    products: Product[];
    onClose: () => void;
}

type DataType = 'invoices' | 'repairTickets' | 'stockLogs' | 'products';

const ITEMS_PER_PAGE = 10;

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ invoices, repairTickets, stockReceiveLogs, products, onClose }) => {
    const { t } = useTranslation();
    const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isPreparing, setIsPreparing] = useState(false);
    
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const dataTypes: { id: DataType; label: string; dateFilter: boolean }[] = useMemo(() => [
        { id: 'invoices', label: t('repairShop.modals.export.types.invoices'), dateFilter: true },
        { id: 'repairTickets', label: t('repairShop.modals.export.types.repairTickets'), dateFilter: true },
        { id: 'stockLogs', label: t('repairShop.modals.export.types.stockLogs'), dateFilter: true },
        { id: 'products', label: t('repairShop.modals.export.types.products'), dateFilter: false },
    ], [t]);

    const handleDataTypeChange = (dataType: DataType) => {
        setSelectedDataType(dataType);
        setPreviewData([]); // Clear previous preview
        setCurrentPage(1);
    };

    const handlePreviewData = () => {
        if (!selectedDataType) {
            alert('Please select a data type to preview.');
            return;
        }
        setIsPreparing(true);
        setPreviewData([]);
        setCurrentPage(1);

        setTimeout(() => {
            try {
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);
                
                let dataToPreview: any[] = [];
                const dataTypeInfo = dataTypes.find(dt => dt.id === selectedDataType);

                switch(selectedDataType) {
                    case 'invoices':
                        dataToPreview = invoices.filter(i => {
                            if (!dataTypeInfo?.dateFilter || (!start && !end)) return true;
                            const date = new Date(i.date);
                            if (start && date < start) return false;
                            if (end && date > end) return false;
                            return true;
                        }).flatMap(invoice => {
                             const header = {
                                'Invoice ID': invoice.id, 'Date': new Date(invoice.date).toLocaleString(),
                                'Customer ID': invoice.customerId, 'Customer Name': invoice.customerName, 'Salesperson ID': invoice.salespersonId,
                                'Subtotal': invoice.subtotal, 'Discount': invoice.discount, 'Tax Rate (%)': invoice.taxRate, 'Tax Amount': invoice.tax, 'Total': invoice.total,
                            };
                            if (invoice.items.length === 0) {
                                return [{ ...header, 'Product ID': '', 'Product Name': '', 'Quantity': 0, 'Unit Price': 0, 'Line Total': 0 }];
                            }
                            return invoice.items.map(item => ({
                                ...header, 'Product ID': item.productId, 'Product Name': item.productName,
                                'Quantity': item.quantity, 'Unit Price': item.unitPrice, 'Line Total': item.total,
                            }));
                        });
                        break;
                    case 'repairTickets':
                         dataToPreview = repairTickets.filter(t => {
                             if (!dataTypeInfo?.dateFilter || (!start && !end)) return true;
                            const date = new Date(t.dateReceived);
                            if (start && date < start) return false;
                            if (end && date > end) return false;
                            return true;
                        }).flatMap(ticket => {
                            const productMap = new Map(products.map(p => [p.id, p.name]));
                            const header = {
                                'Ticket ID': ticket.id, 'Date Received': new Date(ticket.dateReceived).toLocaleString(), 'Date Completed': ticket.dateCompleted ? new Date(ticket.dateCompleted).toLocaleString() : '',
                                'Customer ID': ticket.customerId, 'Technician ID': ticket.technicianId, 'Status': ticket.status, 'Device Type': ticket.deviceType, 'Device Model': ticket.deviceModel,
                                'Reported Issue': ticket.reportedIssue, 'Diagnosis': ticket.diagnosis, 'Labor Cost': ticket.laborCost, 'Total Cost': ticket.totalCost,
                            };

                            if (!ticket.partsUsed || ticket.partsUsed.length === 0) {
                                return [{ ...header, 'Part ID': '', 'Part Name': '', 'Part Quantity': 0, 'Part Unit Price': 0 }];
                            }
                            return ticket.partsUsed.map(part => ({
                               ...header, 'Part ID': part.productId, 'Part Name': productMap.get(part.productId) || 'Unknown Part',
                               'Part Quantity': part.quantity, 'Part Unit Price': part.unitPrice,
                            }));
                        });
                        break;
                    case 'stockLogs':
                         dataToPreview = stockReceiveLogs.filter(l => {
                            if (!dataTypeInfo?.dateFilter || (!start && !end)) return true;
                            const date = new Date(l.date);
                            if (start && date < start) return false;
                            if (end && date > end) return false;
                            return true;
                        }).flatMap(log => {
                            const header = {
                                'Log ID': log.id, 'Date': new Date(log.date).toLocaleString(), 'User ID': log.userId,
                                'Supplier': log.supplier, 'Notes': log.notes,
                            };
                            if (log.items.length === 0) return [{...header, 'Product ID': '', 'Product Name': '', 'Quantity Received': 0}];
                            return log.items.map(item => ({
                                ...header, 'Product ID': item.productId, 'Product Name': item.productName, 'Quantity Received': item.quantity,
                            }));
                        });
                        break;
                    case 'products':
                         dataToPreview = products.map(p => ({
                            'Product ID': p.id, 'Name': p.name, 'Category': p.category, 'Selling Price': p.price,
                            'Cost Price': p.costPrice, 'Current Stock': p.stock, 'Supplier': p.supplier, 'Warranty (Months)': p.warrantyPeriodInMonths,
                        }));
                        break;
                }
                setPreviewData(dataToPreview);

            } catch(error) {
                console.error("Failed to prepare data for preview", error);
                alert("An error occurred during data preparation.");
            } finally {
                setIsPreparing(false);
            }
        }, 100);
    };

    const handleExport = () => {
        setIsPreparing(true);
        setTimeout(() => {
            try {
                const wb = XLSX.utils.book_new();
                const sheetName = dataTypes.find(dt => dt.id === selectedDataType)?.label || 'Export';
                const ws = XLSX.utils.json_to_sheet(previewData);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
                XLSX.writeFile(wb, `Store_Operations_${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`);
            } catch (error) {
                console.error("Failed to export data to Excel", error);
                alert("An error occurred during export.");
            } finally {
                setIsPreparing(false);
            }
        }, 100);
    };
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return previewData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [previewData, currentPage]);
    
    const totalPages = useMemo(() => Math.ceil(previewData.length / ITEMS_PER_PAGE), [previewData]);
    const tableHeaders = useMemo(() => previewData.length > 0 ? Object.keys(previewData[0]) : [], [previewData]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('repairShop.modals.export.title')}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex flex-grow min-h-0">
                    {/* Controls */}
                    <div className="w-1/3 border-r border-gray-200 dark:border-slate-700 p-6 flex flex-col space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('repairShop.modals.export.step1')}</label>
                            <div className="space-y-2">
                                {dataTypes.map(dt => (
                                    <label key={dt.id} className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${selectedDataType === dt.id ? 'bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-500' : 'bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                                        <input type="radio" name="dataType" checked={selectedDataType === dt.id} onChange={() => handleDataTypeChange(dt.id)} className="h-4 w-4 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-indigo-500 focus:ring-indigo-500"/>
                                        <span className="text-sm text-gray-800 dark:text-slate-200">{dt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('repairShop.modals.export.step2')}</label>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">{t('repairShop.modals.export.step2_desc')}</p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 dark:text-slate-400">{t('repairShop.modals.export.startDate')}</label>
                                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200"/>
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 dark:text-slate-400">{t('repairShop.modals.export.endDate')}</label>
                                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm text-gray-900 dark:text-slate-200"/>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-6">
                             <button type="button" onClick={handlePreviewData} disabled={isPreparing || !selectedDataType} className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-wait">
                                {isPreparing ? t('repairShop.modals.export.loading') : t('repairShop.modals.export.previewBtn')}
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="w-2/3 p-6 flex flex-col">
                        {isPreparing && <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div></div>}

                        {!isPreparing && previewData.length === 0 && (
                            <div className="flex-grow flex items-center justify-center text-center text-gray-500 dark:text-slate-500">
                                <div>
                                    <p className="font-semibold">{t('repairShop.modals.export.noPreview')}</p>
                                    <p className="text-sm">{t('repairShop.modals.export.noPreviewDesc')}</p>
                                </div>
                            </div>
                        )}
                        
                        {!isPreparing && previewData.length > 0 && (
                             <>
                                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('repairShop.modals.export.previewTitle')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">{t('repairShop.modals.export.previewRecords', {
                                            start: Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, previewData.length),
                                            end: Math.min(currentPage * ITEMS_PER_PAGE, previewData.length),
                                            total: previewData.length
                                        })}</p>
                                    </div>
                                    <button onClick={handleExport} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700">
                                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                        {t('repairShop.modals.export.exportBtn')}
                                    </button>
                                </div>
                                <div className="flex-grow overflow-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                                        <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                                            <tr>{tableHeaders.map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {paginatedData.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="hover:bg-gray-100/50 dark:hover:bg-slate-700/30">
                                                    {tableHeaders.map(header => <td key={header} className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-slate-300 max-w-xs truncate" title={String(row[header])}>{String(row[header])}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center pt-4 flex-shrink-0">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-slate-600 disabled:opacity-50">{t('repairShop.modals.export.previous')}</button>
                                        <span className="text-sm text-gray-500 dark:text-slate-400">{t('repairShop.modals.export.page', { current: currentPage, total: totalPages })}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-slate-600 disabled:opacity-50">{t('repairShop.modals.export.next')}</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};