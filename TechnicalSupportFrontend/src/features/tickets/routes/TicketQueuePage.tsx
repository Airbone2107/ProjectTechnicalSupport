import React, { useState, useMemo } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { getTickets } from '../api/ticketService';
import { Ticket, TicketFilterParams } from 'types/entities';
import { TicketStatus } from 'types/enums';
import LoadingSpinner from 'components/LoadingSpinner';
import TicketCard from '../components/TicketCard';
import { Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Button, Stack, Tabs, Tab, Pagination } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

type TabValue = 'assigned' | 'active' | 'onHold' | 'archive' | 'unassigned' | 'all';

const TICKET_PAGE_SIZE = 10;

const TicketQueuePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  
  const [searchFilters, setSearchFilters] = useState<{ searchQuery?: string, priority?: string, statuses?: string[] }>({});
  const [page, setPage] = useState(1);
  
  const isAgent = user?.role.includes('Agent');
  const isTicketManager = hasPermission('tickets:assign_to_group');

  const agentTabs: { label: string; value: TabValue }[] = [
    { label: 'Assigned to Me', value: 'assigned' },
    { label: 'Active in My Groups', value: 'active' },
    { label: 'On Hold in My Groups', value: 'onHold' },
    { label: 'Archived in My Groups', value: 'archive' },
  ];

  const managerTabs: { label: string; value: TabValue }[] = [
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'All Tickets', value: 'all' },
  ];

  const availableTabs = useMemo(() => [
    ...(isAgent ? agentTabs : []),
    ...(isTicketManager ? managerTabs : []),
  ], [isAgent, isTicketManager]);

  const [activeTab, setActiveTab] = useState<TabValue>(availableTabs[0]?.value || 'assigned');

  const queryParams: TicketFilterParams = useMemo(() => {
    let tabParams: TicketFilterParams = {};
    switch (activeTab) {
      case 'assigned':
        tabParams = { myTicket: true, statuses: [TicketStatus.Open, TicketStatus.InProgress, TicketStatus.OnHold] };
        break;
      case 'active':
        tabParams = { myGroupTicket: true, statuses: [TicketStatus.Open, TicketStatus.InProgress] };
        break;
      case 'onHold':
        tabParams = { myGroupTicket: true, statuses: [TicketStatus.OnHold] };
        break;
      case 'archive':
        tabParams = { myGroupTicket: true, statuses: [TicketStatus.Resolved, TicketStatus.Closed] };
        break;
      case 'unassigned':
        tabParams = { unassignedToGroupOnly: true };
        break;
      case 'all':
        tabParams = {};
        break;
    }
    return {
      ...searchFilters,
      ...tabParams,
      pageNumber: page,
      pageSize: TICKET_PAGE_SIZE,
    };
  }, [activeTab, searchFilters, page]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tickets', queryParams], // queryKey phụ thuộc vào tất cả các tham số
    queryFn: () => getTickets(queryParams),
    placeholderData: (previousData) => previousData, // Giữ dữ liệu cũ khi đang fetch dữ liệu mới
  });
  
  const tickets = data?.succeeded ? data.data.items : [];
  const totalCount = data?.succeeded ? data.data.totalCount : 0;
  // Tính toán lại tổng số trang từ dữ liệu (có thể là dữ liệu cũ hoặc mới)
  const totalPages = data?.succeeded ? Math.ceil(data.data.totalCount / TICKET_PAGE_SIZE) : 0;


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | any) => {
    const { name, value } = e.target;
    setPage(1);
    setSearchFilters(prev => ({ ...prev, [name]: value === "" ? undefined : value }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setSearchFilters({});
    setPage(1);
  };
  
  const resetFilters = () => {
    setSearchFilters({});
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Ticket Queue</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          {availableTabs.map(tab => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField 
            name="searchQuery" 
            label="Search by Keyword/ID" 
            variant="outlined"
            size="small"
            fullWidth
            value={searchFilters.searchQuery || ''} 
            onChange={handleFilterChange} 
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={searchFilters.priority || ''} label="Priority" onChange={handleFilterChange}>
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          {isTicketManager && activeTab === 'all' && (
             <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="statuses"
                multiple
                value={searchFilters.statuses || []}
                label="Status"
                onChange={handleFilterChange}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {Object.values(TicketStatus).map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button onClick={resetFilters} variant="outlined">Reset</Button>
        </Stack>
      </Paper>

      {isLoading ? (
        <LoadingSpinner message="Loading ticket queue..." />
      ) : isError ? (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
            <Typography>Error: {error.message}</Typography>
        </Paper>
      ) : (
        <>
            <Stack spacing={2}>
            {tickets.length > 0 ? (
                tickets.map(t => <TicketCard key={t.ticketId} ticket={t} />)
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No tickets found matching your criteria.</Typography>
                </Paper>
            )}
            </Stack>

            {totalCount > TICKET_PAGE_SIZE && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 2 }}>
                <Pagination
                count={totalPages}
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

export default TicketQueuePage; 