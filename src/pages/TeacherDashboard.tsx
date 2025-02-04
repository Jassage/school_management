import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import Calendar from 'react-calendar';
import { 
  BookOpen, Users, FileText, Bell,
  Calendar as CalendarIcon, Clock, AlertTriangle
} from 'lucide-react';
import { courses, events, announcements, grades, students } from '../lib/api';
import type { Value } from 'react-calendar/dist/cjs/shared/types';

export default function TeacherDashboard() {
  const { profile } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherEvents, setTeacherEvents] = useState([]);
  const [teacherAnnouncements, setTeacherAnnouncements] = useState([]);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null);
        const [coursesData, eventsData, announcementsData, gradesData, studentsData] = await Promise.all([
          courses.getAll(),
          events.getAll(),
          announcements.getAll(),
          grades.getAll(),
          students.getAll()
        ]);

        // Filter courses where teacher is assigned
        const teacherCoursesData = coursesData.filter(course => course.teacher_id === profile?.id);
        setTeacherCourses(teacherCoursesData);

        // Calculate total students across all courses
        const uniqueStudents = new Set(
          teacherCoursesData.flatMap(course => course.students)
        );
        setTotalStudents(uniqueStudents.size);

        setTeacherEvents(eventsData);
        setTeacherAnnouncements(announcementsData);

        // Filter grades that need to be submitted
        const pendingGradesData = gradesData.filter(grade => 
          !grade.final_grade && teacherCoursesData.some(course => course.id === grade.course_id)
        );
        setPendingGrades(pendingGradesData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile?.id]);

  // Get today's schedule
  const todaySchedule = teacherCourses.filter(course => {
    const today = new Date();
    return course.schedule.some(slot => 
      slot.day === today.toLocaleDateString('fr-FR', { weekday: 'long' })
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erreur</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Cours
            </h3>
            <p className="text-2xl font-semibold mt-1">{teacherCourses.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Étudiants
            </h3>
            <p className="text-2xl font-semibold mt-1">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Notes à saisir
            </h3>
            <p className="text-2xl font-semibold mt-1">{pendingGrades.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Annonces
            </h3>
            <p className="text-2xl font-semibold mt-1">{teacherAnnouncements.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold">Calendrier des cours</h3>
          </div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full border-0 rounded-lg"
            tileClassName={({ date }) => {
              const hasEvent = teacherCourses.some(course =>
                course.schedule.some(slot =>
                  slot.day === date.toLocaleDateString('fr-FR', { weekday: 'long' })
                )
              );
              return hasEvent ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : '';
            }}
          />
        </div>

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold">Emploi du temps du jour</h3>
          </div>
          <div className="space-y-4">
            {todaySchedule.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucun cours prévu aujourd'hui
              </p>
            ) : (
              todaySchedule.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Salle {course.room} - {course.students.length} étudiants
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                    {course.schedule[0].start_time} - {course.schedule[0].end_time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Activité récente</h3>
        <div className="space-y-4">
          {pendingGrades.slice(0, 5).map((grade) => (
            <div
              key={grade.id}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <p className="font-medium">Note à saisir</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {grade.student_name} - {grade.course_name}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                {new Date(grade.due_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}