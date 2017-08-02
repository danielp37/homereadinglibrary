export class BookCopyReservation {
    id: string;
    bookCopyBarCode: string;
    studentId: string;
    checkedOutDate: Date;
    checkedInDate?: Date;

    constructor(bookCopyId: string, studentId: string, checkedOutDate: Date) {
        this.bookCopyBarCode = bookCopyId;
        this.studentId = studentId;
        this.checkedOutDate = checkedOutDate;
    }
}
