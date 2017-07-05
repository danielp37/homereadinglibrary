export class BookCopy {
    bookCopyId: string;
    bookId: string;
    barCode: number;
    isLost?: boolean;
    isDamaged?: boolean;

    static fromObject(bookCopyObj: any): BookCopy {
        const bookCopy = new BookCopy(bookCopyObj.bookId, bookCopyObj.barCode);
        Object.assign(bookCopy, bookCopyObj);
        return bookCopy;
    }

    /**
     *
     */
    constructor(bookId: string, barCode: number) {
        this.bookId = bookId;
        this.barCode = barCode;
        this.bookCopyId = `${this.bookId}-${this.barCode}`;
    }
}
