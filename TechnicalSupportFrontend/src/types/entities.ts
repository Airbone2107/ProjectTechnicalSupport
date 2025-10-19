export interface User {
  id: string;
  displayName: string;
  email: string;
  expertise?: string;
}

export interface Status {
  statusId: number;
  name: string;
}

export interface Group {
  groupId: number;
  name: string;
  description?: string;
}

export interface ProblemType {
  problemTypeId: number;
  name: string;
  description: string;
  groupId?: number | null;
}

export interface Attachment {
  attachmentId: number;
  ticketId: number;
  originalFileName: string;
  storedPath: string;
  fileType: string;
  uploadedAt: string;
  uploadedByDisplayName: string;
}

export interface Comment {
  commentId: number;
  ticketId: number;
  content: string;
  createdAt: string;
  user: User;
}

export interface Ticket {
  ticketId: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  status: Status;
  customer: User;
  assignee?: User | null;
  group?: Group | null;
  problemType?: ProblemType | null;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface TicketFilterParams extends PaginationParams {
  statuses?: string[];
  priority?: string;
  searchQuery?: string;
  unassignedToGroupOnly?: boolean;
  createdByMe?: boolean;
  myTicket?: boolean;
  myGroupTicket?: boolean;
}

export interface UserDetail extends User {
  roles: string[];
  emailConfirmed: boolean;
  lockoutEnd?: Date | null;
}

export interface PermissionRequest {
  id: number;
  requester: User;
  requestedPermission: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processor?: User;
  processedAt?: string;
  processorNotes?: string;
  createdAt: string;
}

export interface UserFilterParams extends PaginationParams {
  role?: string;
  displayNameQuery?: string;
} 