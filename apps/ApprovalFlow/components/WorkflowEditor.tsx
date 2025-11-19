import React, { useState, useMemo } from 'react';
import { Workflow, WorkflowStep, FormTemplate, FormFieldType, Condition } from '../types';
import { User, UserRole, Department } from '../../../types';
import { PlusCircleIcon, XCircleIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface WorkflowEditorProps {
  workflow: Workflow;
  formTemplates: FormTemplate[];
  users: User[];
  onSave: (workflow: Workflow) => void;
  onClose: () => void;
}

const emptyStep = (): Omit<WorkflowStep, 'id' | 'falseStepId' | 'trueStepId'> => ({
    name: '',
    approverRole: UserRole.MANAGER,
    sendEmailNotification: false,
});


export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ workflow, formTemplates, users, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Workflow>(workflow);
    
    const isEditing = useMemo(() => !!workflow.startStepId, [workflow.startStepId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'department' && value === '') {
            const { department, ...rest } = formData;
            setFormData(rest as Workflow);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
        const newSteps = [...formData.steps];
        (newSteps[index] as any)[field] = value;
        
        // Ensure role and users are mutually exclusive
        if (field === 'approverRole') {
            delete newSteps[index].approverUsers;
        } else if (field === 'approverUsers') {
            delete newSteps[index].approverRole;
        }

        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const handleConditionChange = (stepIndex: number, field: keyof Condition, value: string | number) => {
        const newSteps = [...formData.steps];
        const stepToUpdate = newSteps[stepIndex];
        const oldCondition = stepToUpdate.condition ?? { field: '', operator: '>', value: 0 };

        let newCondition: Condition;

        if (field === 'field') {
            newCondition = { ...oldCondition, field: String(value) };
        } else if (field === 'operator') {
            newCondition = { ...oldCondition, operator: value as Condition['operator'] };
        } else if (field === 'value') {
            newCondition = { ...oldCondition, value: Number(value) };
        } else {
            newCondition = oldCondition;
        }

        newSteps[stepIndex] = { ...stepToUpdate, condition: newCondition };
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const toggleCondition = (stepIndex: number) => {
        const newSteps = [...formData.steps];
        if (newSteps[stepIndex].condition) {
             delete newSteps[stepIndex].condition;
        } else {
             newSteps[stepIndex].condition = { field: '', operator: '>', value: 0 };
        }
        setFormData(prev => ({ ...prev, steps: newSteps }));
    }


    const addStep = () => {
        const newStep: WorkflowStep = {
            ...emptyStep(),
            id: `new-${Date.now()}`, // Temporary ID
            name: t('approvalFlow.workflowEditor.step', { step: formData.steps.length + 1 }),
        };
        setFormData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    const removeStep = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const numericFields = useMemo(() => {
        const selectedTemplate = formTemplates.find(ft => ft.id === formData.formTemplateId);
        return selectedTemplate?.fields.filter(f => f.type === FormFieldType.NUMBER) || [];
    }, [formData.formTemplateId, formTemplates]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? t('approvalFlow.workflowEditor.editTitle') : t('approvalFlow.workflowEditor.createTitle')}</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.workflowEditor.nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder={t('approvalFlow.workflowEditor.namePlaceholder')}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="formTemplateId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.workflowEditor.templateLabel')}</label>
                            <select
                                id="formTemplateId"
                                name="formTemplateId"
                                value={formData.formTemplateId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {formTemplates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name} ({t(`enums.departments.${template.department}`)})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.workflowEditor.departmentLabel')}</label>
                            <select
                                id="department"
                                name="department"
                                value={formData.department || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">{t('approvalFlow.workflowEditor.allDepartments')}</option>
                                {Object.values(Department).map(dept => (
                                    <option key={dept} value={dept}>{t(`enums.departments.${dept}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto px-6 pb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('approvalFlow.workflowEditor.stepsLabel')}</h3>
                            {formData.steps.map((step, index) => {
                                const assignmentType = step.approverUsers ? 'user' : 'role';

                                return (
                                <div key={step.id || index} className="p-4 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 relative">
                                    <button type="button" onClick={() => removeStep(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={t('approvalFlow.workflowEditor.removeStep', { step: index + 1 })}>
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                    <p className="font-medium mb-2 text-gray-800 dark:text-gray-200">{t('approvalFlow.workflowEditor.step', { step: index + 1 })}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.workflowEditor.stepNameLabel')}</label>
                                            <input
                                                type="text"
                                                value={step.name}
                                                onChange={e => handleStepChange(index, 'name', e.target.value)}
                                                required
                                                placeholder={t('approvalFlow.workflowEditor.stepNamePlaceholder')}
                                                className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                            />
                                        </div>
                                        <div>
                                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('approvalFlow.workflowEditor.assignByLabel')}</label>
                                                <div className="flex rounded-md shadow-sm">
                                                    <button type="button" onClick={() => handleStepChange(index, 'approverRole', UserRole.MANAGER)} className={`px-3 py-1 text-sm border dark:border-gray-500 rounded-l-md ${assignmentType === 'role' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900'}`}>{t('approvalFlow.workflowEditor.byRole')}</button>
                                                    <button type="button" onClick={() => handleStepChange(index, 'approverUsers', [])} className={`px-3 py-1 text-sm border-t border-b border-r dark:border-gray-500 rounded-r-md ${assignmentType === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900'}`}>{t('approvalFlow.workflowEditor.byUser')}</button>
                                                </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                         {assignmentType === 'role' ? (
                                             <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.workflowEditor.approverRoleLabel')}</label>
                                                <select
                                                    value={step.approverRole}
                                                    onChange={e => handleStepChange(index, 'approverRole', e.target.value as UserRole)}
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                >
                                                    {Object.values(UserRole).filter(r => r !== UserRole.ADMIN && r !== UserRole.EMPLOYEE).map(role => (
                                                        <option key={role} value={role}>{t(`enums.userRoles.${role}`)}</option>
                                                    ))}
                                                </select>
                                             </div>
                                         ) : (
                                             <div>
                                                 <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.workflowEditor.approversLabel')}</label>
                                                 <select
                                                    multiple
                                                    value={step.approverUsers || []}
                                                    onChange={e => handleStepChange(index, 'approverUsers', Array.from(e.target.selectedOptions, (option: any) => option.value))}
                                                    className="mt-1 block w-full h-24 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                >
                                                    {users.filter(u => u.role !== UserRole.EMPLOYEE && u.role !== UserRole.ADMIN).map(user => (
                                                        <option key={user.id} value={user.id}>{user.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">{t('approvalFlow.workflowEditor.multiSelectHint')}</p>
                                             </div>
                                         )}
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!step.sendEmailNotification}
                                                onChange={e => handleStepChange(index, 'sendEmailNotification', e.target.checked)}
                                                className="rounded"
                                            />
                                            <span>{t('approvalFlow.workflowEditor.sendEmail')}</span>
                                        </label>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-center space-x-2 text-sm">
                                            <input type="checkbox" checked={!!step.condition} onChange={() => toggleCondition(index)} className="rounded" />
                                            <span>{t('approvalFlow.workflowEditor.enableCondition')}</span>
                                        </label>
                                        {step.condition && (
                                            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md grid grid-cols-3 gap-2 items-center">
                                                <select value={step.condition.field} onChange={e => handleConditionChange(index, 'field', e.target.value)} className="w-full text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                    <option value="">{t('approvalFlow.workflowEditor.selectField')}</option>
                                                    {numericFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                                </select>
                                                <select value={step.condition.operator} onChange={e => handleConditionChange(index, 'operator', e.target.value)} className="w-full text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                                    <option value=">">&gt;</option>
                                                    <option value="<">&lt;</option>
                                                    <option value="=">=</option>
                                                    <option value="!=">!=</option>
                                                </select>
                                                <input type="number" value={step.condition.value} onChange={e => handleConditionChange(index, 'value', e.target.value)} className="w-full text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )
                            })}
                            <button
                                type="button"
                                onClick={addStep}
                                className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <PlusCircleIcon className="w-5 h-5 mr-2" />
                                {t('approvalFlow.workflowEditor.addStep')}
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">{t('general.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};