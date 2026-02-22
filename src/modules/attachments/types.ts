/**
 * Type definitions for Attachment Module
 * Defines interfaces and types for attachment management in Maximo
 */

/**
 * Document link interface
 */
export interface DocumentLink {
  /** Document link ID */
  doclinksid: number;

  /** Owner table (WORKORDER, ASSET, etc.) */
  ownertable: string;

  /** Owner record ID */
  ownerid: string;

  /** Document name */
  document: string;

  /** Document description */
  description?: string;

  /** Document type */
  doctype?: string;

  /** File size in bytes */
  filesize?: number;

  /** MIME type */
  contenttype?: string;

  /** Creation date (ISO 8601 format) */
  createdate?: string;

  /** Created by */
  createby?: string;

  /** URL to download */
  url?: string;
}

/**
 * Attachment upload data
 */
export interface AttachmentUpload {
  /** Owner table (required) */
  ownertable: string;

  /** Owner record ID (required) */
  ownerid: string;

  /** File content (base64 encoded or binary) */
  document: string;

  /** Document name (required) */
  documentname: string;

  /** Document description (optional) */
  description?: string;

  /** Document type (optional) */
  doctype?: string;

  /** MIME type (optional) */
  contenttype?: string;
}

/**
 * Attachment operation result
 */
export interface AttachmentOperationResult {
  /** Success flag */
  success: boolean;

  /** Document link ID */
  doclinksid?: number;

  /** Error message (if failed) */
  error?: string;

  /** Status code */
  statusCode?: number;
}
