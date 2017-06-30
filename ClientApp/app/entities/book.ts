import { IsbnEntry } from './isbn-entry';

export class Book {
    bookId: string;
    title: string;
    author: string;
    publisherText: string;
    guidedReadingLevel: string;
    isbn: string;
    boxNumber: string;

    public static fromIsbnEntry(isbnEntry: IsbnEntry): Book {
        const book = new Book();
        book.bookId = isbnEntry.book_id;
        book.title = isbnEntry.title;
        book.author = isbnEntry.author_data[0].name;
        book.publisherText = isbnEntry.publisher_text;
        book.isbn = isbnEntry.isbn13;
        return book;
    }
}
