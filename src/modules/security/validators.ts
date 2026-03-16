/**
 * Validators for Security Module
 */

import { z } from 'zod';

export const securityGroupCreateSchema = z.object({
  groupname: z.string().min(1).max(30),
  description: z.string().max(100).optional(),
  active: z.boolean().optional(),
  independent: z.boolean().optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  dfltapp: z.string().max(20).optional(),
});

export const securityGroupUpdateSchema = z.object({
  description: z.string().max(100).optional(),
  active: z.boolean().optional(),
  independent: z.boolean().optional(),
  dfltapp: z.string().max(20).optional(),
});

export const securityGroupSearchSchema = z.object({
  groupname: z.string().max(30).optional(),
  active: z.boolean().optional(),
  siteid: z.string().max(8).optional(),
  orgid: z.string().max(8).optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  page: z.number().min(1).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
});

export const userGroupAssignmentSchema = z.object({
  personid: z.string().min(1).max(30),
  groupname: z.string().min(1).max(30),
  siteid: z.string().max(8).optional(),
});

export const groupIdSchema = z.object({
  groupname: z.string().min(1).max(30),
});

export const userGroupsSchema = z.object({
  personid: z.string().min(1).max(30),
});

export type SecurityGroupCreateInput = z.infer<typeof securityGroupCreateSchema>;
export type SecurityGroupUpdateInput = z.infer<typeof securityGroupUpdateSchema>;
export type SecurityGroupSearchInput = z.infer<typeof securityGroupSearchSchema>;
export type UserGroupAssignmentInput = z.infer<typeof userGroupAssignmentSchema>;
