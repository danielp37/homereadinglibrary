import { LateNoticeTemplateService } from './late-notice-template.service';

describe('LateNoticeTemplateService', () => {
  let service: LateNoticeTemplateService;

  beforeEach(() => {
    localStorage.clear();
    service = new LateNoticeTemplateService();
  });

  // --- Storage & CRUD ---

  it('should return a default template when nothing is stored', () => {
    const templates = service.getTemplates();
    expect(templates.length).toBe(1);
    expect(templates[0].name).toBe('Default');
    expect(templates[0].content).toBe(service.DEFAULT_TEMPLATE_CONTENT);
  });

  it('getTemplate with unknown id should fall back to first template', () => {
    const t = service.getTemplate('non-existent-id');
    expect(t).toBeTruthy();
    expect(t.id).toBe(service.getTemplates()[0].id);
  });

  it('should add a new template', () => {
    const created = service.addTemplate('My Notice', 'Hello {{studentName}}');
    const templates = service.getTemplates();
    expect(templates.length).toBe(2);
    expect(templates[1].id).toBe(created.id);
    expect(templates[1].name).toBe('My Notice');
    expect(templates[1].content).toBe('Hello {{studentName}}');
  });

  it('addTemplate should default empty name to "Untitled"', () => {
    const created = service.addTemplate('', 'content');
    expect(created.name).toBe('Untitled');
  });

  it('should save (update) an existing template', () => {
    const templates = service.getTemplates();
    const original = templates[0];
    service.saveTemplate({ ...original, name: 'Renamed', content: 'New content' });
    const updated = service.getTemplate(original.id);
    expect(updated.name).toBe('Renamed');
    expect(updated.content).toBe('New content');
    expect(service.getTemplates().length).toBe(1);
  });

  it('saveTemplate should trim and default empty name to "Untitled"', () => {
    const original = service.getTemplates()[0];
    service.saveTemplate({ ...original, name: '   ' });
    expect(service.getTemplate(original.id).name).toBe('Untitled');
  });

  it('should delete a template when more than one exists', () => {
    const created = service.addTemplate('Second', 'content');
    service.deleteTemplate(created.id);
    const templates = service.getTemplates();
    expect(templates.length).toBe(1);
    expect(templates.find(t => t.id === created.id)).toBeUndefined();
  });

  it('should not delete the last remaining template', () => {
    const templates = service.getTemplates();
    service.deleteTemplate(templates[0].id);
    expect(service.getTemplates().length).toBe(1);
  });

  // --- Migration ---

  it('should migrate legacy "late-notice-template" key on first load', () => {
    localStorage.clear();
    localStorage.setItem('late-notice-template', 'Legacy template content');
    const freshService = new LateNoticeTemplateService();
    const templates = freshService.getTemplates();
    expect(templates.length).toBe(1);
    expect(templates[0].content).toBe('Legacy template content');
    expect(localStorage.getItem('late-notice-template')).toBeNull();
  });

  it('should prefer new storage key over legacy key', () => {
    // service already populated new key in beforeEach
    localStorage.setItem('late-notice-template', 'Old content');
    const freshService = new LateNoticeTemplateService();
    // new key already exists, legacy key should be ignored
    expect(freshService.getTemplates()[0].content).not.toBe('Old content');
  });

  // --- Corrupt storage fallback ---

  it('should fall back to default when stored JSON is malformed', () => {
    localStorage.setItem('late-notice-templates', 'not-json!!');
    const freshService = new LateNoticeTemplateService();
    const templates = freshService.getTemplates();
    expect(templates.length).toBe(1);
    expect(templates[0].content).toBe(freshService.DEFAULT_TEMPLATE_CONTENT);
  });

  it('should fall back to default when templates array is empty', () => {
    localStorage.setItem('late-notice-templates', JSON.stringify({ templates: [] }));
    const freshService = new LateNoticeTemplateService();
    expect(freshService.getTemplates().length).toBe(1);
  });

  // --- renderNoticeFromTemplate ---

  describe('renderNoticeFromTemplate', () => {
    const sampleData = {
      studentName: 'Jane Doe',
      studentBarCode: 'STU99887',
      grade: '3',
      teacherName: 'Ms. Smith',
      books: [
        { title: 'The Cat in the Hat', bookBarCode: 'BC001', checkedOutDate: '01/15/2025' },
        { title: 'Green Eggs and Ham', bookBarCode: 'BC002', checkedOutDate: '01/20/2025' },
      ],
    };

    it('should substitute {{studentName}}', () => {
      const html = service.renderNoticeFromTemplate('Name: {{studentName}}', sampleData);
      expect(html).toContain('Jane Doe');
    });

    it('should substitute {{studentBarCode}}', () => {
      const html = service.renderNoticeFromTemplate('Barcode: {{studentBarCode}}', sampleData);
      expect(html).toContain('STU99887');
    });

    it('should substitute {{grade}}', () => {
      const html = service.renderNoticeFromTemplate('Grade: {{grade}}', sampleData);
      expect(html).toContain('3');
    });

    it('should substitute {{teacherName}}', () => {
      const html = service.renderNoticeFromTemplate('Teacher: {{teacherName}}', sampleData);
      expect(html).toContain('Ms. Smith');
    });

    it('should include all book titles in {{bookList}}', () => {
      const html = service.renderNoticeFromTemplate('{{bookList}}', sampleData);
      expect(html).toContain('The Cat in the Hat');
      expect(html).toContain('Green Eggs and Ham');
    });

    it('should include book bar codes in {{bookList}}', () => {
      const html = service.renderNoticeFromTemplate('{{bookList}}', sampleData);
      expect(html).toContain('BC001');
      expect(html).toContain('BC002');
    });

    it('should include checked out dates in {{bookList}}', () => {
      const html = service.renderNoticeFromTemplate('{{bookList}}', sampleData);
      expect(html).toContain('01/15/2025');
      expect(html).toContain('01/20/2025');
    });

    it('should render markdown bold as <strong>', () => {
      const html = service.renderNoticeFromTemplate('**bold text**', sampleData);
      expect(html).toContain('<strong>bold text</strong>');
    });

    it('should HTML-escape special characters in studentName', () => {
      const data = { ...sampleData, studentName: '<script>alert("xss")</script>' };
      const html = service.renderNoticeFromTemplate('{{studentName}}', data);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should HTML-escape special characters in book title', () => {
      const data = {
        ...sampleData,
        books: [{ title: '<b>Bad Title</b>', checkedOutDate: '01/01/2025' }],
      };
      const html = service.renderNoticeFromTemplate('{{bookList}}', data);
      expect(html).not.toContain('<b>Bad Title</b>');
      expect(html).toContain('&lt;b&gt;Bad Title&lt;/b&gt;');
    });

    it('should HTML-escape ampersands in teacherName', () => {
      const data = { ...sampleData, teacherName: 'Smith & Jones' };
      const html = service.renderNoticeFromTemplate('{{teacherName}}', data);
      expect(html).toContain('Smith &amp; Jones');
    });

    it('should render a list for multiple books', () => {
      const html = service.renderNoticeFromTemplate('{{bookList}}', sampleData);
      expect(html).toContain('<li>');
    });
  });

  // --- escapeHtml ---

  describe('escapeHtml', () => {
    it('should escape &', () => expect(service.escapeHtml('a & b')).toBe('a &amp; b'));
    it('should escape <', () => expect(service.escapeHtml('<tag>')).toBe('&lt;tag&gt;'));
    it('should escape "', () => expect(service.escapeHtml('"quote"')).toBe('&quot;quote&quot;'));
    it('should escape single quote', () => expect(service.escapeHtml("it's")).toBe('it&#039;s'));
  });
});
