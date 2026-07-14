import { apiRequest, withQuery } from "@shared/api/httpClient";
import { MONITORING_ENDPOINTS } from "@shared/api/monitoringEndpoints";
import type {
  ApcName,
  CropType,
  IngestionStatusResponse,
  IssueSeverity,
  IssueStatus,
  IssueType,
  MonitoringStatus,
  MonitoringSummaryResponse,
  PipelineTraceResponse,
  QualityIssueResponse,
  SnpSe
} from "@shared/types/monitoring";
import { getKstDateParam } from "@shared/utils/kstDate";

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

function getDefaultDateRange() {
  const today = getKstDateParam();
  return {
    startDate: today,
    endDate: today
  };
}

export const monitoringApi = {
  getSummary(params: MonitoringFilterParams = {}) {
    return apiRequest<MonitoringSummaryResponse>(
      withQuery(MONITORING_ENDPOINTS.summary, params)
    );
  },

  getIngestions(params: MonitoringFilterParams & DateRangeParams = {}) {
    return apiRequest<IngestionStatusResponse>(
      withQuery(MONITORING_ENDPOINTS.ingestions, {
        ...getDefaultDateRange(),
        ...params
      })
    );
  },

  getIssues(params: IssueFilterParams = {}) {
    return apiRequest<QualityIssueResponse>(
      withQuery(MONITORING_ENDPOINTS.issues, {
        ...getDefaultDateRange(),
        ...params
      })
    );
  },

  getPipelineTrace(traceId: string) {
    return apiRequest<PipelineTraceResponse>(MONITORING_ENDPOINTS.pipeline(traceId));
  }
};
