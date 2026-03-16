/**
 * Type definitions for Admin Module
 * Defines interfaces for automation scripts, cron tasks, endpoints, and actions
 */

/**
 * Automation script definition
 */
export interface AutomationScript {
  /** Script name */
  autoscript: string;

  /** Script description */
  description?: string;

  /** Scripting language (jython, javascript, etc.) */
  scriptlanguage: string;

  /** Script source code */
  source?: string;

  /** Script status */
  status?: string;

  /** Whether script is active */
  active?: boolean;

  /** Log level */
  loglevel?: string;

  /** Script variables */
  autoscriptvars?: AutomationScriptVar[];

  /** Script launch points */
  scriptlaunchpoint?: ScriptLaunchPoint[];

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Automation script variable
 */
export interface AutomationScriptVar {
  /** Variable name */
  varname: string;

  /** Binding type (LITERAL, ATTRIBUTE, etc.) */
  varbindingtype?: string;

  /** Variable type (IN, OUT, INOUT) */
  vartype?: string;

  /** Literal data type */
  literaldatatype?: string;

  /** Binding value */
  varbindingvalue?: string;

  /** Max variable name */
  maxvarname?: string;
}

/**
 * Script launch point
 */
export interface ScriptLaunchPoint {
  /** Launch point name */
  launchpointname: string;

  /** Launch point type (OBJECT, ATTRIBUTE, ACTION, CUSTOM) */
  launchpointtype: string;

  /** Object name for OBJECT type */
  objectname?: string;

  /** Attribute name for ATTRIBUTE type */
  attributename?: string;

  /** Event type (0=init, 1=validate, 2=allow, 3=restrict, 4=save) */
  eventtype?: string;

  /** Whether launch point is active */
  active?: boolean;

  /** Action name for ACTION type */
  actionname?: string;
}

/**
 * Script execution parameters
 */
export interface ScriptExecParams {
  /** Script name to execute */
  scriptName: string;

  /** Input parameters as key-value pairs */
  params?: Record<string, unknown>;
}

/**
 * Script execution result
 */
export interface ScriptExecResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Output variables */
  output?: Record<string, unknown>;

  /** Error message if failed */
  error?: string;
}

/**
 * Cron task definition
 */
export interface CronTask {
  /** Cron task name */
  crontaskname: string;

  /** Description */
  description?: string;

  /** Task class */
  classname?: string;

  /** Whether active */
  active?: boolean;

  /** Schedule (cron expression) */
  schedule?: string;

  /** Run as user */
  runasuser?: string;

  /** Max history */
  maxhistory?: number;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Integration endpoint
 */
export interface IntegrationEndpoint {
  /** Endpoint name */
  endpointname: string;

  /** Description */
  description?: string;

  /** Handler class */
  handlerclass?: string;

  /** Endpoint URL */
  url?: string;

  /** Whether active */
  active?: boolean;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Custom action
 */
export interface CustomAction {
  /** Action name */
  action: string;

  /** Description */
  description?: string;

  /** Object name */
  objectname?: string;

  /** Action type */
  type?: string;

  /** Whether active */
  active?: boolean;

  /** Value to set */
  value?: string;

  /** Parameter */
  parameter?: string;

  /** OSLC link */
  href?: string;

  /** Internal row stamp */
  _rowstamp?: string;
}

/**
 * Automation script creation DTO
 */
export interface AutomationScriptCreate {
  autoscript: string;
  description?: string;
  scriptlanguage: string;
  source: string;
  status?: string;
  active?: boolean;
  loglevel?: string;
  autoscriptvars?: AutomationScriptVar[];
  scriptlaunchpoint?: ScriptLaunchPoint[];
}

/**
 * Automation script update DTO
 */
export interface AutomationScriptUpdate {
  source?: string;
  description?: string;
  status?: string;
  active?: boolean;
  loglevel?: string;
}

/**
 * Automation script search criteria
 */
export interface AutomationScriptSearch {
  autoscript?: string;
  scriptlanguage?: string;
  active?: boolean;
  status?: string;
  pageSize?: number;
  page?: number;
  select?: string[];
  orderBy?: string;
  where?: string;
}
