
import React from 'react';
import { Invoice } from '../types';
import { User } from '../../../types';

interface PrintableInvoiceProps {
    invoice: Invoice;
    allUsers: User[];
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, allUsers }) => {
    const salesperson = allUsers.find(u => u.id === invoice.salespersonId)?.name.split(' (')[0] || 'N/A';
    
    return (
        <div id="printable-invoice" className="p-8 bg-white text-black font-sans">
            <div className="print-no-break">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">H3TECH Store</h1>
                    <p className="text-sm">123 Tech Lane, Silicon Valley, CA 94000</p>
                    <p className="text-sm">Phone: (123) 456-7890</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div>
                        <h2 className="font-bold mb-1">Billed To:</h2>
                        <p>{invoice.customerName}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Invoice #:</span> {invoice.id}</p>
                        <p><span className="font-bold">Date:</span> {new Date(invoice.date).toLocaleString()}</p>
                        <p><span className="font-bold">Salesperson:</span> {salesperson}</p>
                    </div>
                </div>
            </div>

            <div className="print-no-break mb-8">
                <table className="w-full text-sm table-fixed">
                    <colgroup>
                        <col style={{ width: '50%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '20%' }} />
                    </colgroup>
                    <thead className="border-b-2 border-black">
                        <tr>
                            <th className="py-2 text-left font-bold">Item</th>
                            <th className="py-2 text-center font-bold">Qty</th>
                            <th className="py-2 text-right font-bold">Unit Price</th>
                            <th className="py-2 text-right font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map(item => (
                            <tr key={item.productId} className="border-b border-gray-200">
                                <td className="py-2 break-words pr-2">{item.productName}</td>
                                <td className="py-2 text-center">{item.quantity}</td>
                                <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-end print-no-break">
                <div className="w-full max-w-xs space-y-1 text-sm">
                     <div className="flex justify-between">
                        <span className="font-bold">Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Discount:</span>
                        <span>-${invoice.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Tax ({invoice.taxRate}%):</span>
                        <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                    <hr className="border-black my-2" />
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="text-center mt-12 text-xs text-gray-600 print-no-break">
                <p>Thank you for your business!</p>
                <p>For support, please visit h3tech.com/support</p>
            </div>
        </div>
    );
};
