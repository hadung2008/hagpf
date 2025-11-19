export enum RepairStatus {
    PENDING = 'Pending',
    DIAGNOSING = 'Diagnosing',
    REPAIRING = 'Repairing',
    WAITING_FOR_PART = 'Waiting for Part',
    COMPLETED = 'Completed',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    purchaseHistory?: string[]; // Array of Invoice IDs
}

export interface Technician {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    costPrice?: number;
    supplier?: string;
    stock: number;
    warrantyPeriodInMonths?: number;
}

export interface StatusUpdate {
    timestamp: string;
    status: RepairStatus;
    notes?: string;
}

export interface RepairTicket {
    id: string;
    customerId: string;
    technicianId?: string;
    deviceType: 'Phone' | 'Laptop' | 'Tablet' | 'Other';
    deviceSerial: string;
    deviceModel: string;
    reportedIssue: string;
    diagnosis?: string;
    partsUsed?: { productId: string; quantity: number; unitPrice: number }[];
    laborCost?: number;
    totalCost?: number;
    dateReceived: string;
    dateCompleted?: string;
    status: RepairStatus;
    statusHistory: StatusUpdate[];
    warrantyPeriodInMonths?: number;
}

// New types for Sales module
export interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    customerId: string;
    customerName: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    tax: number; // as a value, not percentage
    taxRate: number; // The percentage used for the calculation
    total: number;
    date: string;
    salespersonId: string; // User ID
}

// New types for Inventory Receiving
export interface StockReceiveItem {
    productId: string;
    productName: string;
    quantity: number;
}

export interface StockReceiveLog {
    id: string;
    date: string;
    userId: string; // User ID of who received it
    items: StockReceiveItem[];
    supplier?: string;
    notes?: string;
}

// New types for Management & Reports
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}
