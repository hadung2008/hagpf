import React from 'react';
import { WorkflowInstance, Workflow, Document, UserRole, WorkflowStep, ApprovalAction, WorkflowStatus, FormTemplate, FormFieldType } from '../types';
import { User } from '../../../types';
import { StatusBadge } from '../../../components/StatusBadge';
import { CheckCircleIcon, ClockIcon, XCircleIcon, ArrowDownTrayIcon, EnvelopeIcon, XMarkIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface WorkflowInstanceViewProps {
  instance: WorkflowInstance;
  workflow: Workflow;
  document: Document;
  formTemplate: FormTemplate;
  currentUser: User;
  users: User[];
  onApprove: (instanceId: string, notes: string) => void;
  onReject: (instanceId: string, notes: string) => void;
  onRevert: (instanceId: string, notes: string) => void;
  onClose: () => void;
}

const getStepStatus = (stepId: string, instance: WorkflowInstance, workflow: Workflow) => {
    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (instance.status === WorkflowStatus.COMPLETED || instance.status === WorkflowStatus.REJECTED) {
        const historyEntry = instance.history.find(h => workflow.steps.find(s => s.id === instance.currentStepId)?.name === h.stepName && h.action === ApprovalAction.REJECT);
         if (historyEntry) {
            return 'rejected';
        }
        return 'completed';
    }

    if (instance.currentStepId === stepId) return 'current';
    
    const currentStepIndex = workflow.steps.findIndex(s => s.id === instance.currentStepId);

    if (stepIndex < currentStepIndex) return 'completed';
    
    return 'pending';
}

export const WorkflowInstanceView: React.FC<WorkflowInstanceViewProps> = ({
  instance,
  workflow,
  document,
  formTemplate,
  currentUser,
  users,
  onApprove,
  onReject,
  onRevert,
  onClose
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState('');
  const currentStep = workflow.steps.find(step => step.id === instance.currentStepId);
  
  const isApprover = React.useMemo(() => {
    if (!currentStep || instance.status !== WorkflowStatus.PENDING_APPROVAL) return false;
    const isForRole = currentStep.approverRole === currentUser.role;
    const isForUser = currentStep.approverUsers?.includes(currentUser.id);
    return isForRole || isForUser;
  }, [currentUser, currentStep, instance.status]);


  const handleAction = (action: 'approve' | 'reject' | 'revert') => {
    if (action === 'approve') onApprove(instance.id, notes);
    if (action === 'reject') onReject(instance.id, notes);
    if (action === 'revert') onRevert(instance.id, notes);
    onClose();
  };
  
  const getApproverDisplay = (step: WorkflowStep) => {
    if (step.approverRole) {
      return t('approvalFlow.instanceView.approverRole', { role: t(`enums.userRoles.${step.approverRole}`) });
    }
    if (step.approverUsers && step.approverUsers.length > 0) {
      const userNames = step.approverUsers.map(uid => users.find(u => u.id === uid)?.name || 'Unknown User').join(', ');
      return t('approvalFlow.instanceView.approvers', { users: userNames });
    }
    return t('approvalFlow.instanceView.noApprover');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{document.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvalFlow.instanceView.workflow', { name: workflow.name })}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 -mr-2 -mt-2">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t('approvalFlow.instanceView.status')}</h4>
              <StatusBadge status={instance.status} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200">{t('approvalFlow.instanceView.formType')}</h4>
              <p className="text-gray-600 dark:text-gray-300">{formTemplate.name}</p>
            </div>
          </div>
          
           <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('approvalFlow.instanceView.formDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border dark:border-gray-700 p-4 rounded-lg">
                    {formTemplate.fields.map(field => {
                        if (field.type === FormFieldType.DOWNLOAD_LINK) {
                            return (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
                                    <a
                                        href={field.defaultValue}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        {t('approvalFlow.instanceView.downloadFile')}
                                        <ArrowDownTrayIcon className="w-4 h-4 ml-1.5" />
                                    </a>
                                </div>
                            )
                        }
                        return (<div key={field.id}>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
                            <p className="mt-1 text-gray-900 dark:text-white">{document.formData[field.id]?.toString() || t('general.na')}</p>
                        </div>)
                    })}
                </div>
            </div>


          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('approvalFlow.instanceView.approvalSteps')}</h3>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
              {workflow.steps.map(step => {
                const status = getStepStatus(step.id, instance, workflow);
                const Icon = status === 'completed' ? CheckCircleIcon : status === 'current' ? ClockIcon : XCircleIcon;
                const color = status === 'completed' ? 'text-green-500' : status === 'current' ? 'text-blue-500' : 'text-gray-400';

                return (
                  <li key={step.id} className="mb-6 ml-6">
                    <span className={`absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 dark:bg-gray-900 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h4 className={`font-semibold flex items-center ${status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {step.name}
                        {step.sendEmailNotification && <EnvelopeIcon className="w-4 h-4 ml-2 text-gray-400" title={t('approvalFlow.instanceView.emailNotification')}/>}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getApproverDisplay(step)}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('approvalFlow.instanceView.history')}</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {instance.history.map((log, index) => {
                  const actorName = users.find(u => u.id === log.actor)?.name || 'System';
                  return (
                  <li key={index} className="p-4">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{t('approvalFlow.instanceView.actionByOnStep', { action: log.action, actor: actorName, stepName: log.stepName })}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </li>
                )})}
              </ul>
            </div>
          </div>
        </div>

        {isApprover && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('approvalFlow.instanceView.yourAction')}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('approvalFlow.instanceView.notesPlaceholder')}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
               <button onClick={() => handleAction('revert')} className="px-4 py-2 rounded-md text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600">{t('approvalFlow.instanceView.revert')}</button>
               <button onClick={() => handleAction('reject')} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700">{t('approvalFlow.instanceView.reject')}</button>
               <button onClick={() => handleAction('approve')} className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700">{t('approvalFlow.instanceView.approve')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};