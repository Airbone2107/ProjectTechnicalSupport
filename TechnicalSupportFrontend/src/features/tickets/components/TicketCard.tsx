import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User } from 'types/entities';
import { TicketStatus } from 'types/enums'; // Import TicketStatus
import { useNewTicketStore } from 'stores/newTicketStore';
import {
  Card, CardActionArea, Grid, Box, Typography, Chip, Avatar, Tooltip, Stack, Divider
} from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// Helper to get initials for Avatar
const getAvatarChars = (name?: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to calculate "time ago"
const timeAgo = (date: string | Date): string => {
  if (!date) return 'N/A';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "vài giây trước";
};

// Cập nhật kiểu của statusColors để sử dụng TicketStatus enum
const statusColors: Record<TicketStatus, { bg: string, text: string }> = {
  [TicketStatus.Open]: { bg: '#3498db', text: '#fff' },
  [TicketStatus.InProgress]: { bg: '#f1c40f', text: '#fff' },
  [TicketStatus.Resolved]: { bg: '#2ecc71', text: '#fff' },
  [TicketStatus.Closed]: { bg: '#95a5a6', text: '#fff' },
  [TicketStatus.OnHold]: { bg: '#e67e22', text: '#fff' },
};
const defaultStatusColor = { bg: '#bdc3c7', text: '#fff' };

// Reusable component for displaying metadata columns
const InfoColumn: React.FC<{ label: string; user?: User | null; text?: string; priority?: string }> = ({ label, user, text, priority }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
    {user && (
      <Tooltip title={user.displayName} placement="top">
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'grey.300', color: 'text.primary' }}>
            {getAvatarChars(user.displayName)}
          </Avatar>
          <Typography variant="body2">{user.displayName}</Typography>
        </Stack>
      </Tooltip>
    )}
    {text && <Typography variant="body2">{text}</Typography>}
    {priority && (
      <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2">{priority}</Typography>
      </Stack>
    )}
    {!user && !text && !priority && <Typography variant="body2" color="text.secondary">~</Typography>}
  </Box>
);

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const navigate = useNavigate();
  const { newTicketIds, removeNewTicketId } = useNewTicketStore();
  const isNew = newTicketIds.has(ticket.ticketId);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        removeNewTicketId(ticket.ticketId);
      }, 5000); // Remove after 5 seconds to be safe
      return () => clearTimeout(timer);
    }
  }, [isNew, ticket.ticketId, removeNewTicketId]);

  if (!ticket || !ticket.ticketId) {
    console.error("TicketCard received an invalid ticket object:", ticket);
    return null;
  }

  const statusName = ticket.status?.name;
  // Kiểm tra xem statusName có phải là một giá trị hợp lệ trong TicketStatus enum không
  const isValidStatus = Object.values(TicketStatus).includes(statusName as TicketStatus);
  const currentStatusConfig = isValidStatus ? statusColors[statusName as TicketStatus] : defaultStatusColor;

  return (
    <Card variant="outlined" className={isNew ? 'ticket-card-new' : ''}>
      <CardActionArea onClick={() => navigate(`/tickets/${ticket.ticketId}`)} sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {/* HÀNG TRÊN: Thông tin chính của Ticket */}
          <Grid size={12}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Stack direction="column" spacing={1} alignItems="center">
                <Chip label={`#${ticket.ticketId}`} size="small" sx={{ fontWeight: 'bold' }} />
                <Chip
                  label={(statusName || 'Unknown').toUpperCase()}
                  size="small"
                  style={{ backgroundColor: currentStatusConfig.bg, color: currentStatusConfig.text, minWidth: '80px' }}
                />
              </Stack>
              <Box flexGrow={1}>
                <Typography variant="h6" component="span" sx={{ mr: 1 }}>{ticket.title || 'No Title'}</Typography>
                <Typography variant="caption" color="text.secondary">{timeAgo(ticket.updatedAt)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {(ticket.description || '').substring(0, 150)}{ticket.description && ticket.description.length > 150 ? '...' : ''}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          
          <Divider sx={{ my: 1, width: '100%' }} />

          {/* HÀNG DƯỚI: Thông tin metadata */}
          <Grid size={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                  md: 3
                }}>
                <InfoColumn label="Assignee" user={ticket.assignee} />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                  md: 3
                }}>
                <InfoColumn label="Raised by" user={ticket.customer} />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                  md: 2
                }}>
                 <InfoColumn label="Priority" priority={ticket.priority} />
              </Grid>
              <Grid
                sx={{ textAlign: 'right' }}
                size={{
                  xs: 6,
                  sm: 3,
                  md: 4
                }}>
                 {ticket.priority === 'High' && (
                  <Tooltip title="High Priority" placement="top">
                    <PriorityHighIcon color="error" />
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};

export default TicketCard;