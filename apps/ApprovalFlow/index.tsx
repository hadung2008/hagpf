import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { fetchApprovalFlowData, saveWorkflow, deleteWorkflow, saveFormTemplate, deleteFormTemplate, saveDocumentAndInstance, saveInstance } from '../../lib/mockApi';
import { ApprovalAction, WorkflowStatus, FormTemplate, Workflow, Document, WorkflowInstance, Department } from './types';
import { ClockIcon, PlusCircleIcon, DocumentDuplicateIcon, LockClosedIcon } from '../../components/icons';
import { WorkflowInstanceView } from './components/WorkflowInstanceView';
import { StatusBadge } from '../../components/StatusBadge';
import { WorkflowEditor } from './components/WorkflowEditor';
import { DocumentSubmissionForm } from './components/DocumentSubmissionForm';
import { FormTemplateEditor } from './components/FormTemplateEditor';
import { NewRequestSelector } from './components/NewRequestSelector';
import { Header, ActiveView } from './components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useTranslation } from '../../lib/i18n';

interface ApprovalFlowAppProps {
    currentUser: User;
    allUsers: User[];
    onLogout: () => void;
    onBackToApps: () => void;
    effectivePermissions: Record<string, boolean>;
    theme: string;
    setTheme: (theme: string) => void;
}

const AccessDenied: React.FC<{ resource: string }> = ({ resource }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <LockClosedIcon className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-red-500">{t('approvalFlow.index.accessDenied.title')}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('approvalFlow.index.accessDenied.message', { resource })}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('approvalFlow.index.accessDenied.contactAdmin')}</p>
        </div>
    );
};

export const ApprovalFlowApp: React.FC<ApprovalFlowAppProps> = ({ currentUser, allUsers, onLogout, onBackToApps, effectivePermissions, theme, setTheme }) => {
    const { t } = useTranslation();
    const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [instances, setInstances] = useState<WorkflowInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
    
    const [isWorkflowEditorOpen, setIsWorkflowEditorOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
    
    const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
    const [submittingFormTemplate, setSubmittingFormTemplate] = useState<FormTemplate | null>(null);

    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
    
    const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
    const [editingFormTemplate, setEditingFormTemplate] = useState<FormTemplate | null>(null);

    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const [activeDepartmentTab, setActiveDepartmentTab] = useState<Department | 'All'>('All');
    const [activeWorkflowTab, setActiveWorkflowTab] = useState<Department | 'All'>('All');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchApprovalFlowData();
            setFormTemplates(data.formTemplates);
            setWorkflows(data.workflows);
            setDocuments(data.documents);
            setInstances(data.instances);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const hasPermission = (permissionKey: string) => !!effectivePermissions[permissionKey];

    const handleApprovalAction = async (instanceId: string, action: ApprovalAction, notes: string) => {
        const originalInstances = instances;
        let updatedInstance: WorkflowInstance | null = null;

        const updatedInstances = originalInstances.map(instance => {
            if (instance.id !== instanceId) return instance;

            const workflow = workflows.find(w => w.id === instance.workflowId);
            const document = documents.find(d => d.id === instance.documentId);
            const currentStep = workflow?.steps.find(s => s.id === instance.currentStepId);

            if (!workflow || !document || !currentStep) return instance;

            updatedInstance = { ...instance, history: [...instance.history, {
                timestamp: new Date().toISOString(),
                actor: currentUser.id,
                action: action,
                notes: notes,
                stepName: currentStep.name
            }]};

            if (action === ApprovalAction.REJECT) {
                updatedInstance.status = WorkflowStatus.REJECTED;
                updatedInstance.currentStepId = null;
            } else if (action === ApprovalAction.APPROVE) {
                let nextStepId: string | null | undefined = null;
                if (currentStep.condition) {
                    const docValue = document.formData[currentStep.condition.field];
                    let conditionMet = false;
                    if (typeof docValue === 'number') {
                        switch(currentStep.condition.operator) {
                            case '>': conditionMet = docValue > currentStep.condition.value; break;
                            case '<': conditionMet = docValue < currentStep.condition.value; break;
                            case '=': conditionMet = docValue === currentStep.condition.value; break;
                            case '!=': conditionMet = docValue !== currentStep.condition.value; break;
                        }
                    }
                    nextStepId = conditionMet ? currentStep.trueStepId : currentStep.falseStepId;
                } else {
                    nextStepId = currentStep.falseStepId;
                }
                
                if (nextStepId) {
                    updatedInstance.currentStepId = nextStepId;
                    updatedInstance.status = WorkflowStatus.PENDING_APPROVAL;
                } else {
                    updatedInstance.currentStepId = null;
                    updatedInstance.status = WorkflowStatus.COMPLETED;
                }
            } else if (action === ApprovalAction.REVERT) {
                 const previousHistoryEntry = instance.history[instance.history.length - 2];
                 const previousStep = workflow.steps.find(s => s.name === previousHistoryEntry.stepName);
                 if (previousStep) {
                    updatedInstance.currentStepId = previousStep.id;
                    updatedInstance.status = WorkflowStatus.PENDING_APPROVAL;
                 }
            }
            return updatedInstance;
        });

        setInstances(updatedInstances);
        try {
            if (updatedInstance) {
                await saveInstance(updatedInstance);
            }
        } catch (error) {
            console.error("Failed to save instance update:", error);
            setInstances(originalInstances); // Revert on failure
        }
    };

    const handleOpenWorkflowEditor = () => {
        setEditingWorkflow({
            id: `wf-${Date.now()}`,
            name: '',
            formTemplateId: formTemplates.length > 0 ? formTemplates[0].id : '',
            steps: [],
            startStepId: '',
        });
        setIsWorkflowEditorOpen(true);
    };

    const handleEditWorkflow = (workflowToEdit: Workflow) => {
        setEditingWorkflow(workflowToEdit);
        setIsWorkflowEditorOpen(true);
    };

    const handleCloseWorkflowEditor = () => {
        setIsWorkflowEditorOpen(false);
        setEditingWorkflow(null);
    };
    
    const handleSaveWorkflow = async (workflowToSave: Workflow) => {
        if (!workflowToSave.name.trim() || workflowToSave.steps.length === 0) {
            alert(t('approvalFlow.alerts.workflowNameAndStepRequired'));
            return;
        }

        const isEditing = workflows.some(wf => wf.id === workflowToSave.id);

        const finalSteps = workflowToSave.steps.map((step, index, arr) => ({
            ...step,
            id: step.id.startsWith('new-') ? `step-${workflowToSave.id}-${index}`: step.id,
            falseStepId: (index < arr.length - 1) ? (arr[index+1].id.startsWith('new-') ? `step-${workflowToSave.id}-${index + 1}` : arr[index+1].id) : undefined,
        }));

        const finalWorkflow: Workflow = {
            ...workflowToSave,
            steps: finalSteps,
            startStepId: finalSteps.length > 0 ? finalSteps[0].id : '',
        };

        handleCloseWorkflowEditor();
        await saveWorkflow(finalWorkflow);

        if (isEditing) {
            setWorkflows(prev => prev.map(wf => wf.id === finalWorkflow.id ? finalWorkflow : wf));
        } else {
            setWorkflows(prev => [...prev, finalWorkflow]);
        }
    };

    const handleDeleteWorkflow = async (workflowId: string) => {
        const isUsed = instances.some(inst => inst.workflowId === workflowId);
        if (isUsed) {
            alert(t('approvalFlow.alerts.deleteWorkflowInUse'));
            return;
        }
        if (window.confirm(t('approvalFlow.alerts.deleteWorkflowConfirm'))) {
            await deleteWorkflow(workflowId);
            setWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
        }
    };

    const handleOpenSubmissionForm = (template: FormTemplate) => {
        setSubmittingFormTemplate(template);
        setIsSubmissionFormOpen(true);
    };
    const handleCloseSubmissionForm = () => {
        setIsSubmissionFormOpen(false);
        setSubmittingFormTemplate(null);
    };

    const handleSubmitDocument = async (data: { name: string; formData: Record<string, any>; formTemplateId: string }) => {
        const { name, formData, formTemplateId } = data;
        const workflow = workflows.find(wf => wf.formTemplateId === formTemplateId);
        if (!workflow) {
            alert(t('approvalFlow.alerts.noWorkflowForForm'));
            return;
        }
        
        const formTemplate = formTemplates.find(ft => ft.id === formTemplateId);
        if (!formTemplate) {
            alert(t('approvalFlow.alerts.invalidFormTemplate'));
            return;
        }

        const newDocument: Document = {
            id: `doc-${Date.now()}`,
            name,
            formTemplateId,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            formData,
            department: formTemplate.department,
        };

        const newInstance: WorkflowInstance = {
            id: `inst-${Date.now()}`,
            workflowId: workflow.id,
            documentId: newDocument.id,
            status: WorkflowStatus.PENDING_APPROVAL,
            currentStepId: workflow.startStepId,
            history: [{
                timestamp: new Date().toISOString(),
                actor: currentUser.id,
                action: ApprovalAction.SUBMIT,
                notes: 'Initial submission',
                stepName: 'Start',
            }],
        };
        
        handleCloseSubmissionForm();
        await saveDocumentAndInstance(newDocument, newInstance);
        setDocuments(prev => [...prev, newDocument]);
        setInstances(prev => [...prev, newInstance]);
    };

    const handleSaveFormTemplate = async (templateData: FormTemplate | Omit<FormTemplate, 'id'>) => {
        let savedTemplate: FormTemplate;
        if ('id' in templateData) {
            savedTemplate = templateData;
            setFormTemplates(prev => prev.map(ft => ft.id === savedTemplate.id ? savedTemplate : ft));
        } else {
            savedTemplate = {
                id: `ft-${Date.now()}`,
                ...templateData,
                fields: templateData.fields.map((field, index) => ({
                    ...field,
                    id: `field-${Date.now()}-${index}`
                }))
            };
            setFormTemplates(prev => [...prev, savedTemplate]);
        }
        
        setIsTemplateEditorOpen(false);
        setEditingFormTemplate(null);
        await saveFormTemplate(savedTemplate);
    };
    
    const handleEditFormTemplate = (template: FormTemplate) => {
        setEditingFormTemplate(template);
        setIsTemplateEditorOpen(true);
    };

    const handleDeleteFormTemplate = async (templateId: string) => {
        const isUsed = workflows.some(wf => wf.formTemplateId === templateId);
        if (isUsed) {
            alert(t('approvalFlow.alerts.deleteTemplateInUse'));
            return;
        }

        if (window.confirm(t('approvalFlow.alerts.deleteTemplateConfirm'))) {
            await deleteFormTemplate(templateId);
            setFormTemplates(prev => prev.filter(ft => ft.id !== templateId));
        }
    };
    
    const approvalTasks = useMemo(() => {
        return instances.filter(inst => {
            if (inst.status !== WorkflowStatus.PENDING_APPROVAL) return false;
            const workflow = workflows.find(w => w.id === inst.workflowId);
            const currentStep = workflow?.steps.find(s => s.id === inst.currentStepId);
            if (!currentStep) return false;

            const isForRole = currentStep.approverRole === currentUser.role;
            const isForUser = currentStep.approverUsers?.includes(currentUser.id);

            return isForRole || isForUser;
        });
    }, [instances, workflows, currentUser]);

    const submittedDocuments = useMemo(() => {
        return instances.filter(inst => {
            const document = documents.find(d => d.id === inst.documentId);
            return document?.createdBy === currentUser.id;
        });
    }, [instances, documents, currentUser]);
    
    const selectedInstance = selectedInstanceId ? instances.find(i => i.id === selectedInstanceId) : null;
    const selectedWorkflow = selectedInstance ? workflows.find(w => w.id === selectedInstance.workflowId) : null;
    const selectedDocument = selectedInstance ? documents.find(d => d.id === selectedInstance.documentId) : null;
    const selectedFormTemplate = selectedDocument ? formTemplates.find(ft => ft.id === selectedDocument.formTemplateId) : null;

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner message={t('approvalFlow.index.loading')} />;
        }
        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <ClockIcon className="w-6 h-6 mr-2 text-blue-500" /> {t('approvalFlow.index.dashboard.myTasks')}
                            </h2>
                            <div className="space-y-4">
                                {approvalTasks.length > 0 ? approvalTasks.map(instance => {
                                    const doc = documents.find(d => d.id === instance.documentId);
                                    const wf = workflows.find(w => w.id === instance.workflowId);
                                    const step = wf?.steps.find(s => s.id === instance.currentStepId);
                                    if (!doc || !wf || !step) return null;
                                    return (
                                        <div key={instance.id} onClick={() => setSelectedInstanceId(instance.id)} className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{doc.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvalFlow.index.dashboard.waitingOnStep', { stepName: step.name })}</p>
                                                </div>
                                                <StatusBadge status={instance.status} />
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-gray-500 dark:text-gray-400">{t('approvalFlow.index.dashboard.noTasks')}</p>}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold flex items-center mb-4">
                                <DocumentDuplicateIcon className="w-6 h-6 mr-2 text-green-500" /> {t('approvalFlow.index.dashboard.mySubmissions')}
                            </h2>
                            <div className="space-y-4">
                                {submittedDocuments.length > 0 ? submittedDocuments.map(instance => {
                                    const doc = documents.find(d => d.id === instance.documentId);
                                    const wf = workflows.find(w => w.id === instance.workflowId);
                                    const step = wf?.steps.find(s => s.id === instance.currentStepId);
                                    if (!doc) return null;
                                    
                                    let approverText = t('approvalFlow.index.dashboard.finished');
                                    if (step) {
                                        if(step.approverRole) {
                                            approverText = `${step.name} (${t(`enums.userRoles.${step.approverRole}`)})`;
                                        } else if (step.approverUsers) {
                                            const userNames = step.approverUsers.map(uid => allUsers.find(u => u.id === uid)?.name.split(' ')[0] || 'Unknown').join(', ');
                                            approverText = `${step.name} (${userNames})`;
                                        }
                                    }
                                    
                                    return (
                                        <div key={instance.id} onClick={() => setSelectedInstanceId(instance.id)} className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{doc.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {t('approvalFlow.index.dashboard.currentStep', { step: approverText })}
                                                    </p>
                                                </div>
                                                <StatusBadge status={instance.status} />
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-gray-500 dark:text-gray-400">{t('approvalFlow.index.dashboard.noSubmissions')}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'form-templates':
                if (!hasPermission('approvalFlow.templates.READ')) return <AccessDenied resource={t('approvalFlow.header.formTemplates')} />;
                return (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('approvalFlow.index.templates.title')}</h2>
                            {hasPermission('approvalFlow.templates.CREATE') && (
                                <button onClick={() => { setEditingFormTemplate(null); setIsTemplateEditorOpen(true); }} className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                                    <PlusCircleIcon className="w-5 h-5 mr-1.5" /> {t('approvalFlow.index.templates.create')}
                                </button>
                            )}
                        </div>
                            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                {(['All', ...Object.values(Department)] as const).map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => setActiveDepartmentTab(dept)}
                                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeDepartmentTab === dept
                                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        {dept === 'All' ? t('general.all') : t(`enums.departments.${dept}`)}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="space-y-2">
                            {formTemplates
                            .filter(ft => activeDepartmentTab === 'All' || ft.department === activeDepartmentTab)
                            .map(ft => (
                                <div key={ft.id} className="p-3 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{ft.name} <span className="text-xs font-normal bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full ml-2">{t(`enums.departments.${ft.department}`)}</span></p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvalFlow.index.templates.fieldsCount', { count: ft.fields.length })}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {hasPermission('approvalFlow.templates.UPDATE') && <button onClick={() => handleEditFormTemplate(ft)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">{t('general.edit')}</button>}
                                        {hasPermission('approvalFlow.templates.DELETE') && <button onClick={() => handleDeleteFormTemplate(ft.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t('general.delete')}</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
             case 'workflows':
                 if (!hasPermission('approvalFlow.workflows.READ')) return <AccessDenied resource={t('approvalFlow.header.workflows')} />;
                 return (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('approvalFlow.index.workflows.title')}</h2>
                             {hasPermission('approvalFlow.workflows.CREATE') && (
                                <button onClick={handleOpenWorkflowEditor} className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm">
                                    <PlusCircleIcon className="w-5 h-5 mr-1.5" /> {t('approvalFlow.index.workflows.create')}
                                </button>
                             )}
                        </div>
                            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                {(['All', ...Object.values(Department)] as const).map((dept) => (
                                    <button
                                        key={dept}
                                        onClick={() => setActiveWorkflowTab(dept)}
                                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeWorkflowTab === dept
                                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        {dept === 'All' ? t('general.all') : t(`enums.departments.${dept}`)}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="space-y-3">
                            {workflows
                            .filter(wf => activeWorkflowTab === 'All' || wf.department === activeWorkflowTab)
                            .map(wf => {
                                const formName = formTemplates.find(ft => ft.id === wf.formTemplateId)?.name || t('general.na');
                                return (
                                    <div key={wf.id} className="p-3 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{wf.name} {wf.department && <span className="text-xs font-normal bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full ml-2">{t(`enums.departments.${wf.department}`)}</span>}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvalFlow.index.workflows.form', { name: formName })} | {t('approvalFlow.index.workflows.steps', { count: wf.steps.length })}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            {hasPermission('approvalFlow.workflows.UPDATE') && <button onClick={() => handleEditWorkflow(wf)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">{t('general.edit')}</button>}
                                            {hasPermission('approvalFlow.workflows.DELETE') && <button onClick={() => handleDeleteWorkflow(wf.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t('general.delete')}</button>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header 
                currentUser={currentUser} 
                onLogout={onLogout}
                onBackToApps={onBackToApps}
                activeView={activeView}
                onNavigate={(view) => setActiveView(view)}
                onNewRequest={() => setIsNewRequestModalOpen(true)}
                hasPermission={hasPermission}
                theme={theme}
                setTheme={setTheme}
            />
            <main className="container mx-auto p-4 md:p-6">
                {renderContent()}
            </main>

            {isNewRequestModalOpen && (
                <NewRequestSelector
                    formTemplates={formTemplates}
                    onClose={() => setIsNewRequestModalOpen(false)}
                    onSelect={(template) => {
                        setIsNewRequestModalOpen(false);
                        handleOpenSubmissionForm(template);
                    }}
                />
            )}

            {isSubmissionFormOpen && submittingFormTemplate && (
                <DocumentSubmissionForm 
                    formTemplate={submittingFormTemplate}
                    onSave={handleSubmitDocument}
                    onClose={handleCloseSubmissionForm}
                />
            )}
            
            {isTemplateEditorOpen && (
                <FormTemplateEditor 
                    template={editingFormTemplate}
                    onSave={handleSaveFormTemplate}
                    onClose={() => {
                        setIsTemplateEditorOpen(false);
                        setEditingFormTemplate(null);
                    }}
                />
            )}

            {isWorkflowEditorOpen && editingWorkflow && (
                <WorkflowEditor
                    workflow={editingWorkflow}
                    formTemplates={formTemplates}
                    users={allUsers}
                    onSave={handleSaveWorkflow}
                    onClose={handleCloseWorkflowEditor}
                />
            )}

            {selectedInstance && selectedWorkflow && selectedDocument && selectedFormTemplate && (
                <WorkflowInstanceView 
                    instance={selectedInstance}
                    workflow={selectedWorkflow}
                    document={selectedDocument}
                    formTemplate={selectedFormTemplate}
                    currentUser={currentUser}
                    users={allUsers}
                    onApprove={(id, notes) => handleApprovalAction(id, ApprovalAction.APPROVE, notes)}
                    onReject={(id, notes) => handleApprovalAction(id, ApprovalAction.REJECT, notes)}
                    onRevert={(id, notes) => handleApprovalAction(id, ApprovalAction.REVERT, notes)}
                    onClose={() => setSelectedInstanceId(null)}
                />
            )}
        </div>
    );
};