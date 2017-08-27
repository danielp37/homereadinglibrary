import {Volunteer} from './volunteer';
export class Class {
    classId: string;
    teacherName: string;
    grade: number;
    volunteers: Volunteer[] = new Array();
}
