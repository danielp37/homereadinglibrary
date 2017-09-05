import { StudentWithTeacher } from './student-with-teacher';
import { BookCopyWithBook } from './book-copy-with-book';
export interface BookCopyReservationWithData {
    BookCopyReservationId?: string;
    book: BookCopyWithBook;
    student: StudentWithTeacher;
    checkedOutDate?: Date;
    checkedInDate?: Date;
}
