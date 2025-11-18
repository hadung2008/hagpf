import React, { useState } from 'react';
import { FormTemplate, FormFieldType, FormField } from '../types';
import { ArrowDownTrayIcon } from '../../../components/icons';
import { useTranslation } from '../../../lib/i18n';

interface DocumentSubmissionFormProps {
    formTemplate: FormTemplate;
    onSave: (data: { name: string; formData: Record<string, any>; formTemplateId: string }) => void;
    onClose: () => void;
}

export const DocumentSubmissionForm: React.FC<DocumentSubmissionFormProps> = ({ formTemplate, onSave, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>({});
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert(t('approvalFlow.docSubmission.alertTitle'));
            return;
        }
        
        const processedFormData: Record<string, any> = {};
        for (const field of formTemplate.fields) {
            if (field.type === FormFieldType.DOWNLOAD_LINK) continue;

            const value = formData[field.id];
            if (field.required && !value) {
                alert(t('approvalFlow.docSubmission.alertFieldRequired', { label: field.label }));
                return;
            }
            
            if (field.type === FormFieldType.FILE && value && typeof value.name === 'string' && typeof value.size === 'number') {
                processedFormData[field.id] = value.name;
            } else {
                processedFormData[field.id] = value;
            }
        }
        onSave({ name, formData: processedFormData, formTemplateId: formTemplate.id });
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({...prev, [fieldId]: value}));
    };
    
    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.id,
            required: field.required,
            placeholder: field.placeholder || '',
            className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        };

        switch (field.type) {
            case FormFieldType.NUMBER:
                return <input type="number" {...commonProps} onChange={e => handleFieldChange(field.id, Number(e.target.value))} />;
            case FormFieldType.DATE:
                return <input type="date" {...commonProps} onChange={e => handleFieldChange(field.id, e.target.value)} />;
            case FormFieldType.TEXTAREA:
                return <textarea {...commonProps} onChange={e => handleFieldChange(field.id, e.target.value)} rows={4} />;
            case FormFieldType.DROPDOWN:
                return (
                    <select {...commonProps} onChange={e => handleFieldChange(field.id, e.target.value)}>
                        <option value="">{t('approvalFlow.docSubmission.selectOption')}</option>
                        {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case FormFieldType.FILE:
                return <input 
                            type="file" 
                            id={field.id}
                            required={field.required}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, e.target.files?.[0] || null)}
                            className={`${commonProps.className} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900`} 
                        />;
            case FormFieldType.DOWNLOAD_LINK:
                return (
                    <a 
                        href={field.defaultValue} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        {t('approvalFlow.docSubmission.download', { label: field.label })}
                    </a>
                );
            case FormFieldType.TEXT:
            default:
                return <input type="text" {...commonProps} onChange={e => handleFieldChange(field.id, e.target.value)} />;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('approvalFlow.docSubmission.title', { name: formTemplate.name })}</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        <div>
                            <label htmlFor="docName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.docSubmission.requestNameLabel')}</label>
                            <input
                                type="text"
                                id="docName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder={t('approvalFlow.docSubmission.requestNamePlaceholder')}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        
                        {formTemplate.fields.map(field => (
                            <div key={field.id}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}

                         <div>
                            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('approvalFlow.docSubmission.department')}</p>
                            <p className="mt-1 text-gray-900 dark:text-white p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{t(`enums.departments.${formTemplate.department}`)}</p>
                         </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('general.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50" disabled={!name.trim()}>{t('approvalFlow.docSubmission.submitButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};