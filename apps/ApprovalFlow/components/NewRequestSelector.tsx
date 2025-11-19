import React, { useState, useMemo } from 'react';
import { Department } from '../../../types';
import { FormTemplate } from '../types';
import { useTranslation } from '../../../lib/i18n';

interface NewRequestSelectorProps {
  formTemplates: FormTemplate[];
  onSelect: (template: FormTemplate) => void;
  onClose: () => void;
}

export const NewRequestSelector: React.FC<NewRequestSelectorProps> = ({ formTemplates, onSelect, onClose }) => {
  const { t } = useTranslation();
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const filteredTemplates = useMemo(() => {
    if (!selectedDept) return [];
    return formTemplates.filter(ft => ft.department === selectedDept);
  }, [selectedDept, formTemplates]);

  const handleSelect = () => {
    const template = formTemplates.find(ft => ft.id === selectedTemplateId);
    if (template) {
      onSelect(template);
    }
  };
  
  // Reset template selection when department changes
  React.useEffect(() => {
      setSelectedTemplateId('');
  }, [selectedDept]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('approvalFlow.newRequest.title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvalFlow.newRequest.subtitle')}</p>
            </div>
            <div className="p-6 space-y-6">
                 <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.newRequest.step1')}</label>
                    <select
                        id="department"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value as Department)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">{t('approvalFlow.newRequest.selectDepartment')}</option>
                        {Object.values(Department).map(dept => (
                            <option key={dept} value={dept}>{t(`enums.departments.${dept}`)}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="formTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.newRequest.step2')}</label>
                    <select
                        id="formTemplate"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        disabled={!selectedDept || filteredTemplates.length === 0}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    >
                        <option value="">{t('approvalFlow.newRequest.selectForm')}</option>
                        {filteredTemplates.map(template => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                    </select>
                     {selectedDept && filteredTemplates.length === 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{t('approvalFlow.newRequest.noFormsFound')}</p>
                     )}
                </div>
            </div>
             <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('general.cancel')}</button>
                <button 
                    type="button" 
                    onClick={handleSelect}
                    disabled={!selectedTemplateId}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {t('approvalFlow.newRequest.startButton')}
                </button>
            </div>
        </div>
    </div>
  );
};