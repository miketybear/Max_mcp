/**
 * Validators for Admin Module
 */

import { z } from 'zod';

export const autoscriptCreateSchema = z.object({
  autoscript: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  scriptlanguage: z.enum(['jython', 'javascript', 'nashorn']),
  source: z.string().min(1),
  status: z.string().max(20).optional(),
  active: z.boolean().optional(),
  loglevel: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).optional(),
  autoscriptvars: z.array(z.object({
    varname: z.string().min(1).max(50),
    varbindingtype: z.string().optional(),
    vartype: z.enum(['IN', 'OUT', 'INOUT']).optional(),
    literaldatatype: z.string().optional(),
    varbindingvalue: z.string().optional(),
    maxvarname: z.string().optional(),
  })).optional(),
  scriptlaunchpoint: z.array(z.object({
    launchpointname: z.string().min(1).max(50),
    launchpointtype: z.enum(['OBJECT', 'ATTRIBUTE', 'ACTION', 'CUSTOM']),
    objectname: z.string().optional(),
    attributename: z.string().optional(),
    eventtype: z.string().optional(),
    active: z.boolean().optional(),
    actionname: z.string().optional(),
  })).optional(),
});

export const autoscriptUpdateSchema = z.object({
  source: z.string().optional(),
  description: z.string().max(200).optional(),
  status: z.string().max(20).optional(),
  active: z.boolean().optional(),
  loglevel: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).optional(),
});

export const autoscriptSearchSchema = z.object({
  autoscript: z.string().max(50).optional(),
  scriptlanguage: z.string().optional(),
  active: z.boolean().optional(),
  status: z.string().optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  page: z.number().min(1).optional(),
  select: z.array(z.string()).optional(),
  orderBy: z.string().optional(),
  where: z.string().optional(),
});

export const scriptExecSchema = z.object({
  scriptName: z.string().min(1).max(50),
  params: z.record(z.unknown()).optional(),
});

export const crontaskSchema = z.object({
  crontaskname: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  classname: z.string().optional(),
  active: z.boolean().optional(),
  schedule: z.string().optional(),
  runasuser: z.string().optional(),
  maxhistory: z.number().optional(),
});

export const endpointSchema = z.object({
  endpointname: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  handlerclass: z.string().optional(),
  url: z.string().optional(),
  active: z.boolean().optional(),
});

export const actionSchema = z.object({
  action: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  objectname: z.string().optional(),
  type: z.string().optional(),
  active: z.boolean().optional(),
  value: z.string().optional(),
  parameter: z.string().optional(),
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

export type AutoscriptCreateInput = z.infer<typeof autoscriptCreateSchema>;
export type AutoscriptUpdateInput = z.infer<typeof autoscriptUpdateSchema>;
export type AutoscriptSearchInput = z.infer<typeof autoscriptSearchSchema>;
export type ScriptExecInput = z.infer<typeof scriptExecSchema>;
