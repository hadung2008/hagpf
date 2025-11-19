

// FIX: Replaced string literals with enum members for WorkflowStatus and ApprovalAction to resolve type errors.
import { FormTemplate, Workflow, Document, WorkflowInstance, FormFieldType, WorkflowStatus, ApprovalAction } from './types';
import { Department, UserRole } from '../../types';

export const initialFormTemplates: FormTemplate[] = [
    { 
      id: 'ft-1', name: 'Standard Purchase Order', department: Department.FINANCE,
      fields: [
        { id: 'field-1-1', label: 'Item Description', type: FormFieldType.TEXTAREA, required: true, placeholder: 'Provide a detailed description of the item(s).' },
        { id: 'field-1-2', label: 'Amount', type: FormFieldType.NUMBER, required: true, placeholder: 'e.g., 5000' },
        { id: 'field-1-3', label: 'Supplier', type: FormFieldType.TEXT, required: true, placeholder: 'e.g., Office Supplies Inc.' }
      ]
    },
    { 
      id: 'ft-2', name: 'Simple Contract Review', department: Department.MARKETING,
      fields: [
        { id: 'field-2-1', label: 'Contractor Name', type: FormFieldType.TEXT, required: true, placeholder: 'e.g., Creative Solutions LLC' },
        { id: 'field-2-2', label: 'Contract Value', type: FormFieldType.NUMBER, required: true, placeholder: 'e.g., 15000' },
        { id: 'field-2-3', label: 'Effective Date', type: FormFieldType.DATE, required: true }
      ]
    },
    { 
      id: 'ft-3', name: 'IT Hardware Request', department: Department.IT,
      fields: [
         { id: 'field-3-1', label: 'Hardware Type', type: FormFieldType.DROPDOWN, required: true, options: ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Other'] },
         { id: 'field-3-2', label: 'Justification', type: FormFieldType.TEXTAREA, required: true, placeholder: 'Explain why this hardware is needed.' },
         { id: 'field-3-3', label: 'Estimated Cost', type: FormFieldType.NUMBER, required: true, placeholder: 'e.g., 2500' }
      ]
    },
    { 
      id: 'ft-4', name: 'Software License Purchase', department: Department.IT,
      fields: [
        { id: 'field-4-1', label: 'Software Name', type: FormFieldType.TEXT, required: true, placeholder: 'e.g., Adobe Photoshop' },
        { id: 'field-4-2', label: 'Number of Seats', type: FormFieldType.NUMBER, required: true, placeholder: 'e.g., 5' },
        { id: 'field-4-3', label: 'Total Cost', type: FormFieldType.NUMBER, required: true, placeholder: 'e.g., 1250' }
      ]
    }
];

export const initialWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Standard Purchase Order',
    formTemplateId: 'ft-1',
    department: Department.FINANCE,
    startStepId: 'step-1-1',
    steps: [
      { id: 'step-1-1', name: 'Manager Approval', approverRole: UserRole.MANAGER, falseStepId: 'step-1-2' },
      { id: 'step-1-2', name: 'Director Approval (if > $10k)', approverRole: UserRole.DIRECTOR, condition: { field: 'field-1-2', operator: '>', value: 10000 }, trueStepId: 'step-1-3', falseStepId: 'step-1-3' },
      { id: 'step-1-3', name: 'Finance Finalization', approverUsers: ['user-4'], falseStepId: null } // Assigned to Diana (Finance)
    ]
  },
  {
    id: 'wf-2',
    name: 'Simple Contract Review',
    formTemplateId: 'ft-2',
    startStepId: 'step-2-1',
    steps: [
      { id: 'step-2-1', name: 'Manager Review', approverRole: UserRole.MANAGER, falseStepId: 'step-2-2' },
      { id: 'step-2-2', name: 'Director Signature', approverRole: UserRole.DIRECTOR, falseStepId: null }
    ]
  },
  {
    id: 'wf-3',
    name: 'IT Equipment Purchase',
    formTemplateId: 'ft-3',
    department: Department.IT,
    startStepId: 'step-3-1',
    steps: [
      { id: 'step-3-1', name: 'Manager Approval', approverUsers: ['user-2'], falseStepId: 'step-3-2' }, // Assigned to Bob (Manager)
      { id: 'step-3-2', name: 'Director Approval', approverRole: UserRole.DIRECTOR, falseStepId: null }
    ]
  }
];

export const initialDocuments: Document[] = [
    { id: 'doc-1', name: 'Office Chairs Purchase', formTemplateId: 'ft-1', createdBy: 'user-1', createdAt: new Date().toISOString(), formData: { 'field-1-1': '10 ergonomic chairs for the new office space.', 'field-1-2': 5000, 'field-1-3': 'Office Supplies Inc.' }, department: Department.FINANCE },
    { id: 'doc-2', name: 'Q4 Marketing Services Contract', formTemplateId: 'ft-2', createdBy: 'user-6', createdAt: new Date().toISOString(), formData: { 'field-2-1': 'Creative Solutions LLC', 'field-2-2': 15000, 'field-2-3': '2024-10-01' }, department: Department.MARKETING },
    { id: 'doc-3', name: 'New Laptop Purchase', formTemplateId: 'ft-3', createdBy: 'user-1', createdAt: new Date().toISOString(), formData: { 'field-3-1': 'Laptop', 'field-3-2': 'For new Senior Developer hire.', 'field-3-3': 2500 }, department: Department.IT }
];

export const initialInstances: WorkflowInstance[] = [
    { id: 'inst-1', workflowId: 'wf-1', documentId: 'doc-1', status: WorkflowStatus.PENDING_APPROVAL, currentStepId: 'step-1-1', history: [{ timestamp: new Date().toISOString(), actor: 'user-1', action: ApprovalAction.SUBMIT, notes: 'Initial submission', stepName: 'Start' }] },
    { id: 'inst-2', workflowId: 'wf-2', documentId: 'doc-2', status: WorkflowStatus.PENDING_APPROVAL, currentStepId: 'step-2-1', history: [{ timestamp: new Date().toISOString(), actor: 'user-6', action: ApprovalAction.SUBMIT, notes: 'Initial submission', stepName: 'Start' }] },
    { id: 'inst-3', workflowId: 'wf-3', documentId: 'doc-3', status: WorkflowStatus.REJECTED, currentStepId: 'step-3-1', history: [{ timestamp: new Date().toISOString(), actor: 'user-1', action: ApprovalAction.SUBMIT, notes: 'Initial submission', stepName: 'Start' }, { timestamp: new Date().toISOString(), actor: 'user-2', action: ApprovalAction.REJECT, notes: 'Budget too high for Q3', stepName: 'Manager Approval' }] }
];