import axiosClient from 'lib/axiosClient';
import { PagedResult, PermissionRequest, PaginationParams } from 'types/entities';
import { CreatePermissionRequestModel, ProcessPermissionRequestModel } from 'types/models';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const createPermissionRequest = (data: CreatePermissionRequestModel): Promise<ApiResponse<PermissionRequest>> => {
  return axiosClient.post('/permission-requests', data);
};

export const getPermissionRequests = (params: PaginationParams & { pendingOnly?: boolean }): Promise<ApiResponse<PagedResult<PermissionRequest>>> => {
  return axiosClient.get('/permission-requests', { params });
};

export const approveRequest = (id: number, data: ProcessPermissionRequestModel): Promise<ApiResponse<object>> => {
  return axiosClient.put(`/permission-requests/${id}/approve`, data);
};

export const rejectRequest = (id: number, data: ProcessPermissionRequestModel): Promise<ApiResponse<object>> => {
  return axiosClient.put(`/permission-requests/${id}/reject`, data);
}; 