import axiosClient from 'lib/axiosClient';
import { PagedResult, Ticket, Comment, TicketFilterParams } from 'types/entities';
import { AddCommentModel, AssignGroupModel, AssignTicketModel, CreateTicketModel, UpdateTicketStatusModel } from 'types/models';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const getTickets = (params: TicketFilterParams): Promise<ApiResponse<PagedResult<Ticket>>> => {
    // Chuyển đổi đối tượng params thành URLSearchParams để xử lý mảng đúng cách
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return; // Bỏ qua các giá trị null hoặc undefined
        }

        // Xử lý mảng statuses một cách đặc biệt
        if (key === 'statuses' && Array.isArray(value)) {
            value.forEach(status => {
                searchParams.append('statuses', status);
            });
        } 
        // Xử lý các tham số khác
        else if (!Array.isArray(value)) {
            searchParams.append(key, String(value));
        }
    });

    // Gọi API với chuỗi truy vấn đã được xây dựng chính xác
    return axiosClient.get(`/Tickets?${searchParams.toString()}`);
};


export const getTicketById = (id: number): Promise<ApiResponse<Ticket>> => {
    return axiosClient.get(`/Tickets/${id}`);
};

export const createTicket = (ticketData: CreateTicketModel): Promise<ApiResponse<Ticket>> => {
    return axiosClient.post('/Tickets', ticketData);
};

export const updateTicketStatus = (id: number, statusId: number): Promise<ApiResponse<Ticket>> => {
    const model: UpdateTicketStatusModel = { statusId };
    return axiosClient.put(`/Tickets/${id}/status`, model);
};

export const addComment = (ticketId: number, commentData: AddCommentModel): Promise<ApiResponse<Comment>> => {
    return axiosClient.post(`/Tickets/${ticketId}/comments`, commentData);
};

export const assignTicket = (ticketId: number, assigneeId: string): Promise<ApiResponse<Ticket>> => {
    const model: AssignTicketModel = { assigneeId };
    return axiosClient.put(`/Tickets/${ticketId}/assign`, model);
};

export const assignTicketToGroup = (ticketId: number, groupId: number): Promise<ApiResponse<Ticket>> => {
    const model: AssignGroupModel = { groupId };
    return axiosClient.put(`/Tickets/${ticketId}/assign-group`, model);
};

export const claimTicket = (ticketId: number): Promise<ApiResponse<Ticket>> => {
    return axiosClient.post(`/Tickets/${ticketId}/claim`);
};

export const rejectFromGroup = (ticketId: number): Promise<ApiResponse<Ticket>> => {
    return axiosClient.post(`/Tickets/${ticketId}/reject-from-group`);
};

export const deleteTicket = (id: number): Promise<ApiResponse<object>> => {
    return axiosClient.delete(`/Tickets/${id}`);
};