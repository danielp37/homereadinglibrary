import {Volunteer} from './volunteer';
export class Class {
    classId: string;
    teacherName: string;
    grade: number;
    schoolYear: number;
    volunteers: Volunteer[] = new Array();
}
