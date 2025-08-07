export interface Group {
  id: string;
  academicLevel: 'Maternal' | 'Preescolar' | 'Primaria' | 'Secundaria';
  grade: string; // Ej: 'Primero', 'Segundo', ...
  name: string; // Ej: 'A', 'B', 'C'
  maxStudents: number;
  studentsCount: number;
  academicYear: string; // Ej: '2024-2025', '2025-2026'
}
