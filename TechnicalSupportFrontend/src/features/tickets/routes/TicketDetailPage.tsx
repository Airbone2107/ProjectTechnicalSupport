import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useSignalR } from 'contexts/SignalRContext';
import { getTicketById, addComment, updateTicketStatus, deleteTicket, claimTicket, rejectFromGroup } from '../api/ticketService';
import { Ticket, Comment as CommentType } from 'types/entities';
import { TICKET_STATUS_LIST } from 'types/enums'; // Import từ file enum
import LoadingSpinner from 'components/LoadingSpinner';
import { AssignToGroupModal } from '../components/AssignToGroupModal';
import { AssignToMemberModal } from '../components/AssignToMemberModal';
import {
  Box, Typography, Grid, Paper, Chip, Stack, TextField, Button, Divider, Select, MenuItem,
  FormControl, InputLabel, SelectChangeEvent, Alert
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type PriorityColor = "error" | "warning" | "success";

const priorityMapping: Record<string, PriorityColor> = {
  "High": "error", "Medium": "warning", "Low": "success",
};

const CommentBubble: React.FC<{ comment: CommentType; isOwn: boolean }> = ({ comment, isOwn }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 4,
      maxWidth: '80%',
      bgcolor: isOwn ? 'primary.light' : 'grey.200',
      color: isOwn ? 'primary.contrastText' : 'text.primary',
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{comment.user.displayName}</Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.content}</Typography>
    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1, opacity: 0.7 }}>
      {new Date(comment.createdAt).toLocaleString()}
    </Typography>
  </Paper>
);

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const { user, hasPermission } = useAuth();
  const { connection, isConnected } = useSignalR();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState('');
  const [isAssignGroupModalOpen, setAssignGroupModalOpen] = useState(false);
  const [isAssignMemberModalOpen, setAssignMemberModalOpen] = useState(false);
  
  const commentsEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const { data: ticket, isLoading, error, refetch } = useQuery({
      queryKey: ['ticket', ticketId],
      queryFn: async () => {
        const response = await getTicketById(ticketId);
        if (response.succeeded) {
            return response.data;
        }
        throw new Error(response.message || "Could not load ticket details.");
      },
      enabled: !!ticketId, // Chỉ chạy query khi có ticketId
  });

  useEffect(() => {
    if (connection && isConnected && ticketId) {
      connection.invoke("JoinTicketGroup", ticketId.toString()).catch(err => console.error("Failed to join ticket group:", err));

      // Listener 'TicketListUpdated' đã được chuyển thành listener toàn cục trong Layout.tsx.
      // Nó sẽ tự động invalidate query 'ticket' và 'tickets', vì vậy không cần code cục bộ ở đây nữa.
      
      return () => {
        connection.invoke("LeaveTicketGroup", ticketId.toString()).catch(err => console.error("Failed to leave ticket group:", err));
      };
    }
  }, [connection, isConnected, ticketId]);
  
  useEffect(() => {
    if(ticket?.comments) {
        scrollToBottom();
    }
  }, [ticket?.comments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addComment(ticketId, { content: newComment });
      setNewComment('');
      // Không cần refetch vì Hub đã broadcast sự kiện cập nhật
    } catch (err) { alert("Failed to send reply."); }
  };

  const handleStatusChange = async (event: SelectChangeEvent<number>) => {
    const newStatusId = Number(event.target.value);
    try {
      await updateTicketStatus(ticketId, newStatusId);
      // Không cần refetch
    } catch (err) {
      alert("Failed to update status.");
    }
  };
  
  const handleDeleteTicket = async () => {
    if (window.confirm("Bạn có chắc muốn xóa vĩnh viễn ticket này?")) {
        try {
            await deleteTicket(ticketId);
            alert("Ticket đã được xóa.");
            queryClient.invalidateQueries({queryKey: ['tickets']});
            navigate('/dashboard');
        } catch (err) { alert("Xóa ticket thất bại."); }
    }
  };

  const handleClaimTicket = async () => {
      if (window.confirm("Bạn có chắc muốn nhận ticket này?")) {
          try {
              await claimTicket(ticketId);
              // Không cần refetch
          } catch (error) { alert("Nhận ticket thất bại."); }
      }
  };
  
  const handleRejectFromGroup = async () => {
    if(window.confirm("Bạn có chắc muốn đẩy ticket này về hàng chờ phân loại chung?")) {
        try {
            await rejectFromGroup(ticketId);
            // Không cần refetch
        } catch (error) { alert("Đẩy ticket thất bại."); }
    }
  }

  if (isLoading) return <LoadingSpinner message="Đang tải ticket..." />;
  if (error || !ticket) return <Paper sx={{ p: 3, m: 2, textAlign: 'center' }}><Typography color="error">{error?.message || "Không tìm thấy ticket"}</Typography></Paper>;
  
  const canEditStatus = hasPermission('tickets:update_status');
  const canClaim = hasPermission('tickets:claim') && !ticket.assignee && !!ticket.group;
  const canAssignToMember = hasPermission('tickets:assign_to_member') && !!ticket.group;
  const canAssignToGroup = hasPermission('tickets:assign_to_group') && !ticket.group;
  const canReject = hasPermission('tickets:reject_from_group') && !!ticket.group;
  const canDelete = hasPermission('tickets:delete');
  const canComment = hasPermission('tickets:add_comment');

  return (
    <>
              {canAssignToGroup && (
          <AssignToGroupModal
            open={isAssignGroupModalOpen}
            onClose={() => setAssignGroupModalOpen(false)}
            ticketId={ticketId}
            onSuccess={() => {
              setAssignGroupModalOpen(false);
              refetch();
            }}
          />
        )}
                {canAssignToMember && ticket.group?.groupId && (
            <AssignToMemberModal
              open={isAssignMemberModalOpen}
              onClose={() => setAssignMemberModalOpen(false)}
              ticketId={ticketId}
              groupId={ticket.group.groupId}
              onSuccess={() => {
                setAssignMemberModalOpen(false);
                refetch();
              }}
            />
          )}

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">{ticket.title}</Typography>
                <Chip label={ticket.priority} color={priorityMapping[ticket.priority]} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Conversation</Typography>
              <Stack spacing={2} sx={{ maxHeight: 500, overflowY: 'auto', p: 1, mb: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {ticket.comments.map(comment => <CommentBubble key={comment.commentId} comment={comment} isOwn={comment.user.id === user?.nameid} />)}
                <div ref={commentsEndRef} />
              </Stack>
              {canComment && (
                <Box component="form" onSubmit={handleAddComment}>
                  <TextField fullWidth multiline rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Nhập bình luận của bạn..." />
                  <Button type="submit" variant="contained" sx={{ mt: 1, float: 'right' }}>Gửi</Button>
                </Box>
              )}
            </Paper>
          </Stack>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Stack spacing={3} sx={{ position: 'sticky', top: 88 }}>
            {ticket.group == null && <Alert severity='warning'>Ticket này chưa được phân vào nhóm nào.</Alert>}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Ticket Details</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={ticket.status.statusId}
                    label="Trạng thái"
                    onChange={handleStatusChange}
                    disabled={!canEditStatus}
                  >
                        {TICKET_STATUS_LIST.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </Select>
                </FormControl>
                <Box>
                  <Typography variant="caption" color="text.secondary">Loại vấn đề</Typography>
                  <Typography>{ticket.problemType?.name || 'Không xác định'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Nhóm hỗ trợ</Typography>
                  <Typography>{ticket.group?.name || 'Chưa phân nhóm'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Người xử lý</Typography>
                  <Typography>{ticket.assignee?.displayName || 'Chưa có'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Người tạo</Typography>
                  <Typography>{ticket.customer.displayName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                  <Typography>{new Date(ticket.createdAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Stack spacing={1}>
                {canClaim && <Button variant="contained" color="success" onClick={handleClaimTicket}>Nhận Ticket</Button>}
                {canAssignToMember && <Button variant="contained" onClick={() => setAssignMemberModalOpen(true)}>Gán cho thành viên</Button>}
                {canAssignToGroup && <Button variant="contained" onClick={() => setAssignGroupModalOpen(true)}>Gán vào nhóm</Button>}
                {canReject && <Button variant="outlined" color="warning" onClick={handleRejectFromGroup}>Đẩy khỏi nhóm</Button>}
                {canDelete && <Button variant="outlined" color="error" onClick={handleDeleteTicket}>Xóa Ticket</Button>}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default TicketDetailPage;