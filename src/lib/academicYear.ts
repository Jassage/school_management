import { AcademicYear } from '../types';

export function getCurrentAcademicYear(): AcademicYear {
  const today = new Date();
  const currentYear = today.getFullYear();
  const startDate = new Date(currentYear, 8, 1); // 1er septembre
  const endDate = new Date(currentYear + 1, 8, 30); // 30 septembre de l'année suivante

  // Si nous sommes avant le 1er septembre, l'année académique a commencé l'année précédente
  if (today < startDate) {
    return {
      id: `${currentYear - 1}-${currentYear}`,
      name: `${currentYear - 1}-${currentYear}`,
      start_date: new Date(currentYear - 1, 8, 1).toISOString(),
      end_date: new Date(currentYear, 8, 30).toISOString(),
      is_current: true
    };
  }

  // Sinon, nous sommes dans l'année académique qui a commencé cette année
  return {
    id: `${currentYear}-${currentYear + 1}`,
    name: `${currentYear}-${currentYear + 1}`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    is_current: true
  };
}

export function getNextAcademicYear(): AcademicYear {
  const current = getCurrentAcademicYear();
  const [startYear] = current.name.split('-').map(Number);
  
  return {
    id: `${startYear + 1}-${startYear + 2}`,
    name: `${startYear + 1}-${startYear + 2}`,
    start_date: new Date(startYear + 1, 8, 1).toISOString(),
    end_date: new Date(startYear + 2, 8, 30).toISOString(),
    is_current: false
  };
}

export function getPreviousAcademicYear(): AcademicYear {
  const current = getCurrentAcademicYear();
  const [startYear] = current.name.split('-').map(Number);
  
  return {
    id: `${startYear - 1}-${startYear}`,
    name: `${startYear - 1}-${startYear}`,
    start_date: new Date(startYear - 1, 8, 1).toISOString(),
    end_date: new Date(startYear, 8, 30).toISOString(),
    is_current: false
  };
}

export function getAcademicYears(): AcademicYear[] {
  return [
    getPreviousAcademicYear(),
    getCurrentAcademicYear(),
    getNextAcademicYear()
  ];
}

export function formatAcademicYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Si nous sommes avant septembre, l'année académique a commencé l'année précédente
  if (month < 8) { // 8 = septembre (0-based)
    return `${year - 1}-${year}`;
  }
  
  // Sinon, nous sommes dans l'année académique qui commence cette année
  return `${year}-${year + 1}`;
}

export function isWithinAcademicYear(date: Date, academicYear: AcademicYear): boolean {
  const checkDate = new Date(date);
  const startDate = new Date(academicYear.start_date);
  const endDate = new Date(academicYear.end_date);
  
  return checkDate >= startDate && checkDate <= endDate;
}