import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Autocomplete, TextField, Box } from '@mui/material';
import { getGroups } from 'features/groups/api/groupService';
import { assignTicketToGroup } from '../api/ticketService';
import { Group } from 'types/entities';

interface AssignToGroupModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: number;
  onSuccess: () => void;
}

export const AssignToGroupModal: React.FC<AssignToGroupModalProps> = ({ open, onClose, ticketId, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');
    setSelectedGroup(null);
    try {
      const groupRes = await getGroups();
      if (groupRes.succeeded) {
        setGroups(groupRes.data);
      } else {
        throw new Error(groupRes.message || 'Failed to load groups.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [open]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    setError('');
    try {
      await assignTicketToGroup(ticketId, selectedGroup.groupId);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to assign ticket.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Ticket #{ticketId} to Group</DialogTitle>
      <DialogContent sx={{ minHeight: '150px' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box> : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Autocomplete
              options={groups}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Select a support group" variant="outlined" />}
              value={selectedGroup}
              onChange={(event, newValue) => setSelectedGroup(newValue)}
              isOptionEqualToValue={(option, value) => option.groupId === value.groupId}
              sx={{ mt: 1 }}
              disabled={!!error}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained" disabled={loading || !selectedGroup || !!error}>
          {loading ? <CircularProgress size={24} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 