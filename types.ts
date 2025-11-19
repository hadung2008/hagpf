
// FIX: Consolidating all approval-flow-related types here from apps/ApprovalFlow/types.ts
// to resolve widespread import errors in shared components.
export enum UserRole {
  EMPLOYEE = 'Employee',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  FINANCE = 'Finance',
  ADMIN = 'Admin',
}

export enum Department {
  IT = 'IT',
  HR = 'Human Resources',
  FINANCE = 'Finance',
  MARKETING = 'Marketing',
  SALES = 'Sales',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: Department;
}

export enum FormFieldType {
  TEXT = 'Text',
  NUMBER = 'Number',
  TEXTAREA = 'Text Area',
  DATE = 'Date',
  DROPDOWN = 'Dropdown',
  FILE = 'File',
  DOWNLOAD_LINK = 'Download Link',
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: any;
}

export interface FormTemplate {
  id: string;
  name: string;
  department: Department;
  fields: FormField[];
}

export enum WorkflowStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

export enum ApprovalAction {
  APPROVE = 'Approve',
  REJECT = 'Reject',
  REVERT = 'Revert',
  SUBMIT = 'Submit',
}

export interface Condition {
  field: string; // This will be a FormField ID
  operator: '>' | '<' | '=' | '!=';
  value: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  approverRole?: UserRole; // Now optional
  approverUsers?: string[]; // Array of User IDs
  condition?: Condition;
  trueStepId?: string; // Next step if condition is true
  falseStepId?: string; // Next step if condition is false (or no condition)
  sendEmailNotification?: boolean;
}

export interface Workflow {
  id:string;
  name: string;
  formTemplateId: string;
  steps: WorkflowStep[];
  startStepId: string;
  department?: Department;
}

export interface Document {
  id: string;
  name:string;
  formTemplateId: string;
  createdBy: string; // User ID
  createdAt: string;
  formData: Record<string, any>; // Stores data from dynamic fields
  department: Department;
}

export interface HistoryLog {
  timestamp: string;
  actor: string; // User ID
  action: ApprovalAction;
  notes: string;
  stepName: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  documentId: string;
  status: WorkflowStatus;
  currentStepId: string | null;
  history: HistoryLog[];
}