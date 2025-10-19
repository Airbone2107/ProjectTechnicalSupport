import { jwtDecode } from 'jwt-decode';

// Định nghĩa claim chuẩn cho role mà ASP.NET Core Identity sử dụng
const ROLE_CLAIM_TYPE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const PERMISSIONS_CLAIM_TYPE = "permissions";

export interface JwtPayload {
  nameid: string; 
  email: string;
  displayName: string;
  // Interface phản ánh đúng cấu trúc claim từ backend
  [ROLE_CLAIM_TYPE]: string | string[]; 
  // Thống nhất thuộc tính 'permissions'. Token có thể trả về string hoặc string[].
  permissions: string | string[];
  exp: number; 
  // Thuộc tính tùy chỉnh để dễ sử dụng trong ứng dụng
  role: string | string[];
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Ánh xạ claim chuẩn của ASP.NET sang thuộc tính 'role' để dễ sử dụng
    decoded.role = decoded[ROLE_CLAIM_TYPE];
    
    // Chuẩn hóa 'permissions' thành một mảng string[].
    // Sau dòng này, decoded.permissions thực chất là string[] tại runtime.
    const permissionsClaim = decoded.permissions;
    (decoded as any).permissions = Array.isArray(permissionsClaim) ? permissionsClaim : [permissionsClaim].filter(p => p);


    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}; 