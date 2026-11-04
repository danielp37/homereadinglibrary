import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NoticeTemplate } from '../entities/notice-template';
import { BaggyBookService } from './baggy-book.service';

export type { NoticeTemplate } from '../entities/notice-template';

export interface LateNoticeData {
  studentName: string;
  studentBarCode: string;
  grade: string;
  teacherName: string;
  currentDate: string;
  books: { title: string; bookBarCode: string; checkedOutDate: string }[];
}

@Injectable({ providedIn: 'root' })
export class LateNoticeTemplateService {
  // Templates used to live only in browser local storage; they are migrated to the database on first load.
  private readonly STORAGE_KEY = 'late-notice-templates';
  private readonly LEGACY_KEY = 'late-notice-template';

  readonly DEFAULT_TEMPLATE_CONTENT =
    `**Home Reading Library Notice**\n\n` +
    `{{currentDate}}\n\n` +
    `Dear Parent/Guardian of **{{studentName}}**,\n\n` +
    `Your child in Grade {{grade}} (Teacher: {{teacherName}}) has the following book(s) that are overdue. ` +
    `Please return them to school as soon as possible.\n\n` +
    `{{bookList}}\n\n` +
    `Thank you!`;

  constructor(private baggyBookService: BaggyBookService) { }

  loadTemplates(): Observable<NoticeTemplate[]> {
    return this.baggyBookService.getLateNoticeTemplates().pipe(
      switchMap(templates => templates.length > 0 ? of(templates) : this.migrateLocalTemplates())
    );
  }

  saveTemplate(template: NoticeTemplate): Observable<NoticeTemplate> {
    return this.baggyBookService.updateLateNoticeTemplate({
      ...template,
      name: template.name.trim() || 'Untitled',
    });
  }

  addTemplate(name: string, content: string): Observable<NoticeTemplate> {
    return this.baggyBookService.createLateNoticeTemplate(name.trim() || 'Untitled', content);
  }

  deleteTemplate(id: string): Observable<string> {
    return this.baggyBookService.deleteLateNoticeTemplate(id);
  }

  // Uploads any templates found in local storage (or the default one) and clears local storage once stored.
  private migrateLocalTemplates(): Observable<NoticeTemplate[]> {
    const local = this.readLocalTemplates();
    const toImport = local.length > 0 ? local : [{ name: 'Default', content: this.DEFAULT_TEMPLATE_CONTENT }];
    return this.baggyBookService.importLateNoticeTemplates(toImport).pipe(
      tap(result => {
        if (local.length > 0 && result.imported) {
          this.clearLocalTemplates();
        }
      }),
      map(result => result.templates)
    );
  }

  private readLocalTemplates(): { name: string; content: string }[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { templates?: { name?: string; content?: string }[] };
        const templates = (Array.isArray(parsed?.templates) ? parsed.templates : [])
          .filter(t => typeof t?.content === 'string' && t.content.trim().length > 0)
          .map(t => ({ name: t.name?.trim() || 'Untitled', content: t.content as string }));
        if (templates.length > 0) {
          return templates;
        }
      }
      const legacy = localStorage.getItem(this.LEGACY_KEY);
      if (legacy && legacy.trim()) {
        return [{ name: 'Default', content: legacy }];
      }
    } catch { /* unreadable local storage is treated as nothing to migrate */ }
    return [];
  }

  private clearLocalTemplates(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LEGACY_KEY);
  }

  renderNoticeFromTemplate(template: string, data: LateNoticeData): string {
    const bookListMd = data.books
      .map(b => `- ${this.escapeHtml(b.title)} (Bar Code: ${this.escapeHtml(b.bookBarCode)}, checked out: ${this.escapeHtml(b.checkedOutDate)})`)
      .join('\n');
    const text = template
      .replace(/\{\{studentName\}\}/g, this.escapeHtml(data.studentName))
      .replace(/\{\{studentBarCode\}\}/g, this.escapeHtml(data.studentBarCode))
      .replace(/\{\{grade\}\}/g, this.escapeHtml(data.grade))
      .replace(/\{\{teacherName\}\}/g, this.escapeHtml(data.teacherName))
      .replace(/\{\{currentDate\}\}/g, this.escapeHtml(data.currentDate))
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
