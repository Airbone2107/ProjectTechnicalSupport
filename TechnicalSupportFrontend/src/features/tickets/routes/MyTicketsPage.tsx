import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getTickets } from '../api/ticketService';
import { Ticket, TicketFilterParams } from 'types/entities';
import LoadingSpinner from 'components/LoadingSpinner';
import { Box, Typography, Button, Stack, Card, CardActionArea, CardContent, Chip, Paper, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type StatusColor = "info" | "warning" | "success" | "default" | "error";

const statusMapping: Record<string, { color: StatusColor, borderColor: string }> = {
  "Open": { color: "info", borderColor: 'info.main' },
  "In Progress": { color: "warning", borderColor: 'warning.main' },
  "Resolved": { color: "success", borderColor: 'success.main' },
  "Closed": { color: "default", borderColor: 'grey.500' },
  "On Hold": { color: "error", borderColor: 'error.main' },
};

const priorityMapping: Record<string, StatusColor> = {
  "High": "error",
  "Medium": "warning",
  "Low": "success",
};

const PAGE_SIZE = 10;

const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params: TicketFilterParams = { 
      pageNumber: page, 
      pageSize: PAGE_SIZE,
      createdByMe: true 
    };
    
    getTickets(params)
      .then((response) => {
        if (response.succeeded) {
          setTickets(response.data.items);
          setTotalCount(response.data.totalCount);
        } else {
          console.error("Failed to fetch tickets:", response.message);
          setTickets([]);
          setTotalCount(0);
        }
      })
      .catch((error) => console.error("Error fetching tickets:", error))
      .finally(() => setLoading(false));
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusInfo = (statusName: string) => {
    return statusMapping[statusName] || { color: "default", borderColor: 'grey.500' };
  };

  if (loading) return <LoadingSpinner message="Đang tải các ticket của bạn..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">My Support Tickets</Typography>
        <Button
          component={RouterLink}
          to="/tickets/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Tạo Ticket Mới
        </Button>
      </Box>

      {tickets.length === 0 ? (
        <Paper sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6">Bạn chưa tạo ticket nào.</Typography>
          <Button component={RouterLink} to="/tickets/new" sx={{ mt: 2 }}>
            Tạo ticket đầu tiên của bạn
          </Button>
        </Paper>
      ) : (
        <>
            <Stack spacing={2}>
            {tickets.map((t) => (
                <Card 
                key={t.ticketId} 
                sx={{ borderLeft: 5, borderColor: getStatusInfo(t.status.name).borderColor }}
                >
                <CardActionArea onClick={() => navigate(`/tickets/${t.ticketId}`)}>
                    <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>{t.title}</Typography>
                        <Chip
                        label={t.priority}
                        color={priorityMapping[t.priority] || 'default'}
                        size="small"
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        #{t.ticketId} &bull; Cập nhật lần cuối: {new Date(t.updatedAt).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                        label={t.status.name}
                        color={getStatusInfo(t.status.name).color}
                        variant="outlined"
                        size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                        Giao cho: {t.assignee?.displayName || 'Chưa gán'}
                        </Typography>
                    </Box>
                    </CardContent>
                </CardActionArea>
                </Card>
            ))}
            </Stack>

            {totalCount > PAGE_SIZE && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                    <Pagination
                        count={Math.ceil(totalCount / PAGE_SIZE)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
        </>
      )}
    </Box>
  );
};

export default MyTicketsPage; 