import axiosClient from 'lib/axiosClient';
import { ProblemType } from 'types/entities';
import { CreateProblemTypeModel } from 'types/models';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const getProblemTypes = (): Promise<ApiResponse<ProblemType[]>> => {
  return axiosClient.get('/api/ProblemTypes');
};

export const createProblemType = (data: CreateProblemTypeModel): Promise<ApiResponse<ProblemType>> => {
  return axiosClient.post('/api/ProblemTypes', data);
};

export const updateProblemType = (id: number, data: CreateProblemTypeModel): Promise<ApiResponse<ProblemType>> => {
  return axiosClient.put(`/api/ProblemTypes/${id}`, data);
};

export const deleteProblemType = (id: number): Promise<ApiResponse<object>> => {
  return axiosClient.delete(`/api/ProblemTypes/${id}`);
}; 