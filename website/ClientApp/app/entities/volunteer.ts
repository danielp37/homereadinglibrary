import {VolunteerForClass} from './volunteer-for-class';
export class Volunteer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    volunteerForClasses: VolunteerForClass[] = new Array();
}
