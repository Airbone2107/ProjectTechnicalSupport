import axiosClient from 'lib/axiosClient';
import { Attachment } from 'types/entities';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const uploadAttachments = (ticketId: number, files: File[]): Promise<ApiResponse<Attachment[]>> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    return axiosClient.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getAttachments = (ticketId: number): Promise<ApiResponse<Attachment[]>> => {
    return axiosClient.get(`/tickets/${ticketId}/attachments`);
};

export const downloadAttachment = async (attachmentId: number, fileName: string) => {
    const response = await axiosClient.get(`/attachments/${attachmentId}`, {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response as any]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};

export const deleteAttachment = (attachmentId: number): Promise<ApiResponse<object>> => {
    return axiosClient.delete(`/attachments/${attachmentId}`);
}; 