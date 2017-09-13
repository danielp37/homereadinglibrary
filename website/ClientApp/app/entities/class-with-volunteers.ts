import { ClassVolunteer } from './class-volunteer';
export interface ClassWithVolunteers {
    classId: string;
    teacherName: string;
    grade: number;
    volunteers: ClassVolunteer[];
}
