import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { Building, Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockFaculties } from '../lib/mockData';
import type { Faculty } from '../types';

export default function FacultyManagement() {
  const { profile } = useAuthStore();
  const [faculties, setFaculties] = useState<Faculty[]>(mockFaculties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<Faculty>({
    id: '',
    name: '',
    description: '',
    departments: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      setFaculties(faculties.map(faculty => 
        faculty.id === editingFaculty.id ? formData : faculty
      ));
    } else {
      setFaculties([...faculties, { ...formData, id: String(faculties.length + 1) }]);
    }
    setIsModalOpen(false);
    setEditingFaculty(null);
    resetForm();
  };

  const handleDelete = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
  };

  const confirmDelete = () => {
    if (facultyToDelete) {
      setFaculties(faculties.filter(faculty => faculty.id !== facultyToDelete.id));
      setFacultyToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      departments: []
    });
  };

  if (!profile || profile.role !== 'admin') {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Facultés</h2>
        </div>
        <button
          onClick={() => {
            setEditingFaculty(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Ajouter une faculté</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map(faculty => (
          <div key={faculty.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{faculty.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingFaculty(faculty);
                    setFormData(faculty);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(faculty)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {faculty.description}
            </p>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Départements
              </h4>
              <div className="flex flex-wrap gap-2">
                {faculty.departments.map((department, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  >
                    {department}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFaculty(null);
          resetForm();
        }}
        title={editingFaculty ? 'Modifier la faculté' : 'Ajouter une faculté'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom de la faculté
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="departments" className="block text-sm font-medium mb-1">
              Départements (séparés par des virgules)
            </label>
            <input
              type="text"
              id="departments"
              value={formData.departments.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                departments: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingFaculty ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingFaculty(null);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={facultyToDelete !== null}
        onClose={() => setFacultyToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer la faculté"
        message={`Êtes-vous sûr de vouloir supprimer la faculté "${facultyToDelete?.name}" ? Cette action est irréversible et supprimera également toutes les inscriptions associées.`}
      />
    </div>
  );
}