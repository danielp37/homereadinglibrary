export interface BookCopyReservation {
    BookCopyReservationId?: string;
    bookCopyBarCode: string;
    studentBarCode: string;
    checkedOutDate?: Date;
    checkedInDate?: Date;
}
