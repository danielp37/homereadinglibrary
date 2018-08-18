import { BookCopyWithBook } from './book-copy-with-book';
export class CheckinLogEntry {
    private _logDate: Date;
    constructor(
        private _book: BookCopyWithBook,
        private _error?: any
    ) {
        this._logDate = new Date();
    }

    public get book(): BookCopyWithBook {
        return this._book;
    }

    public get error(): any {
        return this._error;
    }

    public get logDate(): Date {
        return this._logDate;
    }
}
