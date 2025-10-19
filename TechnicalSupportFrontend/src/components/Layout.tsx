import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Box from '@mui/material/Box';

import { useSignalR } from 'contexts/SignalRContext';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNotificationStore, Notification } from 'stores/notificationStore';
import { useNewTicketStore } from 'stores/newTicketStore';
import { PagedResult, Ticket } from 'types/entities';

interface NotificationPayload {
  id: string;
  message: string;
  link: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isHighlight: boolean;
}

const Layout: React.FC = () => {
  const { connection, isConnected } = useSignalR();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { addNotification } = useNotificationStore();
  const { addNewTicketId } = useNewTicketStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && connection) {
      console.log('Layout Component: Setting up global SignalR event handlers.');

      const handleReceiveNotification = (payload: NotificationPayload) => {
        console.log("[SignalR] Layout received 'ReceiveNotification':", payload);
        const notif: Omit<Notification, 'isRead'> = {
          id: payload.id,
          message: payload.message,
          link: payload.link,
          timestamp: payload.timestamp,
        };
        addNotification(notif);

        // --- BẮT ĐẦU SỬA LỖI ---
        // Tạo một component React để làm nội dung cho snackbar
        const clickableMessage = (
          <span
            onClick={() => navigate(payload.link)}
            style={{ cursor: 'pointer', width: '100%', display: 'block' }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter') navigate(payload.link); }}
          >
            {payload.message}
          </span>
        );

        // Truyền component này vào enqueueSnackbar và bỏ thuộc tính onClick
        enqueueSnackbar(clickableMessage, {
          variant: payload.type || 'info',
          preventDuplicate: true,
          persist: payload.isHighlight,
        });
        // --- KẾT THÚC SỬA LỖI ---
      };

      const handleTicketListUpdated = () => {
        console.log("[SignalR] Layout received 'TicketListUpdated'. Invalidating queries...");
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket'] });
      };

      // Listener cho ticket mới với logic cập nhật cache
      const handleNewTicketAdded = (newTicket: Ticket) => {
        console.log("[SignalR] Layout handling 'NewTicketAdded' with animation logic:", newTicket);

        // Kích hoạt animation cho card mới
        addNewTicketId(newTicket.ticketId);

        // Cập nhật "lạc quan" (optimistic update) cache của TanStack Query
        queryClient.setQueriesData<PagedResult<Ticket>>({ queryKey: ['tickets'] }, (oldData) => {
          if (!oldData) return oldData;

          // Thêm ticket mới vào đầu danh sách
          const newItems = [newTicket, ...oldData.items];
          
          // Giữ nguyên kích thước trang, ticket cuối cùng sẽ bị đẩy ra
          const updatedItems = newItems.slice(0, oldData.pageSize);

          // Cập nhật tổng số lượng và số trang
          const newTotalCount = oldData.totalCount + 1;
          const newTotalPages = Math.ceil(newTotalCount / oldData.pageSize);

          return {
            ...oldData,
            items: updatedItems,
            totalCount: newTotalCount,
            totalPages: newTotalPages,
          };
        });
      };

      connection.on("ReceiveNotification", handleReceiveNotification);
      connection.on("TicketListUpdated", handleTicketListUpdated);
      connection.on("NewTicketAdded", handleNewTicketAdded);

      return () => {
        console.log('Layout Component: Cleaning up global SignalR event handlers.');
        connection.off("ReceiveNotification", handleReceiveNotification);
        connection.off("TicketListUpdated", handleTicketListUpdated);
        connection.off("NewTicketAdded", handleNewTicketAdded);
      };
    }
  }, [isConnected, connection, queryClient, enqueueSnackbar, addNotification, addNewTicketId, navigate]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="div"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Header />
        <Box
          id="main-content"
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;