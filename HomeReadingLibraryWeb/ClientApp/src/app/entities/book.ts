import {BookCopy} from './book-copy';
import { IsbnEntry } from './isbn-entry';

export class Book {
    id: string;
    title: string;
    author: string;
    publisherText: string;
    guidedReadingLevel: string;
    isbn: string;
    boxNumber: string;
    createdDate: Date;
    modifiedDate: Date;
    reservedCopies: number;

    bookCopies: BookCopy[];

    public static fromIsbnEntry(isbnEntry: IsbnEntry): Book {
        const book = new Book();
        book.title = isbnEntry.title;
        book.author = isbnEntry.author_data[0] !== undefined ? isbnEntry.author_data[0].name : 'Unknown';
        book.publisherText = isbnEntry.publisher_text;
        book.isbn = isbnEntry.isbn13;
        return book;
    }

    public static fromObject(bookObj: any): Book {
        const book = new Book();
        Object.assign(book, bookObj);
        if (bookObj.bookCopies !== undefined) {
            book.bookCopies = new Array<BookCopy>();
            bookObj.bookCopies.forEach(element => {
                book.bookCopies.push(BookCopy.fromObject(element));
            });
        }
        return book;
    }

    addBookCopy(barCode: string): void {
        if (this.bookCopies === undefined) {
            this.bookCopies = new Array<BookCopy>();
        }
        if (this.bookCopies.find(bookCopy => bookCopy.barCode === barCode) === undefined) {
            this.bookCopies.push(new BookCopy(barCode));
        }
    }

    getBookCopy(barCode: string): BookCopy {
        if (this.bookCopies === undefined) {
            return null;
        }
        return this.bookCopies.find(bc => bc.barCode === barCode);
    }

    get bookCopyCount(): number {
        return this.bookCopies !== undefined ? this.bookCopies.length : 0;
    }
}
