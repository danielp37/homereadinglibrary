export class BookCopy {
    barCode: string;
    isLost?: boolean;
    lostDate: Date;
    isDamaged?: boolean;
    damagedDate: Date;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
