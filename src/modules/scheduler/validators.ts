/**
 * Validation schemas for Scheduler Module
 * Uses Zod for runtime validation of scheduler query parameters
 */

import { z } from 'zod';

/**
 * ISO 8601 date string schema
 */
const isoDateSchema = z.string().refine(
  (date) => {
    try {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    } catch {
      return false;
    }
  },
  { message: 'Invalid ISO 8601 date format' }
);

/**
 * Work schedule query schema
 */
export const workScheduleQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  personid: z.string().max(30).optional(),
  craft: z.string().max(8).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

/**
 * Unscheduled work query schema
 */
export const unscheduledWorkQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  pageSize: z.number().int().min(1).max(1000).optional(),
});

/**
 * Labor availability query schema
 */
export const laborAvailabilityQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  date: isoDateSchema.optional(),
  craft: z.string().max(8).optional(),
  pageSize: z.number().int().min(1).max(1000).optional(),
});

/**
 * Work backlog query schema
 */
export const workBacklogQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
});

/**
 * Schedule conflicts query schema
 */
export const scheduleConflictsQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

/**
 * Upcoming PMs query schema
 */
export const upcomingPMsQuerySchema = z.object({
  siteid: z.string().min(1, 'Site ID is required').max(8),
  days: z.number().int().min(1).max(365).optional(),
});

/**
 * Zod inferred types for each schema
 */
export type WorkScheduleQueryInput = z.infer<typeof workScheduleQuerySchema>;
export type UnscheduledWorkQueryInput = z.infer<typeof unscheduledWorkQuerySchema>;
export type LaborAvailabilityQueryInput = z.infer<typeof laborAvailabilityQuerySchema>;
export type WorkBacklogQueryInput = z.infer<typeof workBacklogQuerySchema>;
export type ScheduleConflictsQueryInput = z.infer<typeof scheduleConflictsQuerySchema>;
export type UpcomingPMsQueryInput = z.infer<typeof upcomingPMsQuerySchema>;
