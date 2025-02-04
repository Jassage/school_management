import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import {
  User, Phone, Mail, Building, BookOpen, Clock,
  Calendar, ArrowLeft
} from 'lucide-react';
import { mockTeachers, mockFacultySubjects, mockSubjects, mockFaculties, mockAcademicYears } from '../lib/mockData';

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const teacher = mockTeachers.find(t => t.id === id);

  // Get all subjects taught by this teacher
  const teacherSubjects = mockFacultySubjects.filter(fs => fs.teacher_id === id);

  if (!teacher) {
    return <div>Professeur non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/teachers')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Détails du Professeur</h1>
      </div>

      {/* Informations principales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {teacher.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{teacher.full_name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{teacher.specialization}</p>
            <span className={`mt-2 px-3 py-1 rounded-full text-sm ${
              teacher.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
            }`}>
              {teacher.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span>{teacher.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span>{teacher.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-gray-400" />
            <span>Bureau {teacher.office_number}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span>{teacher.office_hours}</span>
          </div>
        </div>
      </div>

      {/* Matières enseignées */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Matières enseignées</h3>
        <div className="space-y-4">
          {teacherSubjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Aucune matière attribuée pour le moment
            </p>
          ) : (
            teacherSubjects.map(fs => {
              const subject = mockSubjects.find(s => s.id === fs.subject_id);
              const faculty = mockFaculties.find(f => f.id === fs.faculty_id);
              const academicYear = mockAcademicYears.find(y => y.id === fs.academic_year_id);
              
              return (
                <div key={fs.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{subject?.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{subject?.code}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      fs.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                    }`}>
                      {fs.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{faculty?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>Niveau {fs.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{academicYear?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Semestre {fs.semester}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}