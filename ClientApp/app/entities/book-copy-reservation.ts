export class BookCopyReservation {
    id: string;
    bookCopyId: string;
    studentId: string;
    checkedOutDate: Date;
    checkedInDate?: Date;

    constructor(bookCopyId: string, studentId: string, checkedOutDate: Date) {
        this.bookCopyId = bookCopyId;
        this.studentId = studentId;
        this.checkedOutDate = checkedOutDate;
    }
}
