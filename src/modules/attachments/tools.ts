/**
 * MCP Tools for Attachment Module
 * Defines 4 MCP tools for attachment management
 */

import { AttachmentOperations } from './operations';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AttachmentTools');

/**
 * Create MCP tools for attachment operations
 * @param operations - AttachmentOperations instance
 * @returns Array of MCP tool definitions
 */
export function createAttachmentTools(operations: AttachmentOperations) {
  return [
    // Tool 1: Upload Attachment
    {
      name: 'maximo_upload_attachment',
      description:
        'Upload a document attachment to a Maximo record (work order, asset, etc.). ' +
        'Requires owner table, owner ID, document content (base64 encoded), and document name.',
      inputSchema: {
        type: 'object',
        properties: {
          ownertable: {
            type: 'string',
            description: 'Owner table name (WORKORDER, ASSET, SR, LOCATION, etc.) - uppercase',
          },
          ownerid: {
            type: 'string',
            description: 'Owner record ID (wonum, assetnum, ticketid, etc.)',
          },
          document: {
            type: 'string',
            description: 'Document content (base64 encoded)',
          },
          documentname: {
            type: 'string',
            description: 'Document file name with extension',
          },
          description: {
            type: 'string',
            description: 'Document description (optional, max 100 characters)',
          },
          doctype: {
            type: 'string',
            description: 'Document type code (optional, max 10 characters)',
          },
          contenttype: {
            type: 'string',
            description: 'MIME type (optional, e.g., application/pdf, image/jpeg)',
          },
        },
        required: ['ownertable', 'ownerid', 'document', 'documentname'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling upload attachment request', {
            ownertable: args.ownertable,
            ownerid: args.ownerid,
          });

          const result = await operations.upload(args);

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? `Attachment uploaded successfully (ID: ${result.data?.doclinksid})`
              : 'Failed to upload attachment',
            error: result.error,
          };
        } catch (error) {
          logger.error('Upload attachment tool error', { error });
          throw error;
        }
      },
    },

    // Tool 2: List Attachments
    {
      name: 'maximo_list_attachments',
      description:
        'List all attachments for a Maximo record. Returns array of document links with metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          ownertable: {
            type: 'string',
            description: 'Owner table name (WORKORDER, ASSET, SR, LOCATION, etc.)',
          },
          ownerid: {
            type: 'string',
            description: 'Owner record ID',
          },
        },
        required: ['ownertable', 'ownerid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling list attachments request', {
            ownertable: args.ownertable,
            ownerid: args.ownerid,
          });

          const result = await operations.list(args.ownertable, args.ownerid);

          return {
            success: result.success,
            data: result.data,
            count: result.data?.length || 0,
            message: result.success
              ? `Found ${result.data?.length || 0} attachment(s)`
              : 'Failed to list attachments',
            error: result.error,
          };
        } catch (error) {
          logger.error('List attachments tool error', { error });
          throw error;
        }
      },
    },

    // Tool 3: Download Attachment
    {
      name: 'maximo_download_attachment',
      description:
        'Download a document attachment from Maximo by document link ID. Returns file binary data.',
      inputSchema: {
        type: 'object',
        properties: {
          doclinksid: {
            type: 'number',
            description: 'Document link ID (from list attachments)',
          },
        },
        required: ['doclinksid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling download attachment request', {
            doclinksid: args.doclinksid,
          });

          const result = await operations.download(args.doclinksid);

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? 'Attachment downloaded successfully'
              : 'Failed to download attachment',
            error: result.error,
          };
        } catch (error) {
          logger.error('Download attachment tool error', { error });
          throw error;
        }
      },
    },

    // Tool 4: Delete Attachment
    {
      name: 'maximo_delete_attachment',
      description:
        'Delete a document attachment from Maximo by document link ID. This action cannot be undone.',
      inputSchema: {
        type: 'object',
        properties: {
          doclinksid: {
            type: 'number',
            description: 'Document link ID to delete',
          },
        },
        required: ['doclinksid'],
      },
      handler: async (args: any) => {
        try {
          logger.info('Handling delete attachment request', {
            doclinksid: args.doclinksid,
          });

          const result = await operations.delete(args.doclinksid);

          return {
            success: result.success,
            data: result.data,
            message: result.success
              ? 'Attachment deleted successfully'
              : 'Failed to delete attachment',
            error: result.error,
          };
        } catch (error) {
          logger.error('Delete attachment tool error', { error });
          throw error;
        }
      },
    },
  ];
}
