/**
 * Unit tests for AttachmentOperations
 * Tests all 4 operation methods for attachment management
 */

import { AttachmentOperations } from '../../../../src/modules/attachments/operations';
import { MaximoClient } from '../../../../src/core/maximo-client';
import { API_ENDPOINTS } from '../../../../src/config/constants';

// Mock logger
jest.mock('../../../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

describe('AttachmentOperations', () => {
  let operations: AttachmentOperations;
  let mockClient: jest.Mocked<MaximoClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as any;

    operations = new AttachmentOperations(mockClient);
  });

  describe('upload', () => {
    it('should upload attachment successfully', async () => {
      const input = {
        ownertable: 'WORKORDER',
        ownerid: 'WO001',
        document: 'base64encodedcontent',
        documentname: 'test.pdf',
      };

      const mockResponse = {
        success: true,
        data: {
          doclinksid: 123,
          ownertable: 'WORKORDER',
          ownerid: 'WO001',
          document: 'test.pdf',
        },
        statusCode: 201,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await operations.upload(input);

      expect(mockClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.ATTACHMENTS,
        expect.objectContaining(input)
      );
      expect(result.success).toBe(true);
      expect(result.data?.doclinksid).toBe(123);
    });

    it('should validate input data', async () => {
      const invalidInput = {
        ownertable: '', // Invalid: empty
        ownerid: 'WO001',
        document: 'content',
        documentname: 'test.pdf',
      };

      await expect(operations.upload(invalidInput as any)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      const input = {
        ownertable: 'WORKORDER',
        ownerid: 'WO001',
        document: 'content',
        documentname: 'test.pdf',
      };

      mockClient.post.mockRejectedValue(new Error('Upload failed'));

      await expect(operations.upload(input)).rejects.toThrow('Upload failed');
    });
  });

  describe('list', () => {
    it('should list attachments successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            doclinksid: 123,
            ownertable: 'WORKORDER',
            ownerid: 'WO001',
            document: 'test.pdf',
          },
          {
            doclinksid: 124,
            ownertable: 'WORKORDER',
            ownerid: 'WO001',
            document: 'test2.pdf',
          },
        ],
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await operations.list('WORKORDER', 'WO001');

      expect(mockClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ATTACHMENTS,
        expect.objectContaining({
          'oslc.where': 'ownertable="WORKORDER" and ownerid="WO001"',
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should validate input parameters', async () => {
      await expect(operations.list('', 'WO001')).rejects.toThrow();
    });
  });

  describe('download', () => {
    it('should download attachment successfully', async () => {
      const mockDetailsResponse = {
        success: true,
        data: {
          doclinksid: 123,
          url: '/maximo/api/attachments/123/download',
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      const mockDownloadResponse = {
        success: true,
        data: new Blob(['file content']),
        statusCode: 200,
        headers: {},
        requestId: 'test-124',
      };

      mockClient.get
        .mockResolvedValueOnce(mockDetailsResponse)
        .mockResolvedValueOnce(mockDownloadResponse);

      const result = await operations.download(123);

      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    it('should handle missing URL', async () => {
      const mockResponse = {
        success: true,
        data: {
          doclinksid: 123,
          // url is missing
        },
        statusCode: 200,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.get.mockResolvedValue(mockResponse);

      await expect(operations.download(123)).rejects.toThrow('Attachment URL not found');
    });
  });

  describe('delete', () => {
    it('should delete attachment successfully', async () => {
      const mockResponse = {
        success: true,
        data: { success: true },
        statusCode: 204,
        headers: {},
        requestId: 'test-123',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await operations.delete(123);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `${API_ENDPOINTS.ATTACHMENTS}/123`
      );
      expect(result.success).toBe(true);
    });

    it('should validate doclinksid', async () => {
      await expect(operations.delete(-1)).rejects.toThrow();
    });
  });
});
