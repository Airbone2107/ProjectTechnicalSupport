/**
 * Enum định nghĩa các trạng thái của Ticket, đồng bộ với backend.
 * Sử dụng cho việc lọc và hiển thị.
 */
export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

/**
 * Mảng chứa thông tin chi tiết của từng trạng thái, bao gồm ID và Name.
 * Dùng để render các dropdown hoặc các component cần cả ID và Name.
 */
export const TICKET_STATUS_LIST = [
    { id: 1, name: TicketStatus.Open },
    { id: 2, name: TicketStatus.InProgress },
    { id: 3, name: TicketStatus.Resolved },
    { id: 4, name: TicketStatus.Closed },
    { id: 5, name: TicketStatus.OnHold },
]; 