/**
 * Unit tests for Attachment MCP Tools
 * Tests all 4 MCP tool definitions
 */

import { createAttachmentTools } from '../../../../src/modules/attachments/tools';
import { AttachmentOperations } from '../../../../src/modules/attachments/operations';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('Attachment Tools', () => {
  let mockOperations: jest.Mocked<AttachmentOperations>;
  let tools: any[];

  beforeEach(() => {
    mockOperations = {
      upload: jest.fn(),
      list: jest.fn(),
      download: jest.fn(),
      delete: jest.fn(),
    } as any;

    tools = createAttachmentTools(mockOperations);
  });

  it('should create 4 tools', () => {
    expect(tools).toHaveLength(4);
  });

  describe('maximo_upload_attachment', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_upload_attachment');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_upload_attachment');
      expect(tool.description).toContain('Upload');
      expect(tool.inputSchema.required).toContain('ownertable');
      expect(tool.inputSchema.required).toContain('ownerid');
    });

    it('should call upload operation', async () => {
      const mockResponse = {
        success: true,
        data: { doclinksid: 123 },
      };

      mockOperations.upload.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        ownertable: 'WORKORDER',
        ownerid: 'WO001',
        document: 'content',
        documentname: 'test.pdf',
      });

      expect(mockOperations.upload).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_list_attachments', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_list_attachments');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_list_attachments');
      expect(tool.description).toContain('List');
    });

    it('should call list operation', async () => {
      const mockResponse = {
        success: true,
        data: [{ doclinksid: 123 }, { doclinksid: 124 }],
      };

      mockOperations.list.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({
        ownertable: 'WORKORDER',
        ownerid: 'WO001',
      });

      expect(mockOperations.list).toHaveBeenCalledWith('WORKORDER', 'WO001');
      expect(result.count).toBe(2);
    });
  });

  describe('maximo_download_attachment', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_download_attachment');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_download_attachment');
      expect(tool.description).toContain('Download');
    });

    it('should call download operation', async () => {
      const mockResponse = {
        success: true,
        data: new Blob(['content']),
      };

      mockOperations.download.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ doclinksid: 123 });

      expect(mockOperations.download).toHaveBeenCalledWith(123);
      expect(result.success).toBe(true);
    });
  });

  describe('maximo_delete_attachment', () => {
    let tool: any;

    beforeEach(() => {
      tool = tools.find((t) => t.name === 'maximo_delete_attachment');
    });

    it('should have correct metadata', () => {
      expect(tool.name).toBe('maximo_delete_attachment');
      expect(tool.description).toContain('Delete');
    });

    it('should call delete operation', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
      };

      mockOperations.delete.mockResolvedValue(mockResponse as any);

      const result = await tool.handler({ doclinksid: 123 });

      expect(mockOperations.delete).toHaveBeenCalledWith(123);
      expect(result.success).toBe(true);
    });
  });
});
