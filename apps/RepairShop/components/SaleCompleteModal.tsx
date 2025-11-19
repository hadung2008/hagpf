import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { User } from '../../../types';
import { CheckCircleIcon, PrinterIcon, XMarkIcon, ArrowDownTrayIcon } from '../../../components/icons';
import { PrintableInvoice } from './PrintableInvoice';

interface SaleCompleteModalProps {
    invoice: Invoice;
    allUsers: User[];
    onClose: () => void;
}

export const SaleCompleteModal: React.FC<SaleCompleteModalProps> = ({ invoice, allUsers, onClose }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const handleDownloadPdf = () => {
        setIsPrinting(true);
        const invoiceElement = document.getElementById('printable-invoice');
        const printableArea = invoiceElement?.parentElement;

        if (invoiceElement && printableArea) {
            printableArea.classList.add('rendering-pdf');

            requestAnimationFrame(() => {
                requestAnimationFrame(async () => {
                    try {
                        const canvas = await html2canvas(invoiceElement, {
                            scale: 2,
                            backgroundColor: '#ffffff'
                        });
                        const imgData = canvas.toDataURL('image/png');
                        
                        const pdf = new jsPDF({
                            orientation: 'p',
                            unit: 'pt',
                            format: 'a4'
                        });

                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const margin = 40;
                        const imgWidth = pdfWidth - margin * 2;
                        const aspectRatio = canvas.width / canvas.height;
                        const imgHeight = imgWidth / aspectRatio;

                        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
                        pdf.save(`Invoice-${invoice.id}.pdf`);

                    } catch (error) {
                        console.error('Error generating PDF', error);
                        alert('Could not generate PDF. Please try again.');
                    } finally {
                        printableArea.classList.remove('rendering-pdf');
                        setIsPrinting(false);
                    }
                });
            });

        } else {
            console.error('Printable invoice element not found');
            alert('An error occurred. Could not find invoice content to print.');
            setIsPrinting(false);
        }
    };


    const handleNativePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                    <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Sale Completed</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 text-center">
                        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Success!</p>
                        <p className="text-gray-500 dark:text-slate-400 mt-2">Invoice <span className="font-semibold text-indigo-600 dark:text-indigo-400">{invoice.id}</span> has been created.</p>
                        
                        <div className="mt-6 text-left bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-300 mb-2 border-b border-gray-200 dark:border-slate-700 pb-2">Invoice Summary</h4>
                            <div className="space-y-2 text-sm">
                                {invoice.items.map(item => (
                                    <div key={item.productId} className="flex justify-between">
                                        <span className="text-gray-600 dark:text-slate-400 truncate pr-2">{item.productName} (x{item.quantity})</span>
                                        <span className="text-gray-800 dark:text-slate-200 font-medium">${item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                             {invoice.items.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between font-bold text-base">
                                    <span className="text-gray-800 dark:text-slate-200">Total:</span>
                                    <span className="text-green-600 dark:text-green-400">${invoice.total.toFixed(2)}</span>
                                </div>
                             )}
                        </div>

                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button 
                            onClick={handleDownloadPdf}
                            disabled={isPrinting}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-wait"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            {isPrinting ? 'Generating...' : 'Download PDF'}
                        </button>
                         <button 
                            onClick={handleNativePrint}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                        >
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Print Invoice
                        </button>
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Start New Sale
                        </button>
                    </div>
                </div>
            </div>
            <div className="printable-area">
                 <PrintableInvoice invoice={invoice} allUsers={allUsers} />
            </div>
        </>
    );
};