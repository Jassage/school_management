import React, { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { 
  GraduationCap, Plus, Edit2, Trash2, FileText, 
  Download, Filter, AlertTriangle, CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  mockFacultySubjects, 
  mockStudents,
  mockSubjects,
  mockTeachers,
  mockFaculties,
  mockAcademicYears 
} from '../lib/mockData';
import type { Grade, GradeType } from '../types';

interface GradeEntry {
  id: string;
  student_id: string;
  cc_grade: number | null;
  exam_grade: number | null;
  final_grade: number | null;
  letter_grade: string | null;
  is_passing: boolean;
}

export default function GradesManagement() {
  const { profile } = useAuthStore();
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isGradeTypeModalOpen, setIsGradeTypeModalOpen] = useState(false);
  const [selectedFacultySubject, setSelectedFacultySubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    faculty_id: '',
    level: '',
    semester: '',
    academic_year_id: '',
  });

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit grades to the backend
    console.log('Submitting grades:', gradeEntries);
  };

  const validateGrade = (grade: number | null): boolean => {
    if (grade === null) return true;
    return grade >= 0 && grade <= 100;
  };

  const calculateFinalGrade = (cc: number | null, exam: number | null): number | null => {
    if (cc === null || exam === null) return null;
    return Math.round((cc * 0.4 + exam * 0.6) * 100) / 100;
  };

  const getLetterGrade = (finalGrade: number | null): string | null => {
    if (finalGrade === null) return null;
    if (finalGrade >= 90) return 'A+';
    if (finalGrade >= 85) return 'A';
    if (finalGrade >= 80) return 'A-';
    if (finalGrade >= 75) return 'B+';
    if (finalGrade >= 70) return 'B';
    if (finalGrade >= 65) return 'C+';
    if (finalGrade >= 60) return 'C';
    if (finalGrade >= 55) return 'D+';
    if (finalGrade >= 50) return 'D';
    return 'F';
  };

  const handleGradeChange = (studentId: string, field: 'cc_grade' | 'exam_grade', value: string) => {
    const numValue = value === '' ? null : Number(value);
    if (numValue !== null && !validateGrade(numValue)) return;

    setGradeEntries(prev => {
      return prev.map(entry => {
        if (entry.student_id === studentId) {
          const newEntry = { ...entry, [field]: numValue };
          const finalGrade = calculateFinalGrade(
            field === 'cc_grade' ? numValue : entry.cc_grade,
            field === 'exam_grade' ? numValue : entry.exam_grade
          );
          const letterGrade = getLetterGrade(finalGrade);
          return {
            ...newEntry,
            final_grade: finalGrade,
            letter_grade: letterGrade,
            is_passing: finalGrade !== null ? finalGrade >= 70 : false
          };
        }
        return entry;
      });
    });
  };

  const loadStudentGrades = () => {
    if (!selectedFacultySubject || !selectedAcademicYear) return;

    // In a real app, this would fetch from the backend
    const students = mockStudents.map(student => ({
      id: crypto.randomUUID(),
      student_id: student.id,
      cc_grade: null,
      exam_grade: null,
      final_grade: null,
      letter_grade: null,
      is_passing: false
    }));

    setGradeEntries(students);
  };

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <GraduationCap size={32} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Gestion des Notes</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold">Sélection du cours</h3>
          </div>
          <button
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
          >
            {bulkEditMode ? 'Mode individuel' : 'Mode édition en masse'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Faculté</label>
            <select
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
            <label className="block text-sm font-medium mb-1">Niveau</label>
            <select
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
            <label className="block text-sm font-medium mb-1">Semestre</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value) as 1 | 2)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={1}>Semestre 1</option>
              <option value={2}>Semestre 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Année académique</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Sélectionner une année</option>
              {mockAcademicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Matière</label>
          <select
            value={selectedFacultySubject}
            onChange={(e) => setSelectedFacultySubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Sélectionner une matière</option>
            {mockFacultySubjects
              .filter(fs => 
                (!filters.faculty_id || fs.faculty_id === filters.faculty_id) &&
                (!filters.level || fs.level === filters.level)
              )
              .map(fs => {
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

        <div className="mt-4 flex justify-end">
          <button
            onClick={loadStudentGrades}
            disabled={!selectedFacultySubject || !selectedAcademicYear}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Charger les notes
          </button>
        </div>
      </div>

      {/* Grade List */}
      {gradeEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notes des étudiants</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {/* Export grades */}}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Download size={16} />
                  <span>Exporter</span>
                </button>
                <button
                  onClick={handleGradeSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Enregistrer les notes
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Note CC (40%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Note Examen (60%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Note Finale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {gradeEntries.map((entry) => {
                    const student = mockStudents.find(s => s.id === entry.student_id);
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {student?.full_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{student?.full_name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                #{student?.student_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={entry.cc_grade ?? ''}
                            onChange={(e) => handleGradeChange(entry.student_id, 'cc_grade', e.target.value)}
                            className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            min="0"
                            max="100"
                            step="0.25"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={entry.exam_grade ?? ''}
                            onChange={(e) => handleGradeChange(entry.student_id, 'exam_grade', e.target.value)}
                            className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            min="0"
                            max="100"
                            step="0.25"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">
                            {entry.final_grade !== null ? entry.final_grade.toFixed(2) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.letter_grade === null ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                            entry.letter_grade.startsWith('A') ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                            entry.letter_grade.startsWith('B') ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' :
                            entry.letter_grade.startsWith('C') ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                            entry.letter_grade.startsWith('D') ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200' :
                            'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                          }`}>
                            {entry.letter_grade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.final_grade !== null && (
                            <div className="flex items-center space-x-2">
                              {entry.is_passing ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600 dark:text-green-400">Validé</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-600 dark:text-red-400">Non validé</span>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}