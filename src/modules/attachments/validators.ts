/**
 * Validators for Attachment Module
 * Validation schemas for attachment operations
 */

import { z } from 'zod';

/**
 * Schema for uploading an attachment
 */
export const attachmentUploadSchema = z.object({
  ownertable: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[A-Z_]+$/, 'Owner table must be uppercase letters and underscores'),
  ownerid: z.string().min(1).max(256),
  document: z.string().min(1, 'Document content is required'),
  documentname: z.string().min(1).max(255),
  description: z.string().max(100).optional(),
  doctype: z.string().max(10).optional(),
  contenttype: z.string().max(100).optional(),
});

/**
 * Schema for listing attachments
 */
export const listAttachmentsSchema = z.object({
  ownertable: z.string().min(1).max(30),
  ownerid: z.string().min(1).max(256),
});

/**
 * Schema for downloading/deleting attachment
 */
export const attachmentIdentifierSchema = z.object({
  doclinksid: z.number().int().positive(),
});

/**
 * Type exports
 */
export type AttachmentUploadInput = z.infer<typeof attachmentUploadSchema>;
export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>;
export type AttachmentIdentifierInput = z.infer<typeof attachmentIdentifierSchema>;
