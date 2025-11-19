import { Customer, Technician, Product, RepairTicket, RepairStatus, Invoice, StockReceiveLog, AuditLogEntry } from './types';

export const customers: Customer[] = [
    { id: 'cust-1', name: 'John Doe', phone: '555-0101', email: 'john.d@example.com', purchaseHistory: ['T-2404'] },
    { id: 'cust-2', name: 'Jane Smith', phone: '555-0102', email: 'jane.s@example.com', purchaseHistory: ['INV-001'] },
    { id: 'cust-3', name: 'Peter Jones', phone: '555-0103' },
];

export const technicians: Technician[] = [
    { id: 'tech-1', name: 'Alice' },
    { id: 'tech-2', name: 'Bob' },
];

export const products: Product[] = [
    { id: 'prod-1', name: 'iPhone 15 Pro Screen', category: 'Part', price: 299.99, costPrice: 180.00, supplier: 'OEM Parts Co.', stock: 15, warrantyPeriodInMonths: 6 },
    { id: 'prod-2', name: 'MacBook Pro M3 Battery', category: 'Part', price: 199.99, costPrice: 120.00, supplier: 'OEM Parts Co.', stock: 0, warrantyPeriodInMonths: 12 },
    { id: 'prod-3', name: 'USB-C Charging Cable', category: 'Accessory', price: 19.99, costPrice: 5.50, supplier: 'Accessory World', stock: 45 },
    { id: 'prod-4', name: 'Samsung S24 Ultra', category: 'Phone', price: 1299.99, costPrice: 950.00, supplier: 'Samsung Direct', stock: 10 },
    { id: 'prod-5', name: 'Dell XPS 15 Laptop', category: 'Laptop', price: 1899.00, costPrice: 1400.00, supplier: 'Dell Direct', stock: 5 },
    { id: 'prod-6', name: 'Wireless Mouse', category: 'Accessory', price: 49.99, costPrice: 22.00, supplier: 'Accessory World', stock: 29 },
];

export const initialInvoices: Invoice[] = [
    {
        id: 'INV-001',
        customerId: 'cust-2',
        customerName: 'Jane Smith',
        items: [
            { productId: 'prod-3', productName: 'USB-C Charging Cable', quantity: 2, unitPrice: 19.99, total: 39.98 },
            { productId: 'prod-6', productName: 'Wireless Mouse', quantity: 1, unitPrice: 49.99, total: 49.99 },
        ],
        subtotal: 89.97,
        discount: 5.00,
        taxRate: 8,
        tax: 6.80,
        total: 91.77,
        date: '2024-07-21T14:30:00Z',
        salespersonId: 'user-5', // Eve
    }
];

export const repairTickets: RepairTicket[] = [
    {
        id: 'T-2401',
        customerId: 'cust-1',
        technicianId: 'tech-1',
        deviceType: 'Phone',
        deviceModel: 'iPhone 14 Pro',
        deviceSerial: 'SN-IP14-001',
        reportedIssue: 'Screen is cracked after a drop.',
        dateReceived: '2024-07-20T10:00:00Z',
        status: RepairStatus.REPAIRING,
        statusHistory: [
            { timestamp: '2024-07-20T10:00:00Z', status: RepairStatus.PENDING },
            { timestamp: '2024-07-20T11:30:00Z', status: RepairStatus.DIAGNOSING, notes: 'Confirmed cracked OLED panel. Frame is okay.' },
            { timestamp: '2024-07-20T14:00:00Z', status: RepairStatus.REPAIRING, notes: 'Starting screen replacement.' }
        ],
        diagnosis: 'Cracked screen, requires full display assembly replacement.',
        partsUsed: [{ productId: 'prod-1', quantity: 1, unitPrice: 299.99 }],
        laborCost: 80,
        totalCost: 379.99,
    },
    {
        id: 'T-2402',
        customerId: 'cust-2',
        deviceType: 'Laptop',
        deviceModel: 'MacBook Pro 16" M1',
        deviceSerial: 'SN-MBP16-002',
        reportedIssue: 'Battery life is very short, drains in less than an hour.',
        dateReceived: '2024-07-21T09:15:00Z',
        status: RepairStatus.WAITING_FOR_PART,
        technicianId: 'tech-2',
        statusHistory: [
            { timestamp: '2024-07-21T09:15:00Z', status: RepairStatus.PENDING },
            { timestamp: '2024-07-21T10:00:00Z', status: RepairStatus.DIAGNOSING, notes: 'Battery health is at 45%. Needs replacement.' },
            { timestamp: '2024-07-21T10:30:00Z', status: RepairStatus.WAITING_FOR_PART, notes: 'Ordered new battery from supplier.' },
        ],
        diagnosis: 'Battery has degraded and needs to be replaced.',
    },
    {
        id: 'T-2403',
        customerId: 'cust-3',
        deviceType: 'Phone',
        deviceModel: 'Google Pixel 7',
        deviceSerial: 'SN-GP7-003',
        reportedIssue: 'Phone won\'t turn on.',
        dateReceived: '2024-07-22T14:30:00Z',
        status: RepairStatus.DIAGNOSING,
        technicianId: 'tech-1',
        statusHistory: [
            { timestamp: '2024-07-22T14:30:00Z', status: RepairStatus.PENDING },
            { timestamp: '2024-07-22T15:00:00Z', status: RepairStatus.DIAGNOSING, notes: 'Checking motherboard and battery connections.' }
        ],
    },
    {
        id: 'T-2404',
        customerId: 'cust-1',
        deviceType: 'Laptop',
        deviceModel: 'Dell XPS 15',
        deviceSerial: 'SN-XPS15-004',
        reportedIssue: 'Spilled coffee on the keyboard. Some keys are sticky.',
        dateReceived: '2024-07-19T16:00:00Z',
        dateCompleted: '2024-07-20T17:00:00Z',
        status: RepairStatus.COMPLETED,
        technicianId: 'tech-2',
        statusHistory: [
             { timestamp: '2024-07-19T16:00:00Z', status: RepairStatus.PENDING },
             { timestamp: '2024-07-19T16:30:00Z', status: RepairStatus.DIAGNOSING },
             { timestamp: '2024-07-20T11:00:00Z', status: RepairStatus.REPAIRING, notes: 'Keyboard cleaning and testing.' },
             { timestamp: '2024-07-20T17:00:00Z', status: RepairStatus.COMPLETED, notes: 'All keys working correctly. Ready for pickup.' },
        ],
        diagnosis: 'Liquid damage to keyboard membrane.',
        laborCost: 120,
        totalCost: 120,
    },
];

export const stockReceiveLogs: StockReceiveLog[] = [
    {
        id: 'sr-1',
        date: '2024-07-20T10:00:00Z',
        userId: 'user-5', // Eve
        supplier: 'OEM Parts Co.',
        notes: 'Weekly restock.',
        items: [
            { productId: 'prod-1', productName: 'iPhone 15 Pro Screen', quantity: 10 },
            { productId: 'prod-2', productName: 'MacBook Pro M3 Battery', quantity: 5 },
        ]
    },
    {
        id: 'sr-2',
        date: '2024-07-18T15:30:00Z',
        userId: 'user-2', // Bob
        supplier: 'Accessory World',
        items: [
            { productId: 'prod-3', productName: 'USB-C Charging Cable', quantity: 50 },
            { productId: 'prod-6', productName: 'Wireless Mouse', quantity: 20 },
        ]
    },
];

export const initialAuditLogs: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '2024-07-23T10:05:00Z', userId: 'user-5', action: 'Complete Sale', details: 'Invoice INV-003 created for New Customer.' },
  { id: 'log-2', timestamp: '2024-07-22T15:00:00Z', userId: 'tech-1', action: 'Update Repair Ticket', details: 'Ticket T-2403 status changed to Diagnosing.' },
  { id: 'log-3', timestamp: '2024-07-21T10:30:00Z', userId: 'user-2', action: 'Update Repair Ticket', details: 'Ticket T-2402 status changed to Waiting for Part.' },
  { id: 'log-4', timestamp: '2024-07-20T10:00:00Z', userId: 'user-5', action: 'Receive Stock', details: 'Received 2 item types from OEM Parts Co.' },
];
