import React from 'react';
import { RepairTicket, Customer, Technician, Product } from '../types';

interface PrintableRepairTicketProps {
    ticket: RepairTicket;
    customer: Customer;
    technician?: Technician;
    products: Product[];
}

export const PrintableRepairTicket: React.FC<PrintableRepairTicketProps> = ({ ticket, customer, technician, products }) => {
    
    return (
        <div id="printable-repair-ticket" className="p-8 bg-white text-black font-sans text-sm">
            <div className="print-no-break">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">H3TECH Store</h1>
                        <p>123 Tech Lane, Silicon Valley, CA 94000</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold">Repair Slip</h2>
                        <p><span className="font-bold">Ticket #:</span> {ticket.id}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 border-t border-b border-gray-300 py-4">
                    <div>
                        <h3 className="font-bold mb-1">Customer Information:</h3>
                        <p>{customer.name}</p>
                        <p>{customer.phone}</p>
                        <p>{customer.email}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">Service Information:</h3>
                        <p><span className="font-bold">Date Received:</span> {new Date(ticket.dateReceived).toLocaleString()}</p>
                        <p><span className="font-bold">Technician:</span> {technician?.name || 'N/A'}</p>
                    </div>
                </div>
                 <div className="mb-8">
                    <h3 className="font-bold mb-1">Device Information:</h3>
                    <p><span className="font-bold">Type:</span> {ticket.deviceType}</p>
                    <p><span className="font-bold">Model:</span> {ticket.deviceModel}</p>
                    <p><span className="font-bold">Serial #:</span> {ticket.deviceSerial}</p>
                </div>
                 <div className="mb-8">
                    <h3 className="font-bold mb-1">Reported Issue:</h3>
                    <p className="p-2 border border-gray-200 rounded">{ticket.reportedIssue}</p>
                </div>
            </div>

            <div className="print-no-break mb-8">
                 <h3 className="font-bold mb-2">Service Details & Cost Breakdown</h3>
                <table className="w-full text-sm table-fixed">
                    <thead className="border-b-2 border-black">
                        <tr>
                            <th className="py-2 text-left font-bold" style={{ width: '60%' }}>Item / Service</th>
                            <th className="py-2 text-right font-bold" style={{ width: '20%' }}>Quantity</th>
                            <th className="py-2 text-right font-bold" style={{ width: '20%' }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticket.partsUsed?.map((part, index) => {
                             const product = products.find(p => p.id === part.productId);
                             return (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-2 break-words pr-2">Part: {product?.name || part.productId}</td>
                                    <td className="py-2 text-right">{part.quantity}</td>
                                    <td className="py-2 text-right">${(part.unitPrice * part.quantity).toFixed(2)}</td>
                                </tr>
                             )
                        })}
                        {ticket.laborCost && ticket.laborCost > 0 && (
                             <tr className="border-b border-gray-200">
                                <td className="py-2 break-words pr-2">Labor</td>
                                <td className="py-2 text-right">1</td>
                                <td className="py-2 text-right">${ticket.laborCost.toFixed(2)}</td>
                            </tr>
                        )}
                         <tr className="font-bold">
                            <td colSpan={2} className="py-3 text-right">Total Cost:</td>
                            <td className="py-3 text-right text-lg">${(ticket.totalCost || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className="print-no-break">
                <h3 className="font-bold mb-2">Terms & Warranty</h3>
                <div className="p-4 border border-gray-300 rounded text-xs space-y-2">
                    <p>
                        This repair is covered by a limited warranty of 
                        <span className="font-bold"> {ticket.warrantyPeriodInMonths || 0} months </span> 
                        from the date of completion on the parts and labor listed above.
                    </p>
                    <p>This warranty does not cover issues caused by accidental damage, liquid damage, or software modifications after the time of service. All claims are subject to inspection and verification by H3TECH.</p>
                </div>
            </div>

            <div className="text-center mt-12 text-xs text-gray-600 print-no-break">
                <div className="w-1/2 border-t border-black mx-auto pt-2">
                    Customer Signature
                </div>
            </div>
        </div>
    );
};