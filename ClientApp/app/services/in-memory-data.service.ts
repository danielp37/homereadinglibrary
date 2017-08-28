import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Volunteer } from '../entities/volunteer';
import { Class } from '../entities/class';
import { DayOfWeek } from '../entities/day-of-week.enum';

export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const volunteers = [
            {id: 'volunteer-1', firstName: 'Alicia', lastName: 'Preece', phone: '(801) 701-0066', email: 'preeceworld@gmail.com',
                volunteerForClass : [{classId: 'class-kindergardenTeacher-2018', dayOfWeek: DayOfWeek.Monday}]},
            {id: 'volunteer-2', firstName: 'Dan', lastName: 'Preece', phone: '(801) 319-1242', email: 'dan.preece37@gmail.com',
                volunteerForClass : [{classId: 'class-firstGradeTeacher-2018', dayOfWeek: DayOfWeek.Tuesday}]},
            {id: 'volunteer-3', firstName: 'Some', lastName: 'Volunteer', phone: '(801) 555-5555', email: 'foo@gmail.com',
                volunteerForClass : [{classId: 'class-secondGradeTeacher-2018', dayOfWeek: DayOfWeek.Wednesday}]}
        ];

        const classes = [
            {classId: 'class-kindergardenTeacher-2018', teacherName: 'kindergardenTeacher', grade : 0, schoolYear: 2018},
            {classId: 'class-firstGradeTeacher-2018', teacherName: 'firstGradeTeacher', grade : 1, schoolYear: 2018},
            {classId: 'class-secondGradeTeacher-2018', teacherName: 'secondGradeTeacher', grade : 2, schoolYear: 2018},
            {classId: 'class-someotherYear-2017', teacherName: 'SomeOtherYear', grade : 2, schoolYear: 2017},
            {classId: 'class-anotherKinderGardenTeacher-2018', teacherName: 'anotherKinderGardenTeacher', grade : 0, schoolYear: 2018},
        ];

        const students = [
            {studentId: '1', firstName : 'John', lastName : 'Doe', classId : 'class-kindergardenTeacher-2018', readingLevel : 'A',
                barCode: 1},
            {studentId: '2', firstName : 'Jane', lastName : 'Doe', classId : 'class-kindergardenTeacher-2018', readingLevel : 'B',
                barCode: 2},
            {studentId: '3', firstName : 'Joe', lastName : 'Schmoe', classId : 'class-kindergardenTeacher-2018', readingLevel : 'C',
                barCode: 3},
            {studentId: '4', firstName : 'Fa', lastName : 'Mulan', classId : 'class-firstGradeTeacher-2018', readingLevel : 'A',
                barCode: 4},
            {studentId: '5', firstName : 'Mickey', lastName : 'Mouse', classId : 'class-firstGradeTeacher-2018', readingLevel : 'B',
                barCode: 5},
            {studentId: '6', firstName : 'Prince', lastName : 'Aladdin', classId : 'class-firstGradeTeacher-2018', readingLevel : 'C',
                barCode: 6},
        ];

        const books = [
            // tslint:disable-next-line:max-line-length
            {id: '1', title: 'Book1', author: 'Author1', publisherText: 'Blah c1990', guidedReadingLevel: 'B', isbn: '123123123123', boxNumber: '12'},
            // tslint:disable-next-line:max-line-length
            {id: '2', title: 'Book2', author: 'Author2', publisherText: 'Blah c1990', guidedReadingLevel: 'B', isbn: '123123123124', boxNumber: '12'},
            {id: '3', title: 'Book3', author: 'Author3', publisherText: 'Blah c1990', guidedReadingLevel: 'B', isbn: '123123123125', boxNumber: '12',
                bookCopies: [{'bookCopyId': '3-1', 'bookId': '3', 'barCode': '1'}]}
        ];

        const bookCopyReservations = [];

        return {
            volunteers : volunteers,
            // classes : classes,
            // students : students,
            // books : books,
            bookcopyreservations : bookCopyReservations
        };
    }
}
