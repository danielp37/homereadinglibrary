import { VolunteerLogon } from './volunteer-logon';
export interface VolunteerWithLogons {
    voluteerId: string;
    firstName: string;
    lastName: string;
    classes: string[];
    grades: string[];
    logons: VolunteerLogon[];
    firstLoginDate: Date;
    lastLoginDate: Date;
}
