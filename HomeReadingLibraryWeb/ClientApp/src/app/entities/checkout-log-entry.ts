import { StudentWithTeacher } from './student-with-teacher';
import { BookCopyWithBook } from './book-copy-with-book';
export class CheckoutLogEntry {
    private _logDate: Date;
    constructor(
        private _student: StudentWithTeacher,
        private _book: BookCopyWithBook,
        private _error?: any
    ) {
        this._logDate = new Date();
    }

    public get student() {
        return this._student;
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
