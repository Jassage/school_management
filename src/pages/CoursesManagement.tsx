import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { Book, Plus, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { mockCourses, mockTeachers } from '../lib/mockData';
import type { Course, CourseSchedule } from '../types';

export default function CoursesManagement() {
  const { profile } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Course>({
    id: '',
    name: '',
    code: '',
    description: '',
    teacher_id: '',
    level: 'L1',
    credits: 0,
    capacity: 0,
    schedule: [],
    enrolled_students: [],
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(course => 
        course.id === editingCourse.id ? formData : course
      ));
    } else {
      setCourses([...courses, { ...formData, id: String(courses.length + 1) }]);
    }
    setIsModalOpen(false);
    setEditingCourse(null);
    resetForm();
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter(course => course.id !== courseToDelete.id));
      setCourseToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      code: '',
      description: '',
      teacher_id: '',
      level: 'L1',
      credits: 0,
      capacity: 0,
      schedule: [],
      enrolled_students: [],
      status: 'active'
    });
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        {
          day: 'Lundi',
          start_time: '',
          end_time: '',
          room: ''
        }
      ]
    });
  };

  const updateScheduleSlot = (index: number, field: keyof CourseSchedule, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };
    setFormData({
      ...formData,
      schedule: newSchedule
    });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index)
    });
  };

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Book size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Cours</h2>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} />
          <span>Ajouter un cours</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const teacher = mockTeachers.find(t => t.id === course.teacher_id);
          return (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{course.code}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setFormData(course);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm mb-4">{course.description}</p>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span>{teacher?.full_name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <div className="space-y-1">
                    {course.schedule.map((slot, index) => (
                      <div key={index}>
                        {slot.day} {slot.start_time}-{slot.end_time} ({slot.room})
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Niveau: {course.level}</span>
                  <span>{course.credits} crédits</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{course.enrolled_students.length}/{course.capacity} étudiants</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                  }`}>
                    {course.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
          resetForm();
        }}
        title={editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom du cours
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
              Code du cours
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium mb-1">
                Niveau
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as Course['level'] })}
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
              <label htmlFor="credits" className="block text-sm font-medium mb-1">
                Crédits
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
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium mb-1">
              Capacité
            </label>
            <input
              type="number"
              id="capacity"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
              min="0"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Horaires</label>
              <button
                type="button"
                onClick={addScheduleSlot}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                + Ajouter un créneau
              </button>
            </div>
            {formData.schedule.map((slot, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={slot.day}
                  onChange={(e) => updateScheduleSlot(index, 'day', e.target.value as CourseSchedule['day'])}
                  className="px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Lundi">Lundi</option>
                  <option value="Mardi">Mardi</option>
                  <option value="Mercredi">Mercredi</option>
                  <option value="Jeudi">Jeudi</option>
                  <option value="Vendredi">Vendredi</option>
                </select>
                <input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => updateScheduleSlot(index, 'start_time', e.target.value)}
                  className="px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => updateScheduleSlot(index, 'end_time', e.target.value)}
                  className="px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={slot.room}
                    onChange={(e) => updateScheduleSlot(index, 'room', e.target.value)}
                    placeholder="Salle"
                    className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
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
              {editingCourse ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCourse(null);
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
        isOpen={courseToDelete !== null}
        onClose={() => setCourseToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer le cours"
        message={`Êtes-vous sûr de vouloir supprimer le cours "${courseToDelete?.name}" ? Cette action est irréversible et supprimera également toutes les inscriptions associées.`}
      />
    </div>
  );
}