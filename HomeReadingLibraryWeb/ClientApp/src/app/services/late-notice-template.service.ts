import { Injectable } from '@angular/core';
import { marked } from 'marked';

export interface LateNoticeData {
  studentName: string;
  grade: string;
  teacherName: string;
  books: { title: string; checkedOutDate: string }[];
}

@Injectable({ providedIn: 'root' })
export class LateNoticeTemplateService {
  private readonly STORAGE_KEY = 'late-notice-template';

  readonly DEFAULT_TEMPLATE =
    `**Home Reading Library Notice**\n\n` +
    `Dear Parent/Guardian of **{{studentName}}**,\n\n` +
    `Your child in Grade {{grade}} (Teacher: {{teacherName}}) has the following book(s) that are overdue. ` +
    `Please return them to school as soon as possible.\n\n` +
    `{{bookList}}\n\n` +
    `Thank you!`;

  getTemplate(): string {
    return localStorage.getItem(this.STORAGE_KEY) ?? this.DEFAULT_TEMPLATE;
  }

  setTemplate(template: string): void {
    localStorage.setItem(this.STORAGE_KEY, template);
  }

  resetTemplate(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  renderNotice(data: LateNoticeData): string {
    return this.renderNoticeFromTemplate(this.getTemplate(), data);
  }

  renderNoticeFromTemplate(template: string, data: LateNoticeData): string {
    const bookListMd = data.books
      .map(b => `- ${this.escapeHtml(b.title)} (checked out: ${this.escapeHtml(b.checkedOutDate)})`)
      .join('\n');
    const text = template
      .replace(/\{\{studentName\}\}/g, this.escapeHtml(data.studentName))
      .replace(/\{\{grade\}\}/g, this.escapeHtml(data.grade))
      .replace(/\{\{teacherName\}\}/g, this.escapeHtml(data.teacherName))
      .replace(/\{\{bookList\}\}/g, bookListMd);
    return marked.parse(text) as string;
  }

  escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
