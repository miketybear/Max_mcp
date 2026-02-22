/**
 * Inventory Module
 * Main entry point for inventory and material management functionality
 */

// Export all types
export type {
  InventoryItem,
  Inventory,
  ItemCreate,
  InventorySearch,
  IssueTransaction,
  ReturnTransaction,
  TransferTransaction,
  AdjustmentTransaction,
  InventoryTransaction,
  InventoryListResponse,
  ItemListResponse,
  TransactionListResponse,
  ItemOperationResult,
  InventoryOperationResult,
  TransactionOperationResult,
  UpdateReorderPoint,
  GetStockLevels,
  GetItemsBelowReorder,
  StockLevel,
  StockLevelsResponse,
  ItemsBelowReorderResponse,
  ItemType,
  ItemStatus,
  LotType,
  TransactionType,
} from './types';

// Export operations class
export { InventoryOperations } from './operations';

// Export tool creation function
export { createInventoryTools } from './tools';

// Export validators
export {
  itemCreateSchema,
  inventorySearchSchema,
  issueTransactionSchema,
  returnTransactionSchema,
  transferTransactionSchema,
  adjustmentTransactionSchema,
  getInventorySchema,
  getTransactionsSchema,
  updateReorderPointSchema,
  getStockLevelsSchema,
  getItemsBelowReorderSchema,
  itemTypeSchema,
  itemStatusSchema,
  lotTypeSchema,
  transactionTypeSchema,
  validateItemNum,
  validateQuantity,
  validateStoreroom,
  validateTransactionType,
  validateItemType,
  validateItemStatus,
  validateCost,
  validateISODate,
  validateDates,
  validateLotNum,
  validateBinNum,
  validateGLAccount,
  validatePhysicalCount,
  validateConversion,
  validateRotatingConfig,
  validateIssueRequirements,
  validateTransferLocations,
} from './validators';

// Export validator input types
export type {
  ItemCreateInput,
  InventorySearchInput,
  IssueTransactionInput,
  ReturnTransactionInput,
  TransferTransactionInput,
  AdjustmentTransactionInput,
  GetInventoryInput,
  GetTransactionsInput,
  UpdateReorderPointInput,
  GetStockLevelsInput,
  GetItemsBelowReorderInput,
} from './validators';