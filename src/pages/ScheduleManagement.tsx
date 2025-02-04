import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { Calendar, Plus, Edit2, Trash2, Clock, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  mockSchedules, 
  mockFacultySubjects, 
  mockSubjects, 
  mockTeachers, 
  mockFaculties,
  mockAcademicYears 
} from '../lib/mockData';
import type { Schedule } from '../types';

export default function ScheduleManagement() {
  const { profile } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<Omit<Schedule, 'id' | 'created_at' | 'updated_at'>>({
    faculty_subject_id: '',
    day: 'Lundi',
    start_time: '',
    end_time: '',
    room: '',
    type: 'CM',
    group: '',
    status: 'active'
  });

  // Filtres
  const [filters, setFilters] = useState({
    faculty_id: '',
    level: '',
    semester: '',
    academic_year_id: '',
  });

  // Ajout des états pour la sélection en cascade
  const [selectedFilters, setSelectedFilters] = useState({
    faculty_id: '',
    level: '',
    semester: '',
    academic_year_id: ''
  });

  // Filtrer les matières en fonction des sélections
  const availableSubjects = mockFacultySubjects.filter(fs => {
    if (!selectedFilters.faculty_id || fs.faculty_id !== selectedFilters.faculty_id) return false;
    if (!selectedFilters.level || fs.level !== selectedFilters.level) return false;
    if (!selectedFilters.semester || fs.semester !== parseInt(selectedFilters.semester)) return false;
    if (!selectedFilters.academic_year_id || fs.academic_year_id !== selectedFilters.academic_year_id) return false;
    return true;
  });

  // Filtrer les faculty_subjects en fonction des filtres
  const filteredFacultySubjects = mockFacultySubjects.filter(fs => {
    if (filters.faculty_id && fs.faculty_id !== filters.faculty_id) return false;
    if (filters.level && fs.level !== filters.level) return false;
    if (filters.semester && fs.semester !== parseInt(filters.semester)) return false;
    if (filters.academic_year_id && fs.academic_year_id !== filters.academic_year_id) return false;
    return true;
  });

  // Filtrer les horaires en fonction des faculty_subjects filtrés
  const filteredSchedules = schedules.filter(schedule => 
    filteredFacultySubjects.some(fs => fs.id === schedule.faculty_subject_id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingSchedule) {
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { ...schedule, ...formData, updated_at: now }
          : schedule
      ));
    } else {
      setSchedules([...schedules, {
        ...formData,
        id: String(schedules.length + 1),
        created_at: now,
        updated_at: now
      }]);
    }
    setIsModalOpen(false);
    setEditingSchedule(null);
    resetForm();
  };

  const handleDelete = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
  };

  const confirmDelete = () => {
    if (scheduleToDelete) {
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleToDelete.id));
      setScheduleToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      faculty_subject_id: '',
      day: 'Lundi',
      start_time: '',
      end_time: '',
      room: '',
      type: 'CM',
      group: '',
      status: 'active'
    });
    setSelectedFilters({
      faculty_id: '',
      level: '',
      semester: '',
      academic_year_id: ''
    });
  };

  const validateTimeSlot = (start: string, end: string, day: string, room: string, id?: string) => {
    return !schedules.some(schedule => 
      schedule.day === day &&
      schedule.room === room &&
      schedule.id !== id &&
      ((start >= schedule.start_time && start < schedule.end_time) ||
       (end > schedule.start_time && end <= schedule.end_time) ||
       (start <= schedule.start_time && end >= schedule.end_time))
    );
  };

  if (!profile || !['admin'].includes(profile.role)) {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Calendar size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Horaires</h2>
        </div>
        <button
          onClick={() => {
            setEditingSchedule(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Ajouter un horaire</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="faculty_filter" className="block text-sm font-medium mb-1">
              Faculté
            </label>
            <select
              id="faculty_filter"
              value={filters.faculty_id}
              onChange={(e) => setFilters({ ...filters, faculty_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Toutes les facultés</option>
              {mockFaculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level_filter" className="block text-sm font-medium mb-1">
              Niveau
            </label>
            <select
              id="level_filter"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tous les niveaux</option>
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="M1">M1</option>
              <option value="M2">M2</option>
            </select>
          </div>

          <div>
            <label htmlFor="semester_filter" className="block text-sm font-medium mb-1">
              Semestre
            </label>
            <select
              id="semester_filter"
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Tous les semestres</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>

          <div>
            <label htmlFor="academic_year_filter" className="block text-sm font-medium mb-1">
              Année académique
            </label>
            <select
              id="academic_year_filter"
              value={filters.academic_year_id}
              onChange={(e) => setFilters({ ...filters, academic_year_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Toutes les années</option>
              {mockAcademicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Emploi du temps */}
      <div className="grid grid-cols-1 gap-6">
        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(day => (
          <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{day}</h3>
            <div className="space-y-4">
              {filteredSchedules
                .filter(schedule => schedule.day === day)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map(schedule => {
                  const facultySubject = mockFacultySubjects.find(fs => fs.id === schedule.faculty_subject_id);
                  const subject = mockSubjects.find(s => s.id === facultySubject?.subject_id);
                  const teacher = mockTeachers.find(t => t.id === facultySubject?.teacher_id);
                  const faculty = mockFaculties.find(f => f.id === facultySubject?.faculty_id);

                  return (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            schedule.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                          }`}>
                            {schedule.status === 'active' ? 'Actif' : 'Annulé'}
                          </span>
                        </div>
                        <h4 className="font-medium mt-2">{subject?.name}</h4>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Prof. {teacher?.full_name}</p>
                          <p>
                            {faculty?.name} - {facultySubject?.level} - Semestre {facultySubject?.semester}
                          </p>
                          <p>Salle {schedule.room} - {schedule.type} {schedule.group && `(${schedule.group})`}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setFormData({
                              faculty_subject_id: schedule.faculty_subject_id,
                              day: schedule.day,
                              start_time: schedule.start_time,
                              end_time: schedule.end_time,
                              room: schedule.room,
                              type: schedule.type,
                              group: schedule.group || '',
                              status: schedule.status
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
          resetForm();
        }}
        title={editingSchedule ? 'Modifier un horaire' : 'Ajouter un horaire'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection en cascade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="faculty_id" className="block text-sm font-medium mb-1">
                Faculté
              </label>
              <select
                id="faculty_id"
                value={selectedFilters.faculty_id}
                onChange={(e) => {
                  setSelectedFilters({
                    faculty_id: e.target.value,
                    level: '',
                    semester: '',
                    academic_year_id: ''
                  });
                  setFormData({ ...formData, faculty_subject_id: '' });
                }}
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
                value={selectedFilters.level}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    level: e.target.value,
                    semester: '',
                    academic_year_id: ''
                  });
                  setFormData({ ...formData, faculty_subject_id: '' });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                disabled={!selectedFilters.faculty_id}
              >
                <option value="">Sélectionner un niveau</option>
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
                value={selectedFilters.semester}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    semester: e.target.value,
                    academic_year_id: ''
                  });
                  setFormData({ ...formData, faculty_subject_id: '' });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                disabled={!selectedFilters.level}
              >
                <option value="">Sélectionner un semestre</option>
                <option value="1">Semestre 1</option>
                <option value="2">Semestre 2</option>
              </select>
            </div>

            <div>
              <label htmlFor="academic_year" className="block text-sm font-medium mb-1">
                Année académique
              </label>
              <select
                id="academic_year"
                value={selectedFilters.academic_year_id}
                onChange={(e) => {
                  setSelectedFilters({
                    ...selectedFilters,
                    academic_year_id: e.target.value
                  });
                  setFormData({ ...formData, faculty_subject_id: '' });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                disabled={!selectedFilters.semester}
              >
                <option value="">Sélectionner une année académique</option>
                {mockAcademicYears.map(year => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sélection de la matière filtrée */}
          <div>
            <label htmlFor="faculty_subject_id" className="block text-sm font-medium mb-1">
              Matière
            </label>
            <select
              id="faculty_subject_id"
              value={formData.faculty_subject_id}
              onChange={(e) => setFormData({ ...formData, faculty_subject_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
              disabled={!selectedFilters.academic_year_id}
            >
              <option value="">Sélectionner une matière</option>
              {availableSubjects.map(fs => {
                const subject = mockSubjects.find(s => s.id === fs.subject_id);
                const teacher = mockTeachers.find(t => t.id === fs.teacher_id);
                return (
                  <option key={fs.id} value={fs.id}>
                    {subject?.name} - Prof. {teacher?.full_name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="day" className="block text-sm font-medium mb-1">
                Jour
              </label>
              <select
                id="day"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value as Schedule['day'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="Lundi">Lundi</option>
                <option value="Mardi">Mardi</option>
                <option value="Mercredi">Mercredi</option>
                <option value="Jeudi">Jeudi</option>
                <option value="Vendredi">Vendredi</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type de cours
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CM' | 'TD' | 'TP' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="CM">Cours Magistral (CM)</option>
                <option value="TD">Travaux Dirigés (TD)</option>
                <option value="TP">Travaux Pratiques (TP)</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium mb-1">
                Heure de début
              </label>
              <input
                type="time"
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium mb-1">
                Salle
              </label>
              <input
                type="text"
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="group" className="block text-sm font-medium mb-1">
                Groupe (optionnel)
              </label>
              <input
                type="text"
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'cancelled' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingSchedule ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSchedule(null);
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
        isOpen={scheduleToDelete !== null}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'horaire"
        message="Êtes-vous sûr de vouloir supprimer cet horaire ? Cette action est irréversible."
      />
    </div>
  );
}