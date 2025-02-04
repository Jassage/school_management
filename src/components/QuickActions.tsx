import React from 'react';
import { Plus, FileText, Mail, Download, Users } from 'lucide-react';

const actions = [
  {
    title: 'Nouvel étudiant',
    icon: Plus,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    link: '/dashboard/students',
  },
  {
    title: 'Générer rapport',
    icon: FileText,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/50',
    link: '#',
  },
  {
    title: 'Envoyer email',
    icon: Mail,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    link: '#',
  },
  {
    title: 'Exporter données',
    icon: Download,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    link: '#',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${action.bg}`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="font-medium">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}