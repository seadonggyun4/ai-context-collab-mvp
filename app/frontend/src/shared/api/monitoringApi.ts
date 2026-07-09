import { apiRequest, withQuery } from "@shared/api/httpClient";
import { MONITORING_ENDPOINTS } from "@shared/api/monitoringEndpoints";
import type {
  ApcName,
  CreateIssueActionRequest,
  CropType,
  IngestionStatusResponse,
  IssueSeverity,
  IssueStatus,
  IssueType,
  MonitoringRuleItem,
  MonitoringRuleResponse,
  MonitoringStatus,
  MonitoringSummaryResponse,
  OperationActionItem,
  OperationActionResponse,
  PipelineTraceResponse,
  QualityIssueResponse,
  SnpSe,
  UpdateMonitoringRuleRequest
} from "@shared/types/monitoring";

export interface MonitoringFilterParams {
  apc?: ApcName;
  crop?: CropType;
  snpSe?: SnpSe;
  status?: MonitoringStatus;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface IssueFilterParams extends MonitoringFilterParams, DateRangeParams {
  issueStatus?: IssueStatus;
  issueType?: IssueType;
  severity?: IssueSeverity;
}

export interface ActionFilterParams {
  issueId?: string;
  apc?: ApcName;
  status?: IssueStatus;
  assignee?: string;
}

const DEFAULT_DATE_RANGE = {
  startDate: "2026-07-09",
  endDate: "2026-07-09"
};

export const monitoringApi = {
  getSummary(params: MonitoringFilterParams = {}) {
    return apiRequest<MonitoringSummaryResponse>(
      withQuery(MONITORING_ENDPOINTS.summary, params)
    );
  },

  getIngestions(params: MonitoringFilterParams & DateRangeParams = {}) {
    return apiRequest<IngestionStatusResponse>(
      withQuery(MONITORING_ENDPOINTS.ingestions, {
        ...DEFAULT_DATE_RANGE,
        ...params
      })
    );
  },

  getIssues(params: IssueFilterParams = {}) {
    return apiRequest<QualityIssueResponse>(
      withQuery(MONITORING_ENDPOINTS.issues, {
        ...DEFAULT_DATE_RANGE,
        ...params
      })
    );
  },

  getPipelineTrace(traceId: string) {
    return apiRequest<PipelineTraceResponse>(MONITORING_ENDPOINTS.pipeline(traceId));
  },

  getActions(params: ActionFilterParams = {}) {
    return apiRequest<OperationActionResponse>(
      withQuery(MONITORING_ENDPOINTS.actions, params)
    );
  },

  createIssueAction(issueId: string, request: CreateIssueActionRequest) {
    return apiRequest<OperationActionItem>(MONITORING_ENDPOINTS.issueActions(issueId), {
      body: JSON.stringify(request),
      method: "POST"
    });
  },

  getRules(params: Pick<MonitoringFilterParams, "apc" | "crop" | "snpSe"> = {}) {
    return apiRequest<MonitoringRuleResponse>(
      withQuery(MONITORING_ENDPOINTS.rules, params)
    );
  },

  updateRule(ruleId: string, request: UpdateMonitoringRuleRequest) {
    return apiRequest<MonitoringRuleItem>(MONITORING_ENDPOINTS.rule(ruleId), {
      body: JSON.stringify(request),
      method: "PUT"
    });
  }
};
