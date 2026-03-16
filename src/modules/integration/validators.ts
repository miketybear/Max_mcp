/**
 * Validators for Integration/Dev Utilities Module
 */

import { z } from 'zod';

export const maxObjectSearchSchema = z.object({
  objectname: z.string().max(30).optional(),
  module: z.string().max(20).optional(),
  persistent: z.boolean().optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  select: z.string().optional(),
});

export const maxVarSearchSchema = z.object({
  varname: z.string().max(50).optional(),
  vartype: z.string().optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
  select: z.string().optional(),
});

export const maxVarUpdateSchema = z.object({
  varvalue: z.string().optional(),
  description: z.string().max(200).optional(),
});

export const measureUnitSchema = z.object({
  measureunitid: z.string().min(1).max(16),
  description: z.string().max(100).optional(),
  abbreviation: z.string().max(10).optional(),
});

export const resourceSearchSchema = z.object({
  pageSize: z.number().min(1).max(1000).optional(),
  where: z.string().optional(),
  select: z.string().optional(),
  orderBy: z.string().optional(),
});

export type MaxObjectSearchInput = z.infer<typeof maxObjectSearchSchema>;
export type MaxVarSearchInput = z.infer<typeof maxVarSearchSchema>;
export type MaxVarUpdateInput = z.infer<typeof maxVarUpdateSchema>;
export type MeasureUnitInput = z.infer<typeof measureUnitSchema>;
