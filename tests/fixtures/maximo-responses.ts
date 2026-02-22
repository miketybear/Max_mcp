/**
 * Mock Maximo API responses for testing
 * Provides realistic test data that matches Maximo API structure
 */

export const mockWorkOrder = {
  wonum: 'WO1001',
  siteid: 'BEDFORD',
  description: 'Test Work Order',
  worktype: 'CM',
  status: 'WAPPR',
  statusdate: '2024-01-15T10:00:00Z',
  assetnum: 'ASSET001',
  location: 'LOC001',
  priority: 2,
  reportedby: 'MAXADMIN',
  owner: 'MAXADMIN',
  ownergroup: 'MAINT',
  schedstart: '2024-01-20T08:00:00Z',
  schedfinish: '2024-01-20T17:00:00Z',
  actstart: null,
  actfinish: null,
  estdur: 8.0,
  href: 'http://maximo.example.com/maximo/oslc/os/mxwodetail/1001',
};

export const mockAsset = {
  assetnum: 'ASSET001',
  siteid: 'BEDFORD',
  description: 'Test Asset',
  assettype: 'PRODUCTION',
  status: 'OPERATING',
  location: 'LOC001',
  parent: null,
  isrunning: true,
  serialnum: 'SN12345',
  manufacturer: 'ACME Corp',
  model: 'MODEL-X',
  installdate: '2020-01-01T00:00:00Z',
  purchaseprice: 50000.00,
  replacecost: 75000.00,
  href: 'http://maximo.example.com/maximo/oslc/os/mxasset/1',
};

export const mockInventory = {
  itemnum: 'ITEM001',
  siteid: 'BEDFORD',
  description: 'Test Inventory Item',
  itemtype: 'ITEM',
  status: 'ACTIVE',
  orderunit: 'EA',
  issueunit: 'EA',
  avgcost: 25.50,
  stdcost: 30.00,
  lastcost: 28.00,
  lottype: 'LOT',
  rotating: false,
  href: 'http://maximo.example.com/maximo/oslc/os/mxinventory/1',
};

export const mockServiceRequest = {
  ticketid: 'SR1001',
  siteid: 'BEDFORD',
  description: 'Test Service Request',
  status: 'NEW',
  statusdate: '2024-01-15T10:00:00Z',
  reportedby: 'USER001',
  reportdate: '2024-01-15T09:00:00Z',
  affectedperson: 'USER001',
  assetnum: 'ASSET001',
  location: 'LOC001',
  classstructureid: 'SR',
  owner: 'MAXADMIN',
  ownergroup: 'HELPDESK',
  href: 'http://maximo.example.com/maximo/oslc/os/mxsr/1001',
};

export const mockLocation = {
  location: 'LOC001',
  siteid: 'BEDFORD',
  description: 'Test Location',
  type: 'OPERATING',
  status: 'OPERATING',
  parent: null,
  glaccount: '6000-100-1000',
  orgid: 'EAGLENA',
  href: 'http://maximo.example.com/maximo/oslc/os/mxlocation/1',
};

export const mockWorkLog = {
  worklogid: 1,
  logtype: 'WORK',
  description: 'Test work log entry',
  description_longdescription: 'Detailed description of work performed',
  createdate: '2024-01-15T10:00:00Z',
  createby: 'MAXADMIN',
  clientviewable: true,
};

export const mockLaborTransaction = {
  laborcode: 'LAB001',
  craft: 'ELECT',
  skilllevel: 'FIRSTCLASS',
  regularhrs: 8.0,
  premiumpaycode: null,
  startdate: '2024-01-15T08:00:00Z',
  starttime: '08:00:00',
  finishdate: '2024-01-15T17:00:00Z',
  finishtime: '17:00:00',
};

export const mockMaterialTransaction = {
  itemnum: 'ITEM001',
  quantity: 5,
  unitcost: 25.50,
  linecost: 127.50,
  storeloc: 'CENTRAL',
  binnum: 'A-01-01',
  transdate: '2024-01-15T10:00:00Z',
};

export const mockApiResponse = {
  member: [mockWorkOrder],
  responseInfo: {
    totalCount: 1,
    pagenum: 1,
    href: 'http://maximo.example.com/maximo/oslc/os/mxwodetail',
  },
};

export const mockErrorResponse = {
  Error: {
    message: 'BMXAA4210E - The record has been changed by another user.',
    statusCode: 400,
    reasonCode: 'BMXAA4210E',
  },
};

export const mockAuthResponse = {
  userName: 'MAXADMIN',
  personId: 'MAXADMIN',
  defaultSite: 'BEDFORD',
  defaultOrg: 'EAGLENA',
  maximoVersion: '9.0.0',
};