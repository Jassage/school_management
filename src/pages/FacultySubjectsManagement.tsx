import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { Book, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockFacultySubjects, mockFaculties, mockSubjects, mockTeachers, mockAcademicYears } from '../lib/mockData';
import type { FacultySubject } from '../types';

export default function FacultySubjectsManagement() {
  const { profile } = useAuthStore();
  const [facultySubjects, setFacultySubjects] = useState<FacultySubject[]>(mockFacultySubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacultySubject, setEditingFacultySubject] = useState<FacultySubject | null>(null);
  const [facultySubjectToDelete, setFacultySubjectToDelete] = useState<FacultySubject | null>(null);
  const [formData, setFormData] = useState<Omit<FacultySubject, 'id' | 'created_at' | 'updated_at'>>({
    faculty_id: '',
    subject_id: '',
    level: 'L1',
    semester: 1,
    academic_year_id: '',
    teacher_id: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingFacultySubject) {
      setFacultySubjects(facultySubjects.map(fs => 
        fs.id === editingFacultySubject.id 
          ? { ...fs, ...formData, updated_at: now }
          : fs
      ));
    } else {
      setFacultySubjects([...facultySubjects, {
        ...formData,
        id: String(facultySubjects.length + 1),
        created_at: now,
        updated_at: now
      }]);
    }
    setIsModalOpen(false);
    setEditingFacultySubject(null);
    resetForm();
  };

  const handleDelete = (facultySubject: FacultySubject) => {
    setFacultySubjectToDelete(facultySubject);
  };

  const confirmDelete = () => {
    if (facultySubjectToDelete) {
      setFacultySubjects(facultySubjects.filter(fs => fs.id !== facultySubjectToDelete.id));
      setFacultySubjectToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      faculty_id: '',
      subject_id: '',
      level: 'L1',
      semester: 1,
      academic_year_id: '',
      teacher_id: '',
      status: 'active'
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
          <h2 className="text-2xl font-bold">Attribution des Matières</h2>
        </div>
        <button
          onClick={() => {
            setEditingFacultySubject(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Attribuer une matière</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultySubjects.map(fs => {
          const faculty = mockFaculties.find(f => f.id === fs.faculty_id);
          const subject = mockSubjects.find(s => s.id === fs.subject_id);
          const teacher = mockTeachers.find(t => t.id === fs.teacher_id);
          const academicYear = mockAcademicYears.find(y => y.id === fs.academic_year_id);

          return (
            <div key={fs.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{subject?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subject?.code}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingFacultySubject(fs);
                      setFormData({
                        faculty_id: fs.faculty_id,
                        subject_id: fs.subject_id,
                        level: fs.level,
                        semester: fs.semester,
                        academic_year_id: fs.academic_year_id,
                        teacher_id: fs.teacher_id,
                        status: fs.status
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(fs)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Faculté:</span> {faculty?.name}</p>
                <p><span className="font-medium">Niveau:</span> {fs.level}</p>
                <p><span className="font-medium">Semestre:</span> {fs.semester}</p>
                <p><span className="font-medium">Année académique:</span> {academicYear?.name}</p>
                <p><span className="font-medium">Professeur:</span> {teacher?.full_name}</p>
                <p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    fs.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                  }`}>
                    {fs.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFacultySubject(null);
          resetForm();
        }}
        title={editingFacultySubject ? 'Modifier l\'attribution' : 'Nouvelle attribution'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="faculty_id" className="block text-sm font-medium mb-1">
              Faculté
            </label>
            <select
              id="faculty_id"
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
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
            <label htmlFor="subject_id" className="block text-sm font-medium mb-1">
              Matière
            </label>
            <select
              id="subject_id"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner une matière</option>
              {mockSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium mb-1">
                Niveau
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as FacultySubject['level'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium mb-1">
                Semestre
              </label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) as 1 | 2 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value={1}>Semestre 1</option>
                <option value={2}>Semestre 2</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="academic_year_id" className="block text-sm font-medium mb-1">
              Année académique
            </label>
            <select
              id="academic_year_id"
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
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

          <div>
            <label htmlFor="teacher_id" className="block text-sm font-medium mb-1">
              Professeur
            </label>
            <select
              id="teacher_id"
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Sélectionner un professeur</option>
              {mockTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingFacultySubject ? 'Modifier' : 'Attribuer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingFacultySubject(null);
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
        isOpen={facultySubjectToDelete !== null}
        onClose={() => setFacultySubjectToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'attribution"
        message="Êtes-vous sûr de vouloir supprimer cette attribution ? Cette action est irréversible."
      />
    </div>
  );
}