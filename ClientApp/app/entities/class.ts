import {Volunteer} from './volunteer';
export class Class {
    classId: string;
    teacherName: string;
    grade: number;
    volunteers: Volunteer[] = new Array();

    public static fromObject(classObj: any): Class {
        const cls = new Class();
        Object.assign(cls, classObj);
        return cls;
    }
}
