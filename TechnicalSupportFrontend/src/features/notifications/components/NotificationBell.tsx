import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from 'stores/notificationStore';
import {
  IconButton, Badge, Popover, List, ListItem, ListItemButton, ListItemText, Typography, Divider, Box, Button, Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DraftsIcon from '@mui/icons-material/Drafts';

const timeAgo = (date: string): string => {
    if (!date) return 'N/A';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} năm trước`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} tháng trước`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} ngày trước`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} giờ trước`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} phút trước`;
    return "vài giây trước";
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id: string, link: string) => {
    markAsRead(id);
    navigate(link);
    handleClose();
  };
  
  const handleMarkAllRead = () => {
    markAllAsRead();
  }

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 400, display: 'flex', flexDirection: 'column' } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thông báo</Typography>
          {notifications.length > 0 && (
            <Button size="small" startIcon={<DraftsIcon />} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              Đánh dấu đã đọc
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="Không có thông báo mới." sx={{ textAlign: 'center', color: 'text.secondary' }} />
            </ListItem>
          ) : (
            notifications.map((notif) => (
              <ListItemButton
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.link)}
                sx={{ bgcolor: notif.isRead ? 'transparent' : 'action.hover' }}
              >
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>{notif.message}</Typography>}
                  secondary={timeAgo(notif.timestamp)}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;