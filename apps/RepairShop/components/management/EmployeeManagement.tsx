import React from 'react';
import { User } from '../../../../types';
import { UsersIcon, ShieldCheckIcon } from '../../../../components/icons';

interface EmployeeManagementProps {
    allUsers: User[];
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ allUsers }) => {
    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center mb-6">
                    <UsersIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {allUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-200">{user.name.split(' (')[0]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{user.department}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div>
                <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Detailed Permission Management</h1>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 text-center">
                    <p className="text-gray-600 dark:text-slate-400">
                        Detailed permission management using Role-Based Access Control (RBAC) with claims is configured in the main "Role-Based Permission Manager" application.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
                        This allows for granular control over what actions each employee role can perform within the Store Operations app.
                    </p>
                </div>
            </div>
        </div>
    );
};