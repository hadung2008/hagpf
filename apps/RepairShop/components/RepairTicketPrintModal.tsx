
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RepairTicket } from '../types';
import { PrinterIcon, XMarkIcon, ArrowDownTrayIcon } from '../../../components/icons';

interface RepairTicketPrintModalProps {
    ticket: RepairTicket;
    onClose: () => void;
}

export const RepairTicketPrintModal: React.FC<RepairTicketPrintModalProps> = ({ ticket, onClose }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const handleDownloadPdf = () => {
        setIsPrinting(true);
        const invoiceElement = document.getElementById('printable-repair-ticket');
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
                        
                        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const margin = 40;
                        const imgWidth = pdfWidth - margin * 2;
                        const aspectRatio = canvas.width / canvas.height;
                        const imgHeight = imgWidth / aspectRatio;

                        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
                        pdf.save(`Repair-Ticket-${ticket.id}.pdf`);
                    } catch (error) {
                        console.error('Error generating PDF', error);
                        alert('Could not generate PDF.');
                    } finally {
                        printableArea.classList.remove('rendering-pdf');
                        setIsPrinting(false);
                    }
                });
            });

        } else {
            console.error('Printable ticket element not found');
            setIsPrinting(false);
        }
    };

    const handleNativePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Print Ticket {ticket.id}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 text-center space-y-4">
                    <p className="text-gray-600 dark:text-slate-300">Choose an option to generate the repair and warranty slip.</p>
                    <div className="flex flex-col space-y-3">
                        <button 
                            onClick={handleDownloadPdf}
                            disabled={isPrinting}
                            className="inline-flex items-center justify-center px-4 py-3 rounded-md text-base font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            {isPrinting ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button 
                            onClick={handleNativePrint}
                            className="inline-flex items-center justify-center px-4 py-3 rounded-md text-base font-medium bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500"
                        >
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Print
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
