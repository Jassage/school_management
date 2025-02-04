import React from 'react';
import { Activity, User, GraduationCap, BookOpen, FileText } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'student' | 'teacher' | 'document' | 'grade';
  title: string;
  description: string;
  timestamp: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'student',
    title: 'Nouvel étudiant inscrit',
    description: 'Marie Dupont a rejoint la classe de Mathématiques Avancées',
    timestamp: '2024-01-23T10:30:00',
  },
  {
    id: '2',
    type: 'teacher',
    title: 'Nouveau cours créé',
    description: 'Prof. Martin a créé le cours "Introduction à la Physique"',
    timestamp: '2024-01-23T09:15:00',
  },
  {
    id: '3',
    type: 'document',
    title: 'Document partagé',
    description: 'Support de cours mis à jour pour le module de Programmation',
    timestamp: '2024-01-23T08:45:00',
  },
  {
    id: '4',
    type: 'grade',
    title: 'Notes publiées',
    description: 'Les résultats du dernier examen sont disponibles',
    timestamp: '2024-01-22T16:20:00',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'student':
      return GraduationCap;
    case 'teacher':
      return BookOpen;
    case 'document':
      return FileText;
    case 'grade':
      return Activity;
    default:
      return User;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'student':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50';
    case 'teacher':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50';
    case 'document':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
    case 'grade':
      return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50';
  }
};

export default function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Activité Récente</span>
        </h3>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colorClass = getIconColor(activity.type);
          
          return (
            <div key={activity.id} className="flex space-x-4">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{activity.title}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}