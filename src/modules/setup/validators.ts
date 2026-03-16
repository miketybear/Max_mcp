/**
 * Validators for Setup Module
 */

import { z } from 'zod';

export const domainCreateSchema = z.object({
  domainid: z.string().min(1).max(18),
  description: z.string().max(100).optional(),
  domaintype: z.enum(['ALN', 'TABLE', 'SYNONYM', 'NUMERIC', 'CROSSOVER']).optional(),
  maxtype: z.string().optional(),
  length: z.number().optional(),
});

export const domainSearchSchema = z.object({
  domainid: z.string().max(18).optional(),
  domaintype: z.string().optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  select: z.string().optional(),
});

export const alnDomainValueSchema = z.object({
  domainid: z.string().min(1).max(18),
  value: z.string().min(1).max(254),
  description: z.string().max(100).optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  ordernum: z.number().optional(),
});

export const tableDomainValueSchema = z.object({
  domainid: z.string().min(1).max(18),
  objectname: z.string().optional(),
  validationwhereclause: z.string().optional(),
  listwhereclause: z.string().optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
});

export const synonymDomainValueSchema = z.object({
  domainid: z.string().min(1).max(18),
  maxvalue: z.string().min(1).max(50),
  value: z.string().min(1).max(50),
  description: z.string().max(100).optional(),
  defaults: z.boolean().optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
});

export const docTypeSchema = z.object({
  doctype: z.string().min(1).max(16),
  description: z.string().max(100).optional(),
  app: z.string().max(10).optional(),
});

export const resourceIdSchema = z.object({
  id: z.string().min(1),
});

export const resourceSearchSchema = z.object({
  pageSize: z.number().min(1).max(1000).optional(),
  where: z.string().optional(),
  select: z.string().optional(),
  orderBy: z.string().optional(),
});

export type DomainCreateInput = z.infer<typeof domainCreateSchema>;
export type DomainSearchInput = z.infer<typeof domainSearchSchema>;
export type AlnDomainValueInput = z.infer<typeof alnDomainValueSchema>;
export type TableDomainValueInput = z.infer<typeof tableDomainValueSchema>;
export type SynonymDomainValueInput = z.infer<typeof synonymDomainValueSchema>;
