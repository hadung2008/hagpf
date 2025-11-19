import { FormTemplate, Workflow, Document, WorkflowInstance } from '../apps/ApprovalFlow/types';
import { initialFormTemplates, initialWorkflows, initialDocuments, initialInstances } from '../apps/ApprovalFlow/data';

import { Role, ManagedUser, PermissionMatrix, Application, PermissionFunction, PermissionActionGroup } from '../apps/RolePermissions/types';
import { initialGlobalPermissions, initialPermissions, initialRoles, initialUsers as initialManagedUsers, applications, permissionFunctions as staticPermissionFunctions, initialPermissionActionGroups } from '../apps/RolePermissions/data';

import { Customer, Technician, Product, RepairTicket, Invoice, StockReceiveLog, AuditLogEntry } from '../apps/RepairShop/types';
import { customers as initialCustomers, technicians as initialTechnicians, products as initialProducts, repairTickets as initialRepairTickets, initialInvoices, stockReceiveLogs as initialStockReceiveLogs, initialAuditLogs } from '../apps/RepairShop/data';
import { User, UserRole, Department } from '../types';

const LATENCY = 300; // ms

// --- Mock Database ---
let db = {
    formTemplates: [...initialFormTemplates],
    workflows: [...initialWorkflows],
    documents: [...initialDocuments],
    instances: [...initialInstances],
    roles: [...initialRoles],
    managedUsers: [...initialManagedUsers],
    permissions: JSON.parse(JSON.stringify(initialPermissions)),
    globalPermissions: {...initialGlobalPermissions},
    applications: [...applications],
    permissionFunctions: [...staticPermissionFunctions],
    permissionActionGroups: [...initialPermissionActionGroups],
    customers: [...initialCustomers],
    technicians: [...initialTechnicians],
    products: [...initialProducts],
    repairTickets: [...initialRepairTickets],
    invoices: [...initialInvoices],
    stockReceiveLogs: [...initialStockReceiveLogs],
    auditLogs: [...initialAuditLogs],
    allUsers: [
        { id: 'user-1', name: 'Alice (Employee)', role: UserRole.EMPLOYEE, department: Department.IT },
        { id: 'user-2', name: 'Bob (Manager)', role: UserRole.MANAGER, department: Department.IT },
        { id: 'user-3', name: 'Charlie (Director)', role: UserRole.DIRECTOR, department: Department.IT },
        { id: 'user-4', name: 'Diana (Finance)', role: UserRole.FINANCE, department: Department.FINANCE },
        { id: 'user-5', name: 'DungHa (Admin)', role: UserRole.ADMIN, department: Department.IT },
        { id: 'user-6', name: 'Frank (Employee)', role: UserRole.EMPLOYEE, department: Department.MARKETING },
        { id: 'user-7', name: 'Grace (Manager)', role: UserRole.MANAGER, department: Department.MARKETING },
    ],
};

// --- Generic API Simulation ---
function simulateRequest<T>(data: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data))); // Deep copy to prevent mutation issues
    }, LATENCY);
  });
}

// --- Specific API Endpoints ---

// App.tsx
export const fetchAllUsers = () => simulateRequest(db.allUsers);
export const fetchManagedUsers = () => simulateRequest(db.managedUsers);
export const fetchInitialRoles = () => simulateRequest(db.roles);
export const fetchInitialPermissions = () => simulateRequest(db.permissions);


// ApprovalFlow App
export const fetchApprovalFlowData = () => simulateRequest({
    formTemplates: db.formTemplates,
    workflows: db.workflows,
    documents: db.documents,
    instances: db.instances,
});

export const saveWorkflow = (workflow: Workflow) => {
    const index = db.workflows.findIndex(w => w.id === workflow.id);
    if (index > -1) {
        db.workflows[index] = workflow;
    } else {
        db.workflows.push(workflow);
    }
    return simulateRequest(workflow);
};

export const deleteWorkflow = (workflowId: string) => {
    db.workflows = db.workflows.filter(w => w.id !== workflowId);
    return simulateRequest({ success: true });
}

export const saveFormTemplate = (template: FormTemplate) => {
    const index = db.formTemplates.findIndex(ft => ft.id === template.id);
     if (index > -1) {
        db.formTemplates[index] = template;
    } else {
        db.formTemplates.push(template);
    }
    return simulateRequest(template);
};

export const deleteFormTemplate = (templateId: string) => {
    db.formTemplates = db.formTemplates.filter(ft => ft.id !== templateId);
    return simulateRequest({ success: true });
}

export const saveDocumentAndInstance = (doc: Document, instance: WorkflowInstance) => {
    db.documents.push(doc);
    db.instances.push(instance);
    return simulateRequest({ doc, instance });
};

export const saveInstance = (instance: WorkflowInstance) => {
    const index = db.instances.findIndex(i => i.id === instance.id);
    if(index > -1) {
        db.instances[index] = instance;
    }
    return simulateRequest(instance);
}


// RolePermissions App
export const fetchRolePermissionsData = () => simulateRequest({
    permissions: db.permissions,
    roles: db.roles,
    users: db.managedUsers,
    applications: db.applications,
    functions: db.permissionFunctions,
    actionGroups: db.permissionActionGroups,
    globalPermissions: db.globalPermissions
});

export const saveManagedUser = (user: ManagedUser) => {
    const index = db.managedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
        db.managedUsers[index] = user;
    } else {
        db.managedUsers.push(user);
    }
    return simulateRequest(user);
};

export const deleteManagedUser = (userId: string) => {
    db.managedUsers = db.managedUsers.filter(u => u.id !== userId);
    return simulateRequest({ success: true });
}

export const saveRole = (role: Role) => {
     const index = db.roles.findIndex(r => r.id === role.id);
    if (index === -1) {
        db.roles.push(role);
    }
    return simulateRequest(role);
}

export const savePermissions = (permissions: PermissionMatrix) => {
    db.permissions = permissions;
    return simulateRequest(permissions);
}

// RepairShop App
export const fetchRepairShopData = () => simulateRequest({
    repairTickets: db.repairTickets,
    customers: db.customers,
    technicians: db.technicians,
    products: db.products,
    invoices: db.invoices,
    stockReceiveLogs: db.stockReceiveLogs,
    auditLogs: db.auditLogs,
});

export const saveRepairTicket = (ticket: RepairTicket) => {
    const index = db.repairTickets.findIndex(t => t.id === ticket.id);
    if (index > -1) {
        db.repairTickets[index] = ticket;
    } else {
        db.repairTickets.push(ticket);
    }
    return simulateRequest(ticket);
}

export const saveProduct = (product: Product) => {
    const index = db.products.findIndex(p => p.id === product.id);
     if (index > -1) {
        db.products[index] = product;
    } else {
        db.products.push(product);
    }
    return simulateRequest(product);
}

export const deleteProduct = (productId: string) => {
    db.products = db.products.filter(p => p.id !== productId);
    return simulateRequest({ success: true });
}

export const saveCustomer = (customer: Customer) => {
    db.customers.push(customer);
    return simulateRequest(customer);
}

export const saveInvoice = (invoice: Invoice, updatedProducts: Product[], updatedCustomers: Customer[]) => {
    db.invoices.push(invoice);
    db.products = updatedProducts;
    db.customers = updatedCustomers;
    return simulateRequest(invoice);
}

export const saveStockReceiveLog = (log: StockReceiveLog, updatedProducts: Product[]) => {
    db.stockReceiveLogs.unshift(log);
    db.products = updatedProducts;
    return simulateRequest(log);
}
