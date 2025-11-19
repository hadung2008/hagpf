import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Header, ActiveView } from './components/Header';
import { fetchRepairShopData, saveRepairTicket, saveProduct, deleteProduct, saveCustomer, saveInvoice, saveStockReceiveLog } from '../../lib/mockApi';
import { RepairTicket, Customer, Product, Invoice, RepairStatus, StockReceiveItem, StockReceiveLog, AuditLogEntry, Technician } from './types';
import { RepairDashboard } from './components/RepairDashboard';
import { RepairTicketEditor } from './components/RepairTicketEditor';
import { SalesPOS } from './components/SalesPOS';
import { InvoiceHistory } from './components/InvoiceHistory';
import { InventoryDashboard } from './components/InventoryDashboard';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { SaleCompleteModal } from './components/SaleCompleteModal';
import { ManagementDashboard } from './components/ManagementDashboard';
import { CustomerStatusView } from './components/CustomerStatusView';
import { RepairTicketPrintModal } from './components/RepairTicketPrintModal';
import { PrintableRepairTicket } from './components/PrintableRepairTicket';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useTranslation } from '../../lib/i18n';

interface RepairShopAppProps {
    currentUser: User;
    allUsers: User[];
    onLogout: () => void;
    onBackToApps: () => void;
    effectivePermissions: Record<string, boolean>;
    theme: string;
    setTheme: (theme: string) => void;
}

export const RepairShopApp: React.FC<RepairShopAppProps> = ({ currentUser, allUsers, onLogout, onBackToApps, effectivePermissions, theme, setTheme }) => {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState<ActiveView>('repairs');
    const [isLoading, setIsLoading] = useState(true);

    const [repairTickets, setRepairTickets] = useState<RepairTicket[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [salesView, setSalesView] = useState<'pos' | 'history'>('pos');
    
    const [categories, setCategories] = useState<string[]>([]);
    const [stockReceiveLogs, setStockReceiveLogs] = useState<StockReceiveLog[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

    const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

    const [lastCompletedInvoice, setLastCompletedInvoice] = useState<Invoice | null>(null);

    const [statusTicket, setStatusTicket] = useState<RepairTicket | null>(null);
    const [printingTicket, setPrintingTicket] = useState<RepairTicket | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchRepairShopData();
            setRepairTickets(data.repairTickets);
            setCustomers(data.customers);
            setTechnicians(data.technicians);
            setProducts(data.products);
            setInvoices(data.invoices);
            setStockReceiveLogs(data.stockReceiveLogs);
            setAuditLogs(data.auditLogs);
            setCategories(Array.from(new Set(data.products.map(p => p.category))));
            setIsLoading(false);

            const params = new URLSearchParams(window.location.search);
            const ticketId = params.get('ticket');
            if (ticketId) {
                const ticket = data.repairTickets.find(t => t.id === ticketId);
                if (ticket) {
                    setStatusTicket(ticket);
                }
            }
        };
        loadData();
    }, []);

    const handleShowStatus = (ticketId: string) => {
        const ticket = repairTickets.find(t => t.id === ticketId);
        if (ticket) {
            setStatusTicket(ticket);
        }
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setViewingInvoice(invoice);
        setIsInvoiceDetailOpen(true);
    };

    const handleCheckout = async (invoiceData: Omit<Invoice, 'id' | 'salespersonId' | 'date'>) => {
        const newInvoice: Invoice = {
            ...invoiceData,
            id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
            salespersonId: currentUser.id,
            date: new Date().toISOString(),
        };

        const customerIndex = customers.findIndex(c => c.id === newInvoice.customerId);
        let updatedCustomers = [...customers];
        if (customerIndex !== -1) {
            const customer = { ...updatedCustomers[customerIndex] };
            customer.purchaseHistory = [...(customer.purchaseHistory || []), newInvoice.id];
            updatedCustomers[customerIndex] = customer;
        }

        // The stock levels are already updated in the SalesPOS component state,
        // so we pass the current `products` state to the mock API.
        await saveInvoice(newInvoice, products, updatedCustomers);

        setInvoices(prev => [...prev, newInvoice]);
        setCustomers(updatedCustomers);
        setLastCompletedInvoice(newInvoice);
    };

    const handleNewTicket = () => {
        const newTicket: RepairTicket = {
            id: `T-${Date.now()}`,
            customerId: '',
            deviceType: 'Phone',
            deviceModel: '',
            deviceSerial: '',
            reportedIssue: '',
            dateReceived: new Date().toISOString(),
            status: RepairStatus.PENDING,
            statusHistory: [{ timestamp: new Date().toISOString(), status: RepairStatus.PENDING, notes: 'Ticket created.' }],
        };
        setEditingTicket(newTicket);
        setIsEditorOpen(true);
    };

    const handleEditTicket = (ticketId: string) => {
        const ticket = repairTickets.find(t => t.id === ticketId);
        if (ticket) {
            setEditingTicket(ticket);
            setIsEditorOpen(true);
        }
    };

    
    const handleSaveTicket = async (ticketToSave: RepairTicket) => {
        setIsEditorOpen(false);
        setEditingTicket(null);
        await saveRepairTicket(ticketToSave);

        const isNewTicket = !repairTickets.some(t => t.id === ticketToSave.id);
        if (isNewTicket) {
            setRepairTickets(prev => [...prev, ticketToSave]);
        } else {
            setRepairTickets(prev => prev.map(t => t.id === ticketToSave.id ? ticketToSave : t));
        }

        // You might want to adjust stock here as well, if parts were added/removed.
        // For this simulation, we'll assume stock is only deducted on initial save.
    };

    const handleSaveProduct = async (productToSave: Product) => {
        await saveProduct(productToSave);
        const isNew = !products.some(p => p.id === productToSave.id);
        if (isNew) {
            setProducts(prev => [...prev, productToSave]);
        } else {
            setProducts(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if(window.confirm("Are you sure you want to delete this product? This action cannot be undone.")){
            await deleteProduct(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    const handleReceiveStock = async (items: StockReceiveItem[], supplier?: string, notes?: string) => {
        const updatedProducts = [...products];
        items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex].stock += item.quantity;
            }
        });

        const newLogEntry: StockReceiveLog = {
            id: `sr-${Date.now()}`,
            date: new Date().toISOString(),
            userId: currentUser.id,
            items,
            supplier,
            notes,
        };
        
        await saveStockReceiveLog(newLogEntry, updatedProducts);
        setProducts(updatedProducts);
        setStockReceiveLogs(prev => [newLogEntry, ...prev]);
    };

    const handleSaveCategory = (oldName: string | null, newName: string) => {
        const trimmedNewName = newName.trim();
        if (!trimmedNewName) {
            alert(t('repairShop.categories.alertEmpty'));
            return;
        }
        if (categories.some(c => c.toLowerCase() === trimmedNewName.toLowerCase() && c.toLowerCase() !== oldName?.toLowerCase())) {
            alert(t('repairShop.categories.alertExists'));
            return;
        }

        if (oldName) { // Editing
            setCategories(prev => prev.map(c => c === oldName ? trimmedNewName : c));
            setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: trimmedNewName } : p));
        } else { // Adding
            setCategories(prev => [...prev, trimmedNewName]);
        }
    };

    const handleDeleteCategory = (name: string) => {
        const isUsed = products.some(p => p.category === name);
        if (isUsed) {
            alert(t('repairShop.categories.alertCannotDelete', { name }));
            return;
        }
        if (window.confirm(t('repairShop.categories.deleteConfirm', { name }))) {
            setCategories(prev => prev.filter(c => c !== name));
        }
    };


    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner message={t('general.loading')} />;
        }

        switch (activeView) {
            case 'sales':
                return (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                             <div className="bg-white dark:bg-slate-700 rounded-lg p-1 inline-flex">
                                <button onClick={() => setSalesView('pos')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${salesView === 'pos' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600/50'}`}>
                                    {t('repairShop.sales.posTab')}
                                </button>
                                <button onClick={() => setSalesView('history')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${salesView === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600/50'}`}>
                                    {t('repairShop.sales.historyTab')}
                                </button>
                            </div>
                        </div>
                        {salesView === 'pos' ? (
                            <SalesPOS 
                                products={products}
                                setProducts={setProducts}
                                customers={customers}
                                setCustomers={setCustomers}
                                onCheckout={handleCheckout}
                                categories={categories}
                            />
                        ) : (
                            <InvoiceHistory 
                                invoices={invoices} 
                                onViewInvoice={handleViewInvoice}
                            />
                        )}
                    </div>
                );
            case 'repairs':
                return <RepairDashboard 
                    tickets={repairTickets} 
                    customers={customers}
                    onEditTicket={handleEditTicket} 
                    onNewTicket={handleNewTicket}
                    onShowStatus={handleShowStatus}
                />;
            case 'inventory':
                 return <InventoryDashboard
                    products={products}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onReceiveStock={handleReceiveStock}
                    categories={categories}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    stockReceiveLogs={stockReceiveLogs}
                    allUsers={allUsers}
                 />;
            case 'reports':
                 return <ManagementDashboard
                    allUsers={allUsers}
                    auditLogs={auditLogs}
                    invoices={invoices}
                    repairTickets={repairTickets}
                    products={products}
                    stockReceiveLogs={stockReceiveLogs}
                 />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 flex flex-col">
            <Header 
                currentUser={currentUser}
                onLogout={onLogout}
                onBackToApps={onBackToApps}
                activeView={activeView}
                onNavigate={setActiveView}
                theme={theme}
                setTheme={setTheme}
            />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
            {isEditorOpen && editingTicket && (
                <RepairTicketEditor 
                    ticket={editingTicket}
                    customers={customers}
                    technicians={technicians}
                    products={products}
                    onSave={handleSaveTicket}
                    onClose={() => setIsEditorOpen(false)}
                    onPrint={setPrintingTicket}
                />
            )}
            {isInvoiceDetailOpen && viewingInvoice && (
                <InvoiceDetailModal
                    invoice={viewingInvoice}
                    allUsers={allUsers}
                    onClose={() => setIsInvoiceDetailOpen(false)}
                />
            )}
            {lastCompletedInvoice && (
                <SaleCompleteModal
                    invoice={lastCompletedInvoice}
                    allUsers={allUsers}
                    onClose={() => setLastCompletedInvoice(null)}
                />
            )}
            {statusTicket && (
                <CustomerStatusView 
                    ticket={statusTicket}
                    onClose={() => setStatusTicket(null)}
                    theme={theme}
                />
            )}
             {printingTicket && (
                <RepairTicketPrintModal 
                    ticket={printingTicket}
                    onClose={() => setPrintingTicket(null)}
                />
            )}
            <div className="printable-area">
                 {printingTicket && (
                    <PrintableRepairTicket 
                        ticket={printingTicket} 
                        customer={customers.find(c => c.id === printingTicket.customerId)!}
                        technician={technicians.find(t => t.id === printingTicket.technicianId)}
                        products={products}
                    />
                )}
            </div>
        </div>
    );
};