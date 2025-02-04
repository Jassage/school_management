import React from 'react';
import { useAuthStore } from '../lib/store';
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

const stats = [
  {
    name: 'Utilisateurs actifs',
    value: '2,345',
    change: '+12.3%',
    increasing: true,
    icon: Users,
  },
  {
    name: 'Temps moyen',
    value: '15.2m',
    change: '-2.5%',
    increasing: false,
    icon: Clock,
  },
  {
    name: 'Taux de conversion',
    value: '3.8%',
    change: '+2.1%',
    increasing: true,
    icon: TrendingUp,
  },
  {
    name: 'Sessions',
    value: '12,543',
    change: '+8.4%',
    increasing: true,
    icon: Activity,
  },
];

export default function Overview() {
  const { profile } = useAuthStore();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  stat.increasing
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <span>{stat.change}</span>
                {stat.increasing ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </h3>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Activité récente</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Graphique d'activité
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Graphique de performance
          </div>
        </div>
      </div>
    </div>
  );
}