import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Phone, Building, MapPin, Clock, Shield,
  Briefcase, FileText, Globe, Calendar, Edit2
} from 'lucide-react';
import Modal from '../components/Modal';

export default function UserProfile() {
  const { profile, setProfile } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    position: profile?.position || '',
    department: profile?.department || '',
    office_location: profile?.office_location || '',
    bio: profile?.bio || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile?.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête du profil */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800">
          <button
            onClick={() => {
              setFormData({
                full_name: profile.full_name,
                email: profile.email || '',
                phone: profile.phone || '',
                position: profile.position || '',
                department: profile.department || '',
                office_location: profile.office_location || '',
                bio: profile.bio || '',
              });
              setIsEditModalOpen(true);
            }}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
          >
            <Edit2 size={20} />
          </button>
        </div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {profile.full_name.charAt(0)}
              </span>
            </div>
            <div className="ml-4 mb-2">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400 capitalize flex items-center space-x-2">
                <Shield size={16} />
                <span>{profile.role}</span>
              </p>
            </div>
          </div>
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations professionnelles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations professionnelles</h2>
          <div className="space-y-4">
            {profile.position && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span>{profile.position}</span>
              </div>
            )}
            {profile.department && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <Building className="w-5 h-5 text-gray-400" />
                <span>{profile.department}</span>
              </div>
            )}
            {profile.office_location && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{profile.office_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Préférences</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Globe className="w-5 h-5 text-gray-400" />
              <span>Langue: {profile.preferences?.language === 'fr' ? 'Français' : 'English'}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Fuseau horaire: {profile.preferences?.timezone || 'Non défini'}</span>
            </div>
          </div>
        </div>

        {/* Activité */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Activité</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Membre depuis: {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            {profile.last_seen && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Dernière connexion: {new Date(profile.last_seen).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le profil"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium mb-1">
              Poste
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">
              Département
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="office_location" className="block text-sm font-medium mb-1">
              Bureau
            </label>
            <input
              type="text"
              id="office_location"
              value={formData.office_location}
              onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Biographie
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}