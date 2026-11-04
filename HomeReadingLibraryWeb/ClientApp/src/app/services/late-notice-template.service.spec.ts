  import { of } from 'rxjs';
import { LateNoticeTemplateService } from './late-notice-template.service';
import { BaggyBookService } from './baggy-book.service';

describe('LateNoticeTemplateService', () => {
  let service: LateNoticeTemplateService;
  let api: jasmine.SpyObj<BaggyBookService>;

  const stored = [{ id: 'abc', name: 'Stored', content: 'Stored content' }];

  beforeEach(() => {
    localStorage.clear();
    api = jasmine.createSpyObj<BaggyBookService>('BaggyBookService', [
      'getLateNoticeTemplates', 'createLateNoticeTemplate', 'updateLateNoticeTemplate',
      'deleteLateNoticeTemplate', 'importLateNoticeTemplates'
    ]);
    service = new LateNoticeTemplateService(api);
  });

  afterEach(() => localStorage.clear());

  // --- Database storage ---

  it('loadTemplates returns database templates without touching local storage', () => {
    localStorage.setItem('late-notice-templates', JSON.stringify({ templates: [{ id: 'x', name: 'Local', content: 'local' }] }));
    api.getLateNoticeTemplates.and.returnValue(of(stored));
    let result;
    service.loadTemplates().subscribe(t => result = t);
    expect(result).toEqual(stored);
    expect(api.importLateNoticeTemplates).not.toHaveBeenCalled();
    expect(localStorage.getItem('late-notice-templates')).not.toBeNull();
  });

  it('addTemplate defaults empty name to "Untitled"', () => {
    api.createLateNoticeTemplate.and.returnValue(of(stored[0]));
    service.addTemplate('  ', 'content').subscribe();
    expect(api.createLateNoticeTemplate).toHaveBeenCalledWith('Untitled', 'content');
  });

  it('saveTemplate trims the name and defaults empty name to "Untitled"', () => {
    api.updateLateNoticeTemplate.and.returnValue(of(stored[0]));
    service.saveTemplate({ id: 'abc', name: '   ', content: 'c' }).subscribe();
    expect(api.updateLateNoticeTemplate).toHaveBeenCalledWith({ id: 'abc', name: 'Untitled', content: 'c' });
  });

  it('deleteTemplate delegates to the API', () => {
    api.deleteLateNoticeTemplate.and.returnValue(of('abc'));
    service.deleteTemplate('abc').subscribe();
    expect(api.deleteLateNoticeTemplate).toHaveBeenCalledWith('abc');
  });

  // --- Migration from local storage ---

  it('migrates local storage templates to the database and clears local storage', () => {
    localStorage.setItem('late-notice-templates', JSON.stringify({
      templates: [
        { id: 'default', name: 'Default', content: 'One' },
        { id: 'u2', name: '  ', content: 'Two' },
        { id: 'u3', name: 'Blank', content: '  ' },
      ]
    }));
    api.getLateNoticeTemplates.and.returnValue(of([]));
    api.importLateNoticeTemplates.and.returnValue(of(stored));
    let result;
    service.loadTemplates().subscribe(t => result = t);
    expect(api.importLateNoticeTemplates).toHaveBeenCalledWith([
      { name: 'Default', content: 'One' },
      { name: 'Untitled', content: 'Two' },
    ]);
    expect(result).toEqual(stored);
    expect(localStorage.getItem('late-notice-templates')).toBeNull();
  });

  it('migrates the legacy single-template key', () => {
    localStorage.setItem('late-notice-template', 'Legacy template content');
    api.getLateNoticeTemplates.and.returnValue(of([]));
    api.importLateNoticeTemplates.and.returnValue(of(stored));
    service.loadTemplates().subscribe();
    expect(api.importLateNoticeTemplates).toHaveBeenCalledWith([{ name: 'Default', content: 'Legacy template content' }]);
    expect(localStorage.getItem('late-notice-template')).toBeNull();
  });

  it('seeds the default template when database and local storage are empty', () => {
    api.getLateNoticeTemplates.and.returnValue(of([]));
    api.importLateNoticeTemplates.and.returnValue(of(stored));
    service.loadTemplates().subscribe();
    expect(api.importLateNoticeTemplates).toHaveBeenCalledWith([{ name: 'Default', content: service.DEFAULT_TEMPLATE_CONTENT }]);
  });

  it('ignores malformed local storage and seeds the default template', () => {
    localStorage.setItem('late-notice-templates', 'not-json!!');
    api.getLateNoticeTemplates.and.returnValue(of([]));
    api.importLateNoticeTemplates.and.returnValue(of(stored));
    service.loadTemplates().subscribe();
    expect(api.importLateNoticeTemplates).toHaveBeenCalledWith([{ name: 'Default', content: service.DEFAULT_TEMPLATE_CONTENT }]);
  });

  // --- renderNoticeFromTemplate ---

  describe('renderNoticeFromTemplate', () => {
    const sampleData = {
      studentName: 'Jane Doe',
      studentBarCode: 'STU99887',
      grade: '3',
      teacherName: 'Ms. Smith',
      currentDate: '04/27/2026',
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

    it('should substitute {{currentDate}}', () => {
      const html = service.renderNoticeFromTemplate('Date: {{currentDate}}', sampleData);
      expect(html).toContain('04/27/2026');
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
        books: [{ title: '<b>Bad Title</b>', bookBarCode: 'BC999', checkedOutDate: '01/01/2025' }],
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
