// Dùng cho việc đăng ký tài khoản
export interface RegisterModel {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface CreateTicketModel {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  problemTypeId: number;
}

export interface UpdateTicketStatusModel {
  statusId: number;
}

export interface AddCommentModel {
  content: string;
}

export interface AssignTicketModel {
  assigneeId: string;
}

export interface AssignGroupModel {
  groupId: number;
}

export interface UpdateUserByAdminModel {
  displayName?: string;
  expertise?: string;
}

export interface UpdateUserRolesModel {
  roles: string[];
  currentPassword?: string;
}

export interface CreateGroupModel {
  name: string;
  description?: string;
}

export interface CreateProblemTypeModel {
    name: string;
    description?: string;
    groupId?: number | null;
}

export interface AddMemberModel {
  userId: string;
}

export interface CreatePermissionRequestModel {
  requestedPermission: string;
  justification: string;
}

export interface ProcessPermissionRequestModel {
  notes: string;
} 