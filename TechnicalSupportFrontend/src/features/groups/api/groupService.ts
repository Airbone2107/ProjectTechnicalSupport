import axiosClient from 'lib/axiosClient';
import { Group, User } from 'types/entities';
import { AddMemberModel, CreateGroupModel } from 'types/models';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const getGroups = (): Promise<ApiResponse<Group[]>> => {
  return axiosClient.get('/Groups');
};

export const createGroup = (data: CreateGroupModel): Promise<ApiResponse<Group>> => {
  return axiosClient.post('/Groups', data);
};

export const getGroupMembers = (groupId: number): Promise<ApiResponse<User[]>> => {
  return axiosClient.get(`/Groups/${groupId}/members`);
};

export const addGroupMember = (groupId: number, data: AddMemberModel): Promise<ApiResponse<object>> => {
  return axiosClient.post(`/Groups/${groupId}/members`, data);
};

export const removeGroupMember = (groupId: number, userId: string): Promise<ApiResponse<object>> => {
  return axiosClient.delete(`/Groups/${groupId}/members/${userId}`);
};

// SỬA LỖI: Sửa hàm này để gọi đúng endpoint và trả về đúng kiểu
export const getAssignableUsers = (): Promise<ApiResponse<User[]>> => {
    return axiosClient.get('/Admin/assignable-users');
}