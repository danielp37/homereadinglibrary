import { Injectable } from '@angular/core';
import { marked } from 'marked';

export interface LateNoticeData {
  studentName: string;
  studentBarCode: string;
  grade: string;
  teacherName: string;
  books: { title: string; bookBarCode: string; checkedOutDate: string }[];
}

export interface NoticeTemplate {
  id: string;
  name: string;
  content: string;
}

interface TemplateStore {
  templates: NoticeTemplate[];
}

@Injectable({ providedIn: 'root' })
export class LateNoticeTemplateService {
  private readonly STORAGE_KEY = 'late-notice-templates';
  private readonly LEGACY_KEY = 'late-notice-template';

  readonly DEFAULT_TEMPLATE_CONTENT =
    `**Home Reading Library Notice**\n\n` +
    `Dear Parent/Guardian of **{{studentName}}**,\n\n` +
    `Your child in Grade {{grade}} (Teacher: {{teacherName}}) has the following book(s) that are overdue. ` +
    `Please return them to school as soon as possible.\n\n` +
    `{{bookList}}\n\n` +
    `Thank you!`;

  private loadStore(): TemplateStore {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      const store = this.migrateOrDefault();
      this.saveStore(store);
      return store;
    }
    try {
      const parsed = JSON.parse(raw) as TemplateStore;
      if (Array.isArray(parsed?.templates) && parsed.templates.length > 0) {
        return parsed;
      }
    } catch { /* fall through to default */ }
    return this.defaultStore();
  }

  private migrateOrDefault(): TemplateStore {
    const legacy = localStorage.getItem(this.LEGACY_KEY);
    if (legacy) {
      localStorage.removeItem(this.LEGACY_KEY);
      return { templates: [{ id: 'default', name: 'Default', content: legacy }] };
    }
    return this.defaultStore();
  }

  private defaultStore(): TemplateStore {
    return { templates: [{ id: 'default', name: 'Default', content: this.DEFAULT_TEMPLATE_CONTENT }] };
  }

  private saveStore(store: TemplateStore): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  }

  getTemplates(): NoticeTemplate[] {
    return this.loadStore().templates;
  }

  getTemplate(id: string): NoticeTemplate {
    const store = this.loadStore();
    return store.templates.find(t => t.id === id) ?? store.templates[0];
  }

  saveTemplate(template: NoticeTemplate): void {
    const store = this.loadStore();
    const idx = store.templates.findIndex(t => t.id === template.id);
    const sanitized: NoticeTemplate = {
      ...template,
      name: template.name.trim() || 'Untitled',
    };
    if (idx >= 0) {
      store.templates[idx] = sanitized;
    } else {
      store.templates.push(sanitized);
    }
    this.saveStore(store);
  }

  addTemplate(name: string, content: string): NoticeTemplate {
    const store = this.loadStore();
    const newTemplate: NoticeTemplate = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Untitled',
      content,
    };
    store.templates.push(newTemplate);
    this.saveStore(store);
    return newTemplate;
  }

  deleteTemplate(id: string): void {
    const store = this.loadStore();
    if (store.templates.length <= 1) return;
    store.templates = store.templates.filter(t => t.id !== id);
    this.saveStore(store);
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
