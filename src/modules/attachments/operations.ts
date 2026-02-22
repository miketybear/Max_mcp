/**
 * Attachment Operations
 * Business logic for attachment management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse } from '../../core/types';
import { API_ENDPOINTS } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import { DocumentLink, AttachmentUpload, AttachmentOperationResult } from './types';
import {
  attachmentUploadSchema,
  listAttachmentsSchema,
  attachmentIdentifierSchema,
} from './validators';

const logger = createLogger('AttachmentOperations');

/**
 * Attachment Operations class
 * Provides methods for managing attachments in Maximo
 */
export class AttachmentOperations {
  private client: MaximoClient;

  /**
   * Create a new AttachmentOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('AttachmentOperations initialized');
  }

  /**
   * Upload an attachment to a Maximo record
   * @param data - Attachment upload data
   * @returns API response with document link
   */
  async upload(data: AttachmentUpload): Promise<ApiResponse<DocumentLink>> {
    logger.info('Uploading attachment', {
      ownertable: data.ownertable,
      ownerid: data.ownerid,
      documentname: data.documentname,
    });

    try {
      // Validate input
      const validated = attachmentUploadSchema.parse(data);

      // Make API request to doclinks endpoint
      const response = await this.client.post<DocumentLink>(
        API_ENDPOINTS.ATTACHMENTS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Attachment uploaded successfully', {
          doclinksid: response.data.doclinksid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to upload attachment', { error });
      throw error;
    }
  }

  /**
   * List attachments for a record
   * @param ownertable - Owner table name
   * @param ownerid - Owner record ID
   * @returns API response with array of document links
   */
  async list(ownertable: string, ownerid: string): Promise<ApiResponse<DocumentLink[]>> {
    logger.info('Listing attachments', { ownertable, ownerid });

    try {
      // Validate input
      const validated = listAttachmentsSchema.parse({ ownertable, ownerid });

      // Build query to filter by owner
      const params = {
        'oslc.where': `ownertable="${validated.ownertable}" and ownerid="${validated.ownerid}"`,
        'oslc.select': '*',
      };

      const response = await this.client.get<DocumentLink[]>(
        API_ENDPOINTS.ATTACHMENTS,
        params
      );

      if (response.success) {
        logger.info('Attachments retrieved', {
          count: response.data?.length || 0,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to list attachments', { error });
      throw error;
    }
  }

  /**
   * Download an attachment
   * @param doclinksid - Document link ID
   * @returns API response with file data
   */
  async download(doclinksid: number): Promise<ApiResponse<Blob>> {
    logger.info('Downloading attachment', { doclinksid });

    try {
      // Validate input
      const validated = attachmentIdentifierSchema.parse({ doclinksid });

      // Get document link details first
      const detailsResponse = await this.client.get<DocumentLink>(
        `${API_ENDPOINTS.ATTACHMENTS}/${validated.doclinksid}`
      );

      if (!detailsResponse.success || !detailsResponse.data?.url) {
        throw new Error('Attachment URL not found');
      }

      // Download the actual file
      const response = await this.client.get<Blob>(detailsResponse.data.url, {
        responseType: 'blob',
      } as any);

      if (response.success) {
        logger.info('Attachment downloaded successfully', { doclinksid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to download attachment', { error });
      throw error;
    }
  }

  /**
   * Delete an attachment
   * @param doclinksid - Document link ID
   * @returns API response with deletion confirmation
   */
  async delete(doclinksid: number): Promise<ApiResponse<AttachmentOperationResult>> {
    logger.info('Deleting attachment', { doclinksid });

    try {
      // Validate input
      const validated = attachmentIdentifierSchema.parse({ doclinksid });

      // Make DELETE request
      const response = await this.client.delete<AttachmentOperationResult>(
        `${API_ENDPOINTS.ATTACHMENTS}/${validated.doclinksid}`
      );

      if (response.success) {
        logger.info('Attachment deleted successfully', { doclinksid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete attachment', { error });
      throw error;
    }
  }
}
