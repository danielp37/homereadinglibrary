import { LateNoticeTemplateService } from './late-notice-template.service';

describe('LateNoticeTemplateService', () => {
  let service: LateNoticeTemplateService;

  beforeEach(() => {
    localStorage.clear();
    service = new LateNoticeTemplateService();
  });

  it('should return default template when none stored', () => {
    expect(service.getTemplate()).toBe(service.DEFAULT_TEMPLATE);
  });

  it('should store and retrieve a custom template', () => {
    service.setTemplate('Hello {{studentName}}');
    expect(service.getTemplate()).toBe('Hello {{studentName}}');
  });

  it('should reset to default template', () => {
    service.setTemplate('Custom template');
    service.resetTemplate();
    expect(service.getTemplate()).toBe(service.DEFAULT_TEMPLATE);
  });

  describe('renderNoticeFromTemplate', () => {
    const sampleData = {
      studentName: 'Jane Doe',
      grade: '3',
      teacherName: 'Ms. Smith',
      books: [
        { title: 'The Cat in the Hat', checkedOutDate: '01/15/2025' },
        { title: 'Green Eggs and Ham', checkedOutDate: '01/20/2025' },
      ],
    };

    it('should substitute {{studentName}}', () => {
      const html = service.renderNoticeFromTemplate('Name: {{studentName}}', sampleData);
      expect(html).toContain('Jane Doe');
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
      // marked renders "- item" as <li>
      expect(html).toContain('<li>');
    });
  });

  describe('renderNotice', () => {
    it('should use the stored template', () => {
      service.setTemplate('Stored: {{studentName}}');
      const html = service.renderNotice({
        studentName: 'Alice',
        grade: '2',
        teacherName: 'Mr. Brown',
        books: [],
      });
      expect(html).toContain('Alice');
    });
  });

  describe('escapeHtml', () => {
    it('should escape &', () => expect(service.escapeHtml('a & b')).toBe('a &amp; b'));
    it('should escape <', () => expect(service.escapeHtml('<tag>')).toBe('&lt;tag&gt;'));
    it('should escape "', () => expect(service.escapeHtml('"quote"')).toBe('&quot;quote&quot;'));
    it('should escape \'', () => expect(service.escapeHtml("it's")).toBe('it&#039;s'));
  });
});
