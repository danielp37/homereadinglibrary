export class BookCopy {
    barCode: string;
    isLost?: boolean;
    isDamaged?: boolean;

    static fromObject(bookCopyObj: any): BookCopy {
        const bookCopy = new BookCopy(bookCopyObj.barCode);
        Object.assign(bookCopy, bookCopyObj);
        return bookCopy;
    }

    /**
     *
     */
    constructor(barCode: string) {
        this.barCode = barCode;
    }
}
