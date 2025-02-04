import { Student, Teacher, Faculty, Subject, FacultySubject, AcademicYear, User, Schedule } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    full_name: 'Admin User',
    role: 'admin',
    user_id: '123',
  },
  {
    id: '2',
    full_name: 'Teacher User',
    role: 'teacher',
    user_id: '456',
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    full_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    birth_date: '2000-01-15',
    birth_place: 'Paris',
    nationality: 'Française',
    address: '123 Rue de la République',
    phone: '+33123456789',
    gender: 'M',
    blood_type: 'A+',
    allergies: [],
    medical_conditions: [],
    emergency_contact: {
      name: 'Marie Dupont',
      relationship: 'Mère',
      phone: '+33123456780'
    },
    student_id: 'STD2024001',
    enrollment_status: 'enrolled',
    enrollment_date: '2023-09-01',
    current_level: 'L1',
    current_faculty: '1',
    academic_year: '1'
  },
  {
    id: '2',
    full_name: 'Marie Martin',
    email: 'marie.martin@example.com',
    birth_date: '2001-03-20',
    birth_place: 'Lyon',
    nationality: 'Française',
    address: '456 Avenue des Champs',
    phone: '+33123456781',
    gender: 'F',
    blood_type: 'O+',
    allergies: ['Pollen'],
    medical_conditions: [],
    emergency_contact: {
      name: 'Pierre Martin',
      relationship: 'Père',
      phone: '+33123456782'
    },
    student_id: 'STD2024002',
    enrollment_status: 'enrolled',
    enrollment_date: '2023-09-01',
    current_level: 'L1',
    current_faculty: '1',
    academic_year: '1'
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    full_name: 'Dr. Robert Bernard',
    email: 'robert.bernard@example.com',
    phone: '+33123456783',
    specialization: 'Mathématiques',
    department: 'Sciences',
    office_number: 'B101',
    office_hours: 'Lundi 14h-16h, Mercredi 10h-12h',
    status: 'active'
  },
  {
    id: '2',
    full_name: 'Prof. Sophie Laurent',
    email: 'sophie.laurent@example.com',
    phone: '+33123456784',
    specialization: 'Physique',
    department: 'Sciences',
    office_number: 'B102',
    office_hours: 'Mardi 14h-16h, Jeudi 10h-12h',
    status: 'active'
  }
];

export const mockFaculties: Faculty[] = [
  {
    id: '1',
    name: 'Faculté des Sciences',
    description: 'Formation en sciences fondamentales et appliquées',
    departments: ['Mathématiques', 'Physique', 'Chimie', 'Informatique']
  },
  {
    id: '2',
    name: 'Faculté des Lettres',
    description: 'Formation en lettres et sciences humaines',
    departments: ['Littérature', 'Histoire', 'Philosophie']
  }
];

export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Analyse Mathématique',
    code: 'MATH101',
    description: 'Introduction à l\'analyse mathématique',
    credits: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mécanique Classique',
    code: 'PHYS101',
    description: 'Fondements de la mécanique newtonienne',
    credits: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockFacultySubjects: FacultySubject[] = [
  {
    id: '1',
    faculty_id: '1',
    subject_id: '1',
    teacher_id: '1',
    level: 'L1',
    semester: 1,
    academic_year_id: '1',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    faculty_id: '1',
    subject_id: '2',
    teacher_id: '2',
    level: 'L1',
    semester: 1,
    academic_year_id: '1',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: '2023-2024',
    start_date: '2023-09-01',
    end_date: '2024-08-31',
    is_current: true
  },
  {
    id: '2',
    name: '2024-2025',
    start_date: '2024-09-01',
    end_date: '2025-08-31',
    is_current: false
  }
];

export const mockSchedules: Schedule[] = [
  {
    id: '1',
    faculty_subject_id: '1',
    day: 'Lundi',
    start_time: '08:00',
    end_time: '10:00',
    room: 'A101',
    type: 'CM',
    group: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    faculty_subject_id: '1',
    day: 'Mercredi',
    start_time: '14:00',
    end_time: '16:00',
    room: 'A102',
    type: 'TD',
    group: 'Groupe 1',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    faculty_subject_id: '2',
    day: 'Mardi',
    start_time: '10:00',
    end_time: '12:00',
    room: 'B201',
    type: 'CM',
    group: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];