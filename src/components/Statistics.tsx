import React from 'react';
import { BarChart2, TrendingUp, Users, Clock } from 'lucide-react';

interface StatProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

const StatCard: React.FC<StatProps> = ({ title, value, change, trend, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/50">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <span className={`text-sm ${
        trend === 'up' 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {change}
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  </div>
);

export default function Statistics() {
  const stats = [
    {
      title: 'Total Étudiants',
      value: '1,234',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Taux de Réussite',
      value: '87%',
      change: '+5.2%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Moyenne de Présence',
      value: '92%',
      change: '-2.1%',
      trend: 'down' as const,
      icon: Clock,
    },
    {
      title: 'Performance Globale',
      value: '76/100',
      change: '+3.8%',
      trend: 'up' as const,
      icon: BarChart2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}