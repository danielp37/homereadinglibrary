export interface BookCopyWithBook {
    bookCopyBarCode: string;
    title: string;
    author: string;
    guidedReadingLevel: string;
    boxNumber: string;
    bookId: string;
    isLost: boolean;
    lostDate: Date;
    isDamaged: boolean;
    damagedDate: Date;
    comments: string;
}
