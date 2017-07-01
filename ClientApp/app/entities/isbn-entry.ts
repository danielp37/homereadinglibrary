export interface IsbnEntry {
    author_data : AuthorData[];
    summary: string;
    isbn13: string;
    publisher_text: string;
    physical_description_text: string;
    book_id: string;
    notes: string;
    title: string;
}

export interface AuthorData {
    name: string;
    id: string;
}
