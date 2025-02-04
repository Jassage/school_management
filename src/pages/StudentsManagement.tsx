import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { UserPlus, Edit2, Trash2, Eye, GraduationCap } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockStudents } from '../lib/mockData';
import type { Student } from '../types';

export default function StudentsManagement() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Student>({
    id: '',
    full_name: '',
    email: '',
    birth_date: '',
    birth_place: '',
    nationality: '',
    address: '',
    phone: '',
    gender: 'M',
    blood_type: 'A+',
    allergies: [],
    medical_conditions: [],
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    student_id: '',
    enrollment_status: 'pending',
    enrollment_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(students.map(student => 
        student.id === editingStudent.id ? formData : student
      ));
    } else {
      setStudents([...students, { ...formData, id: String(students.length + 1) }]);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
    resetForm();
  };

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(student => student.id !== studentToDelete.id));
      setStudentToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      full_name: '',
      email: '',
      birth_date: '',
      birth_place: '',
      nationality: '',
      address: '',
      phone: '',
      gender: 'M',
      blood_type: 'A+',
      allergies: [],
      medical_conditions: [],
      emergency_contact: {
        name: '',
        relationship: '',
        phone: ''
      },
      student_id: '',
      enrollment_status: 'pending',
      enrollment_date: new Date().toISOString().split('T')[0]
    });
  };

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <GraduationCap size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Étudiants</h2>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus size={20} />
          <span>Ajouter un étudiant</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={student.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                              {student.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{student.full_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{student.student_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{student.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.enrollment_status === 'enrolled'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                        : student.enrollment_status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                        : 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
                    }`}>
                      {student.enrollment_status === 'enrolled' ? 'Inscrit'
                        : student.enrollment_status === 'pending' ? 'En attente'
                        : student.enrollment_status === 'graduated' ? 'Diplômé'
                        : 'Retiré'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/dashboard/students/${student.id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setFormData(student);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
          resetForm();
        }}
        title={editingStudent ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label htmlFor="birth_date" className="block text-sm font-medium mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="birth_place" className="block text-sm font-medium mb-1">
                Lieu de naissance
              </label>
              <input
                type="text"
                id="birth_place"
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium mb-1">
                Nationalité
              </label>
              <input
                type="text"
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">
                Genre
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Adresse
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              required
            />
          </div>

          <div>
            <label htmlFor="blood_type" className="block text-sm font-medium mb-1">
              Groupe sanguin
            </label>
            <select
              id="blood_type"
              value={formData.blood_type}
              onChange={(e) => setFormData({ ...formData, blood_type: e.target.value as Student['blood_type'] })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium mb-1">
              Allergies (séparées par des virgules)
            </label>
            <input
              type="text"
              id="allergies"
              value={formData.allergies.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="medical_conditions" className="block text-sm font-medium mb-1">
              Conditions médicales (séparées par des virgules)
            </label>
            <input
              type="text"
              id="medical_conditions"
              value={formData.medical_conditions.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                medical_conditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Contact d'urgence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergency_name" className="block text-sm font-medium mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="emergency_name"
                  value={formData.emergency_contact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {
                      ...formData.emergency_contact,
                      name: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="emergency_relationship" className="block text-sm font-medium mb-1">
                  Relation
                </label>
                <input
                  type="text"
                  id="emergency_relationship"
                  value={formData.emergency_contact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {
                      ...formData.emergency_contact,
                      relationship: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="emergency_phone" className="block text-sm font-medium mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="emergency_phone"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {
                      ...formData.emergency_contact,
                      phone: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingStudent ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
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
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'étudiant"
        message={`Êtes-vous sûr de vouloir supprimer l'étudiant "${studentToDelete?.full_name}" ? Cette action est irréversible.`}
      />
    </div>
  );
}