import { Role, ManagedUser, PermissionMatrix, Application, UserRoleAssignment, PermissionAction, PermissionFunction, PermissionActionDefinition, PermissionActionGroup } from './types';

export const applications: Application[] = [
    { id: 'app-1', name: 'Main Management Portal' },
    { id: 'ApprovalFlow', name: 'Approval Flow' },
    { id: 'RepairShop', name: 'H3TECH Store Operations' },
];

export const initialRoles: Role[] = [
    { id: 'administrator', name: 'Administrator', description: 'Full access to all features.' },
    { id: 'manager', name: 'Manager', description: 'Can manage team members and content.' },
    { id: 'read-only', name: 'Read-Only User', description: 'Can only view information.' },
    { id: 'editor', name: 'Content Editor', description: 'Can create and edit content.' },
    { id: 'auditor', name: 'Auditor', description: 'Has read-only access for auditing purposes.' }
];

export const initialUsers: ManagedUser[] = [
    {
        id: 'user-1',
        fullName: 'Alice Johnson (Admin)',
        username: 'alice',
        email: 'alice.j@example.com',
        roles: [
            { appName: 'Main Management Portal', roleName: 'Administrator' },
            { appName: 'Approval Flow', roleName: 'Administrator' }
        ]
    },
    {
        id: 'user-2',
        fullName: 'Bob Williams (Manager)',
        username: 'bob',
        email: 'bob.w@example.com',
        roles: [
            { appName: 'Main Management Portal', roleName: 'Manager' },
            { appName: 'Approval Flow', roleName: 'Manager' }
        ]
    },
    {
        id: 'user-3',
        fullName: 'Charlie Brown (User)',
        username: 'charlie',
        email: 'charlie.b@example.com',
        roles: [
            { appName: 'Main Management Portal', roleName: 'Read-Only User' },
            { appName: 'Approval Flow', roleName: 'Content Editor' } // Example: can submit requests
        ]
    },
    {
        id: 'user-4',
        fullName: 'Diana Prince (Manager/Editor)',
        username: 'diana',
        email: 'diana.p@example.com',
        roles: [
            { appName: 'Main Management Portal', roleName: 'Manager' },
            { appName: 'Approval Flow', roleName: 'Manager' }
        ]
    },
    {
        id: 'user-5',
        fullName: 'Dung Ha (Auditor)',
        username: 'dungha', // Matches the login name 'Eve'
        email: 'dungha.n@example.com',
        roles: [
            { appName: 'Main Management Portal', roleName: 'Auditor' },
            { appName: 'Approval Flow', roleName: 'Administrator' }, // Eve is Admin in the other app
            { appName: 'H3TECH Store Operations', roleName: 'Administrator' }
        ]
    },
     {
        id: 'user-6',
        fullName: 'Frank Thomas (Employee)',
        username: 'frank',
        email: 'frank.t@example.com',
        roles: [
            { appName: 'Approval Flow', roleName: 'Content Editor' }
        ]
    },
    {
        id: 'user-7',
        fullName: 'Grace Hopper (Manager)',
        username: 'grace',
        email: 'grace.h@example.com',
        roles: [
            { appName: 'Approval Flow', roleName: 'Manager' }
        ]
    }
];

export const initialPermissionActionGroups: PermissionActionGroup[] = [
    {
        id: 'standard',
        name: 'Standard Actions',
        actions: [
            { id: 'CREATE', name: 'Create', icon: 'PlusIcon' },
            { id: 'READ', name: 'Read', icon: 'EyeIcon' },
            { id: 'UPDATE', name: 'Update', icon: 'PencilIcon' },
            { id: 'DELETE', name: 'Delete', icon: 'TrashIcon' },
        ]
    },
    {
        id: 'data',
        name: 'Data Management',
        actions: [
            { id: 'EXPORT', name: 'Export', icon: 'ArrowDownTrayIcon' },
        ]
    },
    {
        id: 'custom',
        name: 'Custom Actions',
        actions: [
            { id: 'TEST', name: 'Test', icon: 'BeakerIcon' },
        ]
    }
];

export const permissionActions: PermissionActionDefinition[] = initialPermissionActionGroups.flatMap(g => g.actions);

// FIX: Added 'TEST' to availableActions for all functions to align with global permissions and type definitions.
export const permissionFunctions: PermissionFunction[] = [
    {
        id: 'userManagement', name: 'User Management', level: 0,
        availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'TEST'],
        subFunctions: [
            { id: 'users', name: 'Users', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'roles', name: 'Roles', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
        ]
    },
    { id: 'dashboard', name: 'Dashboard', level: 0, availableActions: ['READ', 'TEST'] },
    {
        id: 'reporting', name: 'Reporting', level: 0,
        availableActions: ['READ', 'EXPORT', 'TEST'],
        subFunctions: [
            { id: 'salesReports', name: 'Sales Reports', level: 1, availableActions: ['READ', 'EXPORT', 'TEST'] },
            { id: 'auditLogs', name: 'Audit Logs', level: 1, availableActions: ['READ', 'EXPORT', 'TEST'] },
        ]
    },
    { id: 'definitions', name: 'Definitions', level: 0, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'TEST'] },
    {
        id: 'approvalFlow', name: 'Approval Flow', level: 0,
        availableActions: ['READ', 'TEST'],
        subFunctions: [
            { id: 'approvalFlow.templates', name: 'Form Templates', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'approvalFlow.workflows', name: 'Workflows', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'approvalFlow.requests', name: 'Requests', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
        ]
    },
    {
        id: 'repairShop', name: 'H3TECH Store Operations', level: 0,
        availableActions: ['READ', 'TEST'],
        subFunctions: [
            { id: 'repairShop.products', name: 'Products', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'repairShop.sales', name: 'Sales (POS)', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'repairShop.customers', name: 'Customers', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'repairShop.repairs', name: 'Repair Tickets', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'repairShop.inventory', name: 'Inventory', level: 1, availableActions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'TEST'] },
            { id: 'repairShop.reports', name: 'Reports', level: 1, availableActions: ['READ', 'EXPORT', 'TEST'] },
        ]
    }
];

const allPermissionFunctions: PermissionFunction[] = [];
const populateAllFunctions = (functions: PermissionFunction[]) => {
    functions.forEach(f => {
        allPermissionFunctions.push(f);
        if (f.subFunctions) {
            populateAllFunctions(f.subFunctions);
        }
    });
};
populateAllFunctions(permissionFunctions);

export const flatPermissions: string[] = [];
export const permissionLabels: Record<string, string> = {};

allPermissionFunctions.forEach(func => {
    func.availableActions.forEach(action => {
        const key = `${func.id}.${action}`;
        flatPermissions.push(key);
        const actionLabel = action.charAt(0) + action.slice(1).toLowerCase();
        permissionLabels[key] = `${func.name} - ${actionLabel}`;
    });
});

const generatePermissions = (functions: PermissionFunction[], settings: Record<string, PermissionAction[]>) => {
    const permissions: Record<string, boolean> = {};
    const processFunc = (func: PermissionFunction) => {
        const enabledActions = settings[func.id] || [];
        func.availableActions.forEach(action => {
            permissions[`${func.id}.${action}`] = enabledActions.includes(action);
        });
        if (func.subFunctions) {
            func.subFunctions.forEach(processFunc);
        }
    };
    functions.forEach(processFunc);
    return permissions;
};


export const initialPermissions: PermissionMatrix = {
    'administrator': generatePermissions(permissionFunctions, {
        'userManagement': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
        'users': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'roles': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'dashboard': ['READ'],
        'reporting': [],
        'salesReports': ['READ'],
        'auditLogs': ['READ'],
        'definitions': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
        'approvalFlow': ['READ'],
        'approvalFlow.templates': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'approvalFlow.workflows': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'approvalFlow.requests': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop': ['READ'],
        'repairShop.products': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop.sales': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop.customers': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop.repairs': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop.inventory': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        'repairShop.reports': ['READ', 'EXPORT'],
    }),
    'manager': generatePermissions(permissionFunctions, {
        'userManagement': ['READ'],
        'users': ['CREATE', 'READ', 'UPDATE'],
        'roles': ['READ'],
        'dashboard': ['READ'],
        'reporting': ['READ', 'EXPORT'],
        'salesReports': ['READ', 'EXPORT'],
        'auditLogs': ['READ'],
        'definitions': ['READ'],
        'approvalFlow': ['READ'],
        'approvalFlow.templates': ['READ'],
        'approvalFlow.workflows': ['READ'],
        'approvalFlow.requests': ['CREATE', 'READ', 'UPDATE'],
        'repairShop': ['READ'],
        'repairShop.products': ['READ', 'UPDATE'],
        'repairShop.sales': ['CREATE', 'READ'],
        'repairShop.customers': ['CREATE', 'READ', 'UPDATE'],
        'repairShop.repairs': ['CREATE', 'READ', 'UPDATE'],
        'repairShop.inventory': ['READ', 'UPDATE'],
        'repairShop.reports': ['READ', 'EXPORT'],
    }),
     'read-only': generatePermissions(permissionFunctions, {
        'dashboard': ['READ'],
        'salesReports': ['READ'],
        'approvalFlow': ['READ'],
        'approvalFlow.templates': ['READ'],
        'approvalFlow.workflows': ['READ'],
        'approvalFlow.requests': ['READ'],
        'repairShop': ['READ'],
        'repairShop.products': ['READ'],
        'repairShop.sales': ['READ'],
        'repairShop.customers': ['READ'],
        'repairShop.repairs': ['READ'],
        'repairShop.inventory': ['READ'],
        'repairShop.reports': ['READ'],
    }),
    'editor': generatePermissions(permissionFunctions, {
        'dashboard': ['READ'],
        'definitions': ['CREATE', 'READ', 'UPDATE'],
        'approvalFlow': ['READ'],
        'approvalFlow.requests': ['CREATE', 'READ'],
        'repairShop': ['READ'],
        'repairShop.sales': ['CREATE', 'READ'],
        'repairShop.repairs': ['CREATE', 'READ'],
        'repairShop.customers': ['CREATE', 'READ'],
    }),
    'auditor': generatePermissions(permissionFunctions, {
        'userManagement': ['READ', 'EXPORT'],
        'users': ['READ'],
        'roles': ['READ'],
        'dashboard': ['READ'],
        'reporting': ['READ', 'EXPORT'],
        'salesReports': ['READ', 'EXPORT'],
        'auditLogs': ['READ', 'EXPORT'],
        'definitions': ['READ', 'EXPORT'],
        'approvalFlow': ['READ', 'EXPORT'],
        'approvalFlow.templates': ['READ', 'EXPORT'],
        'approvalFlow.workflows': ['READ', 'EXPORT'],
        'approvalFlow.requests': ['READ', 'EXPORT'],
        'repairShop': ['READ'],
        'repairShop.products': ['READ', 'EXPORT'],
        'repairShop.sales': ['READ', 'EXPORT'],
        'repairShop.customers': ['READ', 'EXPORT'],
        'repairShop.repairs': ['READ', 'EXPORT'],
        'repairShop.inventory': ['READ', 'EXPORT'],
        'repairShop.reports': ['READ', 'EXPORT'],
    }),
};

export const initialGlobalPermissions: Record<string, boolean> = {
    'userManagement.CREATE': false,
    'userManagement.READ': false,
    'userManagement.UPDATE': false,
    'userManagement.DELETE': false,
    'userManagement.EXPORT': false,
    'userManagement.TEST': false,
    'users.CREATE': true,
    'users.READ': true,
    'users.UPDATE': true,
    'users.DELETE': true,
    'users.TEST': false,
    'roles.CREATE': true,
    'roles.READ': true,
    'roles.UPDATE': true,
    'roles.DELETE': true,
    'roles.TEST': false,
    'dashboard.READ': true,
    'dashboard.TEST': false,
    'reporting.CREATE': false,
    'reporting.READ': false,
    'reporting.UPDATE': false,
    'reporting.DELETE': false,
    'reporting.EXPORT': false,
    'reporting.TEST': false,
    'salesReports.READ': true,
    'salesReports.EXPORT': true,
    'salesReports.TEST': false,
    'auditLogs.READ': true,
    'auditLogs.EXPORT': true,
    'auditLogs.TEST': false,
    'definitions.CREATE': true,
    'definitions.READ': true,
    'definitions.UPDATE': true,
    'definitions.DELETE': true,
    'definitions.EXPORT': false,
    'definitions.TEST': false,
    'approvalFlow.READ': true,
    'approvalFlow.TEST': true,
    'approvalFlow.templates.CREATE': true,
    'approvalFlow.templates.READ': true,
    'approvalFlow.templates.UPDATE': true,
    'approvalFlow.templates.DELETE': true,
    'approvalFlow.templates.TEST': false,
    'approvalFlow.workflows.CREATE': true,
    'approvalFlow.workflows.READ': true,
    'approvalFlow.workflows.UPDATE': true,
    'approvalFlow.workflows.DELETE': true,
    'approvalFlow.workflows.TEST': false,
    'approvalFlow.requests.CREATE': true,
    'approvalFlow.requests.READ': true,
    'approvalFlow.requests.UPDATE': true,
    'approvalFlow.requests.DELETE': true,
    'approvalFlow.requests.TEST': false,
    'repairShop.READ': true,
    'repairShop.TEST': false,
    'repairShop.products.CREATE': true,
    'repairShop.products.READ': true,
    'repairShop.products.UPDATE': true,
    'repairShop.products.DELETE': true,
    'repairShop.products.TEST': false,
    'repairShop.sales.CREATE': true,
    'repairShop.sales.READ': true,
    'repairShop.sales.UPDATE': true,
    'repairShop.sales.DELETE': true,
    'repairShop.sales.TEST': false,
    'repairShop.customers.CREATE': true,
    'repairShop.customers.READ': true,
    'repairShop.customers.UPDATE': true,
    'repairShop.customers.DELETE': true,
    'repairShop.customers.TEST': false,
    'repairShop.repairs.CREATE': true,
    'repairShop.repairs.READ': true,
    'repairShop.repairs.UPDATE': true,
    'repairShop.repairs.DELETE': true,
    'repairShop.repairs.TEST': false,
    'repairShop.inventory.CREATE': true,
    'repairShop.inventory.READ': true,
    'repairShop.inventory.UPDATE': true,
    'repairShop.inventory.DELETE': true,
    'repairShop.inventory.TEST': false,
    'repairShop.reports.READ': true,
    'repairShop.reports.EXPORT': true,
    'repairShop.reports.TEST': false,
};