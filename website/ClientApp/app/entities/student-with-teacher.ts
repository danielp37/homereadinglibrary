import { Student } from './student';
export interface StudentWithTeacher {
    studentBarCode: string;
    teacherName: string;
    grade: number;
    student: Student;
    teacherId: string;
}
