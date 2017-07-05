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

    bookCopies: BookCopy[];

    public static fromIsbnEntry(isbnEntry: IsbnEntry): Book {
        const book = new Book();
        book.id = isbnEntry.book_id;
        book.title = isbnEntry.title;
        book.author = isbnEntry.author_data[0].name;
        book.publisherText = isbnEntry.publisher_text;
        book.isbn = isbnEntry.isbn13;
        return book;
    }

    public static fromObject(bookObj: any): Book {
        const book = new Book();
        Object.assign(book, bookObj);
        if (bookObj.bookCopies !== undefined) {
            bookObj.forEach(element => {
                book.bookCopies.push(BookCopy.fromObject(element));
            });
        }
        return book;
    }

    addBookCopy(barCode: number): void {
        if (this.bookCopies === undefined) {
            this.bookCopies = new Array<BookCopy>();
        }
        if (this.bookCopies.find(bookCopy => bookCopy.barCode === barCode) === undefined) {
            this.bookCopies.push(new BookCopy(this.id, barCode));
        }
    }

    getBookCopy(barCode: number): BookCopy {
        return this.bookCopies.find(bc => bc.barCode === barCode);
    }

    get bookCopyCount(): number {
        return this.bookCopies !== undefined ? this.bookCopies.length : 0;
    }
}
