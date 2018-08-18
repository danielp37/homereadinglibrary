import { StudentWithTeacher } from './student-with-teacher';
import { BookCopyWithBook } from './book-copy-with-book';
export interface BookCopyReservationWithData {
    id: string;
    bookCopy: BookCopyWithBook;
    student: StudentWithTeacher;
    checkedOutDate: Date;
    checkedOutBy: string;
    checkedInDate?: Date;
    checkedInBy: string;
}
