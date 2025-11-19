

export interface Application {
    id: string;
    name: string;
}

export interface UserRoleAssignment {
    appName: string;
    roleName: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface ManagedUser {
    id: string;
    fullName: string;
    username: string;
    email: string;
    roles: UserRoleAssignment[];
}

export type PermissionMatrix = Record<string, Record<string, boolean>>;

// FIX: Added 'TEST' to the union type to accommodate the custom action.
export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'TEST';

export interface PermissionActionDefinition { 
    id: PermissionAction;
    name: string;
    icon: string;
}

export interface PermissionFunction {
  id: string;
  name: string;
  level: number;
  availableActions: PermissionAction[];
  subFunctions?: PermissionFunction[];
}

export interface PermissionActionGroup {
    id: string;
    name: string;
    actions: PermissionActionDefinition[];
}