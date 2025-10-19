import axiosClient from 'lib/axiosClient';
import { PagedResult, UserDetail, UserFilterParams } from 'types/entities';
import { UpdateUserByAdminModel, UpdateUserRolesModel } from 'types/models';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const getUsers = (params: UserFilterParams): Promise<ApiResponse<PagedResult<UserDetail>>> => {
  return axiosClient.get('/Admin/users', { params });
};

export const getUser = (userId: string): Promise<ApiResponse<UserDetail>> => {
  return axiosClient.get(`/Admin/users/${userId}`);
};

export const updateUser = (userId: string, data: UpdateUserByAdminModel): Promise<ApiResponse<UserDetail>> => {
  return axiosClient.put(`/Admin/users/${userId}`, data);
};

export const updateUserRoles = (userId: string, data: UpdateUserRolesModel): Promise<ApiResponse<object>> => {
  return axiosClient.put(`/Admin/users/${userId}/roles`, data);
};

export const getAllRoles = (): Promise<ApiResponse<string[]>> => {
    return axiosClient.get('/Admin/roles');
};

export const deleteUser = (userId: string): Promise<ApiResponse<object>> => {
  return axiosClient.delete(`/Admin/users/${userId}`);
}; 