import React, { useState } from 'react';
import { FormTemplate, FormField, FormFieldType } from '../types';
import { Department } from '../../../types';
import { PlusCircleIcon, XCircleIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface FormTemplateEditorProps {
  template?: FormTemplate | null;
  onSave: (template: FormTemplate | Omit<FormTemplate, 'id'>) => void;
  onClose: () => void;
}

export const FormTemplateEditor: React.FC<FormTemplateEditorProps> = ({ template, onSave, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(template?.name || '');
    const [department, setDepartment] = useState<Department>(template?.department || Department.IT);
    const [fields, setFields] = useState<Omit<FormField, 'id'>[] | FormField[]>(template?.fields || []);

    const isEditing = !!template;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert(t('approvalFlow.templateEditor.alertNameRequired'));
            return;
        }
        
        const saveData = {
            name,
            department,
            fields: fields as FormField[]
        };

        if (isEditing) {
            onSave({ ...saveData, id: template.id });
        } else {
            onSave(saveData);
        }
    };

    const addField = () => {
        setFields([...fields, { label: '', type: FormFieldType.TEXT, required: false, placeholder: '', options: [], defaultValue: '' }]);
    };
    
    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, prop: keyof Omit<FormField, 'id'>, value: string | boolean | FormFieldType | string[]) => {
        const newFields = [...fields];
        (newFields[index] as any)[prop] = value;
        if (prop === 'type' && value === FormFieldType.DOWNLOAD_LINK) {
            newFields[index].required = false;
        }
        setFields(newFields);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? t('approvalFlow.templateEditor.editTitle') : t('approvalFlow.templateEditor.createTitle')}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow flex flex-col overflow-hidden p-6 space-y-6">
                        {/* Non-scrolling part */}
                        <div className="flex-shrink-0">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.templateEditor.nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder={t('approvalFlow.templateEditor.namePlaceholder')}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.templateEditor.departmentLabel')}</label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value as Department)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {Object.values(Department).map(dept => (
                                    <option key={dept} value={dept}>{t(`enums.departments.${dept}`)}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Scrolling part */}
                        <div className="flex-grow flex flex-col overflow-hidden space-y-4">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">{t('approvalFlow.templateEditor.fieldsLabel')}</h3>
                             <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                                {fields.map((field, index) => (
                                    <div key={index} className="p-4 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 relative">
                                        <button type="button" onClick={() => removeField(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={t('approvalFlow.templateEditor.removeField', { field: index + 1 })}>
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.templateEditor.fieldLabel')}</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={e => handleFieldChange(index, 'label', e.target.value)}
                                                    required
                                                    placeholder={t('approvalFlow.templateEditor.fieldLabelPlaceholder')}
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.templateEditor.fieldType')}</label>
                                                <select
                                                    value={field.type}
                                                    onChange={e => handleFieldChange(index, 'type', e.target.value as FormFieldType)}
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                >
                                                    {Object.values(FormFieldType).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                         </div>
                                         {(field.type === FormFieldType.TEXT || field.type === FormFieldType.TEXTAREA || field.type === FormFieldType.NUMBER) && (
                                            <div className="mt-4">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.templateEditor.placeholder')}</label>
                                                <input
                                                    type="text"
                                                    value={(field as FormField).placeholder || ''}
                                                    onChange={e => handleFieldChange(index, 'placeholder', e.target.value)}
                                                    placeholder={t('approvalFlow.templateEditor.placeholderExample')}
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                />
                                            </div>
                                        )}
                                         {field.type === FormFieldType.DROPDOWN && (
                                            <div className="mt-4">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.templateEditor.dropdownOptions')}</label>
                                                <textarea
                                                    value={(field.options || []).join('\n')}
                                                    onChange={e => handleFieldChange(index, 'options', e.target.value.split('\n'))}
                                                    placeholder={t('approvalFlow.templateEditor.dropdownExample')}
                                                    rows={4}
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                />
                                            </div>
                                        )}
                                         {field.type === FormFieldType.DOWNLOAD_LINK && (
                                            <div className="mt-4">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('approvalFlow.templateEditor.downloadUrl')}</label>
                                                <input
                                                    type="url"
                                                    value={(field as FormField).defaultValue || ''}
                                                    onChange={e => handleFieldChange(index, 'defaultValue', e.target.value)}
                                                    placeholder={t('approvalFlow.templateEditor.downloadUrlPlaceholder')}
                                                    required
                                                    className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                                                />
                                            </div>
                                        )}
                                          <div className="mt-4">
                                            <label className="flex items-center text-sm">
                                              <input 
                                                type="checkbox" 
                                                checked={field.type === FormFieldType.DOWNLOAD_LINK ? false : field.required}
                                                disabled={field.type === FormFieldType.DOWNLOAD_LINK}
                                                onChange={e => handleFieldChange(index, 'required', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                              />
                                              <span className={`ml-2 text-gray-700 dark:text-gray-300 ${field.type === FormFieldType.DOWNLOAD_LINK ? 'opacity-50' : ''}`}>{t('general.required')}</span>
                                            </label>
                                          </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                                    {t('approvalFlow.templateEditor.addField')}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">{t('approvalFlow.templateEditor.saveTemplate')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};