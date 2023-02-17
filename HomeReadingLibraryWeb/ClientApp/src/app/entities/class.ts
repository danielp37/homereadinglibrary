import { Student } from './student';
export class Class {
    classId: string;
    teacherName: string;
    grade: number;
    students: Student[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static fromObject(classObj: any): Class {
        const cls = new Class();
        Object.assign(cls, classObj);
        if (classObj.students) {
            cls.students = classObj.students.map(Student.fromObject);
        }
        return cls;
    }
}
