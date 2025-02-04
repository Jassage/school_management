import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import UserProfile from './pages/UserProfile';
import UsersManagement from './pages/UsersManagement';
import StudentsManagement from './pages/StudentsManagement';
import StudentDetails from './pages/StudentDetails';
import TeachersManagement from './pages/TeachersManagement';
import TeacherDetails from './pages/TeacherDetails';
import SubjectsManagement from './pages/SubjectsManagement';
import FacultySubjectsManagement from './pages/FacultySubjectsManagement';
import FacultyManagement from './pages/FacultyManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import GradesManagement from './pages/GradesManagement';
import PaymentManagement from './pages/PaymentManagement';
import Settings from './pages/Settings';

export default function App() {
  const { setUser, isDarkMode } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="teachers" element={<TeachersManagement />} />
            <Route path="teachers/:id" element={<TeacherDetails />} />
            <Route path="subjects" element={<SubjectsManagement />} />
            <Route path="faculty-subjects" element={<FacultySubjectsManagement />} />
            <Route path="faculties" element={<FacultyManagement />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="grades" element={<GradesManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}