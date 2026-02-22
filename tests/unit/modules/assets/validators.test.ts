/**
 * Unit tests for Asset Validators
 */

import {
  assetStatusSchema,
  assetTypeSchema,
  assetNumSchema,
  assetCreateSchema,
  assetUpdateSchema,
  assetSearchSchema,
  assetMoveSchema,
  meterReadingSchema,
  assetSpecSchema,
  isoDateSchema,
  prioritySchema,
  validateAssetStatus,
  validateAssetNum,
  validatePriority,
  validateDates,
  validateISODate,
  validateAssetHierarchy,
  validateMeterReading,
  validateCost,
} from '../../../../src/modules/assets/validators';

describe('Asset Validators', () => {
  describe('assetStatusSchema', () => {
    it('should accept valid asset statuses', () => {
      const validStatuses = ['OPERATING', 'NOT READY', 'DECOMMISSIONED', 'MISSING', 'SEALED'];
      validStatuses.forEach(status => {
        expect(() => assetStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid statuses', () => {
      expect(() => assetStatusSchema.parse('INVALID')).toThrow();
      expect(() => assetStatusSchema.parse('')).toThrow();
    });
  });

  describe('assetTypeSchema', () => {
    it('should accept valid asset types', () => {
      const validTypes = ['IT', 'PRODUCTION', 'FACILITIES', 'TRANSPORTATION', 'INFRASTRUCTURE'];
      validTypes.forEach(type => {
        expect(() => assetTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid types', () => {
      expect(() => assetTypeSchema.parse('INVALID')).toThrow();
    });
  });

  describe('validateAssetStatus', () => {
    it('should return true for valid statuses', () => {
      expect(validateAssetStatus('OPERATING')).toBe(true);
      expect(validateAssetStatus('NOT READY')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(validateAssetStatus('INVALID')).toBe(false);
    });
  });

  describe('validateAssetNum', () => {
    it('should return true for valid asset numbers', () => {
      expect(validateAssetNum('ASSET001')).toBe(true);
    });

    it('should return false for empty asset number', () => {
      expect(validateAssetNum('')).toBe(false);
    });

    it('should return false for too long asset number', () => {
      expect(validateAssetNum('a'.repeat(13))).toBe(false);
    });
  });

  describe('validatePriority', () => {
    it('should return true for valid priorities', () => {
      expect(validatePriority(1)).toBe(true);
      expect(validatePriority(5)).toBe(true);
    });

    it('should return false for invalid priorities', () => {
      expect(validatePriority(0)).toBe(false);
      expect(validatePriority(6)).toBe(false);
      expect(validatePriority(2.5)).toBe(false);
    });
  });

  describe('validateDates', () => {
    it('should return true for valid date ranges', () => {
      expect(validateDates('2024-01-01', '2024-01-31')).toBe(true);
    });

    it('should return false for invalid date ranges', () => {
      expect(validateDates('2024-01-31', '2024-01-01')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(validateDates('not-a-date', '2024-01-01')).toBe(false);
    });
  });

  describe('validateISODate', () => {
    it('should return true for valid ISO dates', () => {
      expect(validateISODate('2024-01-15T10:00:00Z')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(validateISODate('not-a-date')).toBe(false);
    });
  });

  describe('validateAssetHierarchy', () => {
    it('should return true when asset is not its own parent', () => {
      expect(validateAssetHierarchy('ASSET001', 'ASSET002')).toBe(true);
    });

    it('should return false when asset is its own parent', () => {
      expect(validateAssetHierarchy('ASSET001', 'ASSET001')).toBe(false);
    });

    it('should return true when no parent specified', () => {
      expect(validateAssetHierarchy('ASSET001')).toBe(true);
    });
  });

  describe('validateMeterReading', () => {
    it('should return true for valid readings', () => {
      expect(validateMeterReading(100)).toBe(true);
    });

    it('should return false for negative readings', () => {
      expect(validateMeterReading(-1)).toBe(false);
    });

    it('should return false for rollover with high reading', () => {
      expect(validateMeterReading(1000001, true)).toBe(false);
    });
  });

  describe('validateCost', () => {
    it('should return true for valid costs', () => {
      expect(validateCost(100)).toBe(true);
      expect(validateCost(0)).toBe(true);
    });

    it('should return false for negative costs', () => {
      expect(validateCost(-1)).toBe(false);
    });

    it('should return false for infinite costs', () => {
      expect(validateCost(Infinity)).toBe(false);
    });
  });
});
