import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import {
  User, Phone, Mail, MapPin, Calendar, Flag, Heart,
  AlertTriangle, GraduationCap, Building, Clock, Edit2
} from 'lucide-react';
import Modal from '../components/Modal';
import { mockStudents, mockFaculties, mockAcademicYears } from '../lib/mockData';
import type { Student } from '../types';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const student = mockStudents.find(s => s.id === id);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    faculty_id: '',
    level: 'L1',
    academic_year_id: ''
  });

  if (!student) {
    return <div>Étudiant non trouvé</div>;
  }

  const faculty = mockFaculties.find(f => f.id === student.current_faculty);
  const academicYear = mockAcademicYears.find(y => y.id === student.academic_year);

  const handleEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'inscription
    console.log('Inscription:', enrollmentData);
    setIsEnrollModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-6">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.full_name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {student.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{student.full_name}</h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
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
                {student.enrollment_status === 'pending' && (
                  <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Inscrire
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">#{student.student_id}</p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{student.address}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Né(e) le {new Date(student.birth_date).toLocaleDateString()} à {student.birth_place}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Flag className="w-5 h-5 text-gray-400" />
              <span>{student.nationality}</span>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <span>{student.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations médicales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Informations médicales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span>Groupe sanguin: {student.blood_type}</span>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Allergies:</p>
                {student.allergies.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {student.allergies.map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune allergie connue</p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Conditions médicales:</p>
                {student.medical_conditions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {student.medical_conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune condition médicale</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">Contact d'urgence</h3>
              <div className="space-y-2">
                <p>{student.emergency_contact.name}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {student.emergency_contact.relationship}
                </p>
                <p>{student.emergency_contact.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations académiques */}
      {student.enrollment_status === 'enrolled' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations académiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <span>Faculté: {faculty?.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-gray-400" />
                <span>Niveau: {student.current_level}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Année académique: {academicYear?.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'inscription */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Inscription de l'étudiant"
      >
        <form onSubmit={handleEnrollment} className="space-y-4">
          <div>
            <label htmlFor="faculty" className="block text-sm font-medium mb-1">
              Faculté
            </label>
            <select
              id="faculty"
              value={enrollmentData.faculty_id}
              onChange={(e) => setEnrollmentData({ ...enrollmentData, faculty_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner une faculté</option>
              {mockFaculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium mb-1">
              Niveau
            </label>
            <select
              id="level"
              value={enrollmentData.level}
              onChange={(e) => setEnrollmentData({ ...enrollmentData, level: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="L1">Licence 1</option>
              <option value="L2">Licence 2</option>
              <option value="L3">Licence 3</option>
              <option value="M1">Master 1</option>
              <option value="M2">Master 2</option>
            </select>
          </div>

          <div>
            <label htmlFor="academic_year" className="block text-sm font-medium mb-1">
              Année académique
            </label>
            <select
              id="academic_year"
              value={enrollmentData.academic_year_id}
              onChange={(e) => setEnrollmentData({ ...enrollmentData, academic_year_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner une année académique</option>
              {mockAcademicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirmer l'inscription
            </button>
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
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