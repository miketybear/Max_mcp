/**
 * Asset Operations
 * Business logic for asset management in Maximo
 */

import { MaximoClient } from '../../core/maximo-client';
import { ApiResponse, OSLCQueryParams } from '../../core/types';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '../../config/constants';
import { createLogger } from '../../utils/logger';
import {
  Asset,
  AssetCreate,
  AssetUpdate,
  AssetSearch,
  AssetMove,
  MeterReading,
  AssetSpecification,
  AssetHierarchy,
  AssetListResponse,
  MeterHistoryEntry,
  MeterHistoryResponse,
  DowntimeEntry,
  DowntimeHistoryResponse,
} from './types';
import {
  assetCreateSchema,
  assetUpdateSchema,
  assetSearchSchema,
  assetMoveSchema,
  meterReadingSchema,
  assetSpecSchema,
  validateAssetHierarchy,
  meterHistorySchema,
  assetStatusChangeSchema,
  downtimeHistorySchema,
} from './validators';
import { ValidationError } from '../../core/types';

const logger = createLogger('AssetOperations');

/**
 * Asset Operations class
 * Provides methods for managing assets in Maximo
 */
export class AssetOperations {
  private client: MaximoClient;

  /**
   * Create a new AssetOperations instance
   * @param client - MaximoClient instance for HTTP communication
   */
  constructor(client: MaximoClient) {
    this.client = client;
    logger.info('AssetOperations initialized');
  }

  /**
   * Create a new asset
   * @param data - Asset creation data
   * @returns API response with created asset
   */
  async create(data: AssetCreate): Promise<ApiResponse<Asset>> {
    logger.info('Creating asset', { assetnum: data.assetnum, siteid: data.siteid });

    try {
      // Validate input
      const validated = assetCreateSchema.parse(data);

      // Validate hierarchy if parent is specified
      if (validated.parent) {
        if (!validateAssetHierarchy(validated.assetnum, validated.parent)) {
          throw new ValidationError('Invalid asset hierarchy: asset cannot be its own parent');
        }
      }

      // Make API request
      const response = await this.client.post<Asset>(
        API_ENDPOINTS.ASSETS,
        validated
      );

      if (response.success && response.data) {
        logger.info('Asset created successfully', {
          assetnum: response.data.assetnum,
          siteid: response.data.siteid,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to create asset', { error });
      throw error;
    }
  }

  /**
   * Get asset by number
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @returns API response with asset data
   */
  async get(assetnum: string, siteid: string): Promise<ApiResponse<Asset>> {
    logger.info('Retrieving asset', { assetnum, siteid });

    try {
      // Build query parameters
      const params: OSLCQueryParams = {
        'oslc.where': `assetnum="${assetnum}" and siteid="${siteid}"`,
        'oslc.pageSize': 1,
      };

      // Make API request
      const response = await this.client.get<{ member: Asset[] }>(
        API_ENDPOINTS.ASSETS,
        params
      );

      if (response.success && response.data?.member && response.data.member.length > 0) {
        logger.info('Asset retrieved successfully', { assetnum, siteid });
        return {
          ...response,
          data: response.data.member[0],
        };
      }

      // Asset not found
      return {
        success: false,
        error: `Asset ${assetnum} not found in site ${siteid}`,
        errorCode: 'NOT_FOUND',
        statusCode: 404,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve asset', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Update asset
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param data - Update data
   * @returns API response with updated asset
   */
  async update(
    assetnum: string,
    siteid: string,
    data: AssetUpdate
  ): Promise<ApiResponse<Asset>> {
    logger.info('Updating asset', { assetnum, siteid });

    try {
      // Validate input
      const validated = assetUpdateSchema.parse(data);

      // First, get the asset to get its href
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Make API request to update
      const response = await this.client.patch<Asset>(asset.href, validated);

      if (response.success) {
        logger.info('Asset updated successfully', { assetnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update asset', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Delete asset
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @returns API response
   */
  async delete(assetnum: string, siteid: string): Promise<ApiResponse<void>> {
    logger.info('Deleting asset', { assetnum, siteid });

    try {
      // First, get the asset to get its href
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse as ApiResponse<void>;
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Make API request to delete
      const response = await this.client.delete<void>(asset.href);

      if (response.success) {
        logger.info('Asset deleted successfully', { assetnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to delete asset', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Move asset to a new location
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param moveData - Move data including new location
   * @returns API response with updated asset
   */
  async move(
    assetnum: string,
    siteid: string,
    moveData: AssetMove
  ): Promise<ApiResponse<Asset>> {
    logger.info('Moving asset', { assetnum, siteid, newLocation: moveData.newLocation });

    try {
      // Validate input
      const validated = assetMoveSchema.parse({ assetnum, siteid, ...moveData });

      // Get current asset
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Prepare update data
      const updateData: AssetUpdate = {
        location: validated.newLocation,
      };

      // Add optional fields if provided
      if (validated.newBinnum) {
        updateData.binnum = validated.newBinnum;
      }
      if (validated.newLotnum) {
        updateData.lotnum = validated.newLotnum;
      }

      // Make API request to update location
      const response = await this.client.patch<Asset>(asset.href, updateData);

      if (response.success) {
        logger.info('Asset moved successfully', {
          assetnum,
          siteid,
          oldLocation: asset.location,
          newLocation: validated.newLocation,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to move asset', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Record a meter reading for an asset
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param reading - Meter reading data
   * @returns API response
   */
  async recordMeter(
    assetnum: string,
    siteid: string,
    reading: MeterReading
  ): Promise<ApiResponse<any>> {
    logger.info('Recording meter reading', { assetnum, siteid, metername: reading.metername });

    try {
      // Validate input
      const validated = meterReadingSchema.parse({ assetnum, siteid, ...reading });

      // Get asset to verify it exists
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Build meter reading endpoint (child collection)
      const meterEndpoint = `${asset.href}/ASSETMETER`;

      // Prepare meter reading data
      const meterData = {
        metername: validated.metername,
        newreading: validated.reading,
        newreadingdate: validated.readingdate,
        inspector: validated.inspector,
        remarks: validated.remarks,
        rollover: validated.rollover,
      };

      // Make API request
      const response = await this.client.post<any>(meterEndpoint, meterData);

      if (response.success) {
        logger.info('Meter reading recorded successfully', { assetnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to record meter reading', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Get asset hierarchy (parent and children)
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @returns API response with asset hierarchy
   */
  async getHierarchy(assetnum: string, siteid: string): Promise<ApiResponse<AssetHierarchy>> {
    logger.info('Retrieving asset hierarchy', { assetnum, siteid });

    try {
      // Get the current asset
      const assetResponse = await this.get(assetnum, siteid);
      if (!assetResponse.success || !assetResponse.data) {
        return {
          success: false,
          error: assetResponse.error,
          errorCode: assetResponse.errorCode,
          statusCode: assetResponse.statusCode,
          headers: assetResponse.headers,
          requestId: assetResponse.requestId,
        };
      }

      const asset = assetResponse.data;
      let parent: Asset | undefined;
      const children: Asset[] = [];
      let level = 0;
      const path: string[] = [assetnum];

      // Get parent if exists
      if (asset.parent) {
        const parentResponse = await this.get(asset.parent, siteid);
        if (parentResponse.success && parentResponse.data) {
          parent = parentResponse.data;
          level = 1;
          path.unshift(asset.parent);
        }
      }

      // Get children
      const childrenParams: OSLCQueryParams = {
        'oslc.where': `parent="${assetnum}" and siteid="${siteid}"`,
        'oslc.pageSize': 100,
      };

      const childrenResponse = await this.client.get<{ member: Asset[] }>(
        API_ENDPOINTS.ASSETS,
        childrenParams
      );

      if (childrenResponse.success && childrenResponse.data?.member) {
        children.push(...childrenResponse.data.member);
      }

      const hierarchy: AssetHierarchy = {
        asset,
        parent,
        children,
        level,
        path,
      };

      logger.info('Asset hierarchy retrieved successfully', {
        assetnum,
        siteid,
        hasParent: !!parent,
        childrenCount: children.length,
      });

      return {
        success: true,
        data: hierarchy,
        statusCode: 200,
        headers: assetResponse.headers,
        requestId: assetResponse.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve asset hierarchy', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Update asset specification
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param spec - Asset specification data
   * @returns API response
   */
  async updateSpecification(
    assetnum: string,
    siteid: string,
    spec: AssetSpecification
  ): Promise<ApiResponse<any>> {
    logger.info('Updating asset specification', {
      assetnum,
      siteid,
      assetattrid: spec.assetattrid,
    });

    try {
      // Validate input
      const validated = assetSpecSchema.parse({ assetnum, siteid, ...spec });

      // Get asset to verify it exists
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Build specification endpoint (child collection)
      const specEndpoint = `${asset.href}/ASSETSPEC`;

      // Prepare specification data
      const specData = {
        assetattrid: validated.assetattrid,
        alnvalue: validated.alnvalue,
        numvalue: validated.numvalue,
        tablevalue: validated.tablevalue,
        section: validated.section,
        measureunitid: validated.measureunitid,
      };

      // Make API request
      const response = await this.client.post<any>(specEndpoint, specData);

      if (response.success) {
        logger.info('Asset specification updated successfully', { assetnum, siteid });
      }

      return response;
    } catch (error) {
      logger.error('Failed to update asset specification', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Search assets with OSLC filters
   * @param criteria - Search criteria
   * @returns API response with list of assets
   */
  async search(criteria: AssetSearch): Promise<ApiResponse<AssetListResponse>> {
    logger.info('Searching assets', { criteria });

    try {
      // Validate input
      const validated = assetSearchSchema.parse(criteria);

      // Build OSLC query parameters
      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      // Build where clause
      const whereClauses: string[] = [];

      if (validated.status) {
        if (Array.isArray(validated.status)) {
          const statusList = validated.status.map((s) => `"${s}"`).join(',');
          whereClauses.push(`status in [${statusList}]`);
        } else {
          whereClauses.push(`status="${validated.status}"`);
        }
      }

      if (validated.assettype) {
        if (Array.isArray(validated.assettype)) {
          const typeList = validated.assettype.map((t) => `"${t}"`).join(',');
          whereClauses.push(`assettype in [${typeList}]`);
        } else {
          whereClauses.push(`assettype="${validated.assettype}"`);
        }
      }

      if (validated.location) {
        whereClauses.push(`location="${validated.location}"`);
      }

      if (validated.parent) {
        whereClauses.push(`parent="${validated.parent}"`);
      }

      if (validated.manufacturer) {
        whereClauses.push(`manufacturer="${validated.manufacturer}"`);
      }

      if (validated.serialnum) {
        whereClauses.push(`serialnum="${validated.serialnum}"`);
      }

      if (validated.siteid) {
        whereClauses.push(`siteid="${validated.siteid}"`);
      }

      if (validated.orgid) {
        whereClauses.push(`orgid="${validated.orgid}"`);
      }

      if (validated.priority !== undefined) {
        whereClauses.push(`priority=${validated.priority}`);
      }

      if (validated.failurecode) {
        whereClauses.push(`failurecode="${validated.failurecode}"`);
      }

      if (validated.isrunning !== undefined) {
        whereClauses.push(`isrunning=${validated.isrunning}`);
      }

      if (validated.dateRange) {
        const field = validated.dateRange.field || 'statusdate';
        whereClauses.push(
          `${field}>="${validated.dateRange.start}" and ${field}<="${validated.dateRange.end}"`
        );
      }

      // Add custom where clause if provided
      if (validated.where) {
        whereClauses.push(validated.where);
      }

      // Combine where clauses
      if (whereClauses.length > 0) {
        params['oslc.where'] = whereClauses.join(' and ');
      }

      // Add select fields if specified
      if (validated.select && validated.select.length > 0) {
        params['oslc.select'] = validated.select.join(',');
      }

      // Add order by if specified
      if (validated.orderBy) {
        params['oslc.orderBy'] = validated.orderBy;
      }

      // Add search terms if specified
      if (validated.searchTerms) {
        params['oslc.searchTerms'] = validated.searchTerms;
      }

      // Make API request
      const response = await this.client.get<{ member: Asset[]; responseInfo?: any }>(
        API_ENDPOINTS.ASSETS,
        params
      );

      if (response.success && response.data) {
        const assets = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || assets.length;
        const pageSize = validated.pageSize || DEFAULT_PAGE_SIZE;
        const page = validated.page || 1;
        const totalPages = Math.ceil(totalCount / pageSize);

        const listResponse: AssetListResponse = {
          assets,
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        };

        logger.info('Asset search completed', {
          count: assets.length,
          totalCount,
          page,
        });

        return {
          ...response,
          data: listResponse,
        };
      }

      return {
        success: false,
        error: response.error,
        errorCode: response.errorCode,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to search assets', { error });
      throw error;
    }
  }

  /**
   * Get meter reading history for an asset
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param metername - Optional meter name filter
   * @param pageSize - Optional page size
   * @param orderBy - Optional sort order
   * @returns API response with meter reading history
   */
  async getMeterHistory(
    assetnum: string,
    siteid: string,
    metername?: string,
    pageSize?: number,
    orderBy?: string
  ): Promise<ApiResponse<MeterHistoryResponse>> {
    logger.info('Retrieving meter history', { assetnum, siteid, metername });

    try {
      // Validate input
      const validated = meterHistorySchema.parse({
        assetnum,
        siteid,
        metername,
        pageSize,
        orderBy,
      });

      // Get asset to verify it exists
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return {
          success: false,
          error: getResponse.error,
          errorCode: getResponse.errorCode,
          statusCode: getResponse.statusCode,
          headers: getResponse.headers,
          requestId: getResponse.requestId,
        };
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Build query for asset meter readings via child collection
      const meterEndpoint = `${asset.href}/ASSETMETER`;
      const params: OSLCQueryParams = {
        'oslc.pageSize': validated.pageSize || DEFAULT_PAGE_SIZE,
      };

      // Add meter name filter if provided
      if (validated.metername) {
        params['oslc.where'] = `metername="${validated.metername}"`;
      }

      // Add order by if specified (default to reading date descending)
      params['oslc.orderBy'] = validated.orderBy || '-readingdate';

      // Make API request
      const response = await this.client.get<{ member: MeterHistoryEntry[]; responseInfo?: any }>(
        meterEndpoint,
        params
      );

      if (response.success && response.data) {
        const readings = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || readings.length;
        const effectivePageSize = validated.pageSize || DEFAULT_PAGE_SIZE;

        const historyResponse: MeterHistoryResponse = {
          readings,
          totalCount,
          pageSize: effectivePageSize,
        };

        logger.info('Meter history retrieved successfully', {
          assetnum,
          siteid,
          readingsCount: readings.length,
          totalCount,
        });

        return {
          ...response,
          data: historyResponse,
        };
      }

      return {
        success: false,
        error: response.error,
        errorCode: response.errorCode,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve meter history', { assetnum, siteid, error });
      throw error;
    }
  }

  /**
   * Change asset status
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param newStatus - New status value
   * @param memo - Optional reason for status change
   * @returns API response with updated asset
   */
  async changeStatus(
    assetnum: string,
    siteid: string,
    newStatus: string,
    memo?: string
  ): Promise<ApiResponse<Asset>> {
    logger.info('Changing asset status', { assetnum, siteid, newStatus });

    try {
      // Validate input
      const validated = assetStatusChangeSchema.parse({
        assetnum,
        siteid,
        status: newStatus,
        memo,
      });

      // Get current asset to check it exists and get href
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return getResponse;
      }

      const asset = getResponse.data;
      const currentStatus = asset.status;

      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Prepare update data with status change
      const updateData: AssetUpdate = {
        status: validated.status,
      };

      // Log memo if provided (Maximo may handle memo via status change action)
      if (validated.memo) {
        logger.debug('Status change memo provided', { memo: validated.memo });
      }

      // Make API request to update status
      const response = await this.client.patch<Asset>(asset.href, updateData);

      if (response.success) {
        logger.info('Asset status changed successfully', {
          assetnum,
          siteid,
          oldStatus: currentStatus,
          newStatus: validated.status,
        });
      }

      return response;
    } catch (error) {
      logger.error('Failed to change asset status', { assetnum, siteid, newStatus, error });
      throw error;
    }
  }

  /**
   * Get downtime history for an asset
   * @param assetnum - Asset number
   * @param siteid - Site identifier
   * @param startDate - Optional start date filter (ISO 8601)
   * @param endDate - Optional end date filter (ISO 8601)
   * @returns API response with downtime history
   */
  async getDowntimeHistory(
    assetnum: string,
    siteid: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<DowntimeHistoryResponse>> {
    logger.info('Retrieving downtime history', { assetnum, siteid, startDate, endDate });

    try {
      // Validate input
      const validated = downtimeHistorySchema.parse({
        assetnum,
        siteid,
        startDate,
        endDate,
      });

      // Get asset to verify it exists and retrieve downtime data
      const getResponse = await this.get(assetnum, siteid);
      if (!getResponse.success || !getResponse.data) {
        return {
          success: false,
          error: getResponse.error,
          errorCode: getResponse.errorCode,
          statusCode: getResponse.statusCode,
          headers: getResponse.headers,
          requestId: getResponse.requestId,
        };
      }

      const asset = getResponse.data;
      if (!asset.href) {
        throw new ValidationError('Asset href not found');
      }

      // Query asset downtime records via child collection
      const downtimeEndpoint = `${asset.href}/ASSETDOWNTIMEHIST`;
      const params: OSLCQueryParams = {
        'oslc.pageSize': DEFAULT_PAGE_SIZE,
        'oslc.orderBy': '-startdate',
      };

      // Build where clause for date filtering
      const whereClauses: string[] = [];

      if (validated.startDate) {
        whereClauses.push(`startdate>="${validated.startDate}"`);
      }

      if (validated.endDate) {
        whereClauses.push(`startdate<="${validated.endDate}"`);
      }

      if (whereClauses.length > 0) {
        params['oslc.where'] = whereClauses.join(' and ');
      }

      // Make API request
      const response = await this.client.get<{ member: DowntimeEntry[]; responseInfo?: any }>(
        downtimeEndpoint,
        params
      );

      if (response.success && response.data) {
        const downtimeRecords = response.data.member || [];
        const totalCount = response.data.responseInfo?.totalCount || downtimeRecords.length;

        // Calculate total downtime hours
        const totalDowntimeHours = downtimeRecords.reduce(
          (sum, record) => sum + (record.downtime || 0),
          0
        );

        const historyResponse: DowntimeHistoryResponse = {
          downtimeRecords,
          totalCount,
          totalDowntimeHours,
        };

        logger.info('Downtime history retrieved successfully', {
          assetnum,
          siteid,
          recordCount: downtimeRecords.length,
          totalDowntimeHours,
        });

        return {
          ...response,
          data: historyResponse,
        };
      }

      return {
        success: false,
        error: response.error,
        errorCode: response.errorCode,
        statusCode: response.statusCode,
        headers: response.headers,
        requestId: response.requestId,
      };
    } catch (error) {
      logger.error('Failed to retrieve downtime history', { assetnum, siteid, error });
      throw error;
    }
  }
}