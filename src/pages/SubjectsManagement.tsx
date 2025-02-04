import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { Book, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockSubjects } from '../lib/mockData';
import type { Subject } from '../types';

export default function SubjectsManagement() {
  const { profile } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    code: '',
    description: '',
    credits: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingSubject) {
      setSubjects(subjects.map(subject => 
        subject.id === editingSubject.id 
          ? { ...subject, ...formData, updated_at: now }
          : subject
      ));
    } else {
      setSubjects([...subjects, {
        ...formData,
        id: String(subjects.length + 1),
        created_at: now,
        updated_at: now
      }]);
    }
    setIsModalOpen(false);
    setEditingSubject(null);
    resetForm();
  };

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      setSubjects(subjects.filter(subject => subject.id !== subjectToDelete.id));
      setSubjectToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 0
    });
  };

  if (!profile || profile.role !== 'admin') {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Book size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Matières</h2>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Ajouter une matière</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{subject.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subject.code}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingSubject(subject);
                    setFormData({
                      name: subject.name,
                      code: subject.code,
                      description: subject.description,
                      credits: subject.credits
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(subject)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {subject.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{subject.credits} crédits</span>
              <span>Créé le {new Date(subject.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
          resetForm();
        }}
        title={editingSubject ? 'Modifier la matière' : 'Ajouter une matière'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom de la matière
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
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Code de la matière
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
            <label htmlFor="credits" className="block text-sm font-medium mb-1">
              Nombre de crédits
            </label>
            <input
              type="number"
              id="credits"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
              min="0"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingSubject ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
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
        isOpen={subjectToDelete !== null}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer la matière"
        message={`Êtes-vous sûr de vouloir supprimer la matière "${subjectToDelete?.name}" ? Cette action est irréversible.`}
      />
    </div>
  );
}