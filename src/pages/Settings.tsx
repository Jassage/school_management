import React from 'react';
import { useAuthStore } from '../lib/store';
import {
  Bell, Globe, Layout, Eye, Zap, PaintBucket, Type,
  MousePointer, Monitor, Moon, Sun, Laptop, Check
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, isDarkMode, toggleDarkMode } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

          <div className="space-y-8">
            {/* Notifications */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 mb-4">
                <Bell size={20} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      updateSettings({ emailNotifications: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Notifications par email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) =>
                      updateSettings({ compactMode: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Mode compact</span>
                </label>
              </div>
            </div>

            {/* Apparence */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 mb-4">
                <PaintBucket size={20} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Apparence
                </h3>
              </div>
              <div className="space-y-6">
                {/* Thème */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thème
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => toggleDarkMode()}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                        !isDarkMode
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Sun size={20} />
                      <span>Clair</span>
                    </button>
                    <button
                      onClick={() => toggleDarkMode()}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                        isDarkMode
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Moon size={20} />
                      <span>Sombre</span>
                    </button>
                    <button
                      className="flex items-center justify-center space-x-2 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    >
                      <Laptop size={20} />
                      <span>Système</span>
                    </button>
                  </div>
                </div>

                {/* Couleur principale */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur principale
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['blue', 'green', 'purple', 'red'].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          updateSettings({
                            theme: { ...settings.theme, primaryColor: color },
                          })
                        }
                        className={`relative h-10 rounded-lg ${
                          color === 'blue' ? 'bg-blue-600' :
                          color === 'green' ? 'bg-green-600' :
                          color === 'purple' ? 'bg-purple-600' :
                          'bg-red-600'
                        } ${
                          settings.theme.primaryColor === color
                            ? 'ring-2 ring-offset-2 ring-gray-400'
                            : ''
                        }`}
                      >
                        {settings.theme.primaryColor === color && (
                          <Check className="absolute inset-0 m-auto text-white" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taille de police */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Taille de police
                  </label>
                  <select
                    value={settings.theme.fontSize}
                    onChange={(e) =>
                      updateSettings({
                        theme: {
                          ...settings.theme,
                          fontSize: e.target.value as 'small' | 'medium' | 'large',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="small">Petite</option>
                    <option value="medium">Moyenne</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accessibilité */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 mb-4">
                <MousePointer size={20} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Accessibilité
                </h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.accessibility.highContrast}
                    onChange={(e) =>
                      updateSettings({
                        accessibility: {
                          ...settings.accessibility,
                          highContrast: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Contraste élevé</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.accessibility.reducedMotion}
                    onChange={(e) =>
                      updateSettings({
                        accessibility: {
                          ...settings.accessibility,
                          reducedMotion: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Réduire les animations</span>
                </label>
              </div>
            </div>

            {/* Langue */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 mb-4">
                <Globe size={20} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Langue
                </h3>
              </div>
              <select
                value={settings.language}
                onChange={(e) =>
                  updateSettings({ language: e.target.value as 'fr' | 'en' })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Confidentialité */}
            <div>
              <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 mb-4">
                <Eye size={20} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confidentialité
                </h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showOnlineStatus}
                    onChange={(e) =>
                      updateSettings({
                        privacy: {
                          ...settings.privacy,
                          showOnlineStatus: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Afficher le statut en ligne</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showLastSeen}
                    onChange={(e) =>
                      updateSettings({
                        privacy: {
                          ...settings.privacy,
                          showLastSeen: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-3">Afficher la dernière connexion</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}