import { Student } from './student';
import {Volunteer} from './volunteer';
export class Class {
    classId: string;
    teacherName: string;
    grade: number;
    students: Student[] = new Array();

    public static fromObject(classObj: any): Class {
        const cls = new Class();
        Object.assign(cls, classObj);
        if (classObj.students) {
            cls.students = classObj.students.map(Student.fromObject);
        }
        return cls;
    }
}
