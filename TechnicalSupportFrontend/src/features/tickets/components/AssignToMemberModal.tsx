import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Autocomplete, TextField, Box } from '@mui/material';
import { getGroupMembers } from 'features/groups/api/groupService';
import { assignTicket } from '../api/ticketService';
import { User } from 'types/entities';

interface AssignToMemberModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: number;
  groupId: number;
  onSuccess: () => void;
}

export const AssignToMemberModal: React.FC<AssignToMemberModalProps> = ({ open, onClose, ticketId, groupId, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');
    setSelectedMember(null);
    try {
      const memberRes = await getGroupMembers(groupId);
      if (memberRes.succeeded) {
        setMembers(memberRes.data);
      } else {
        throw new Error(memberRes.message || 'Failed to load group members.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [open, groupId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedMember) return;
    setLoading(true);
    setError('');
    try {
      await assignTicket(ticketId, selectedMember.id);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to assign ticket.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Ticket #{ticketId} to Member</DialogTitle>
      <DialogContent sx={{ minHeight: '150px' }}>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box> : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Autocomplete
              options={members}
              getOptionLabel={(option) => `${option.displayName} (${option.email})`}
              renderInput={(params) => <TextField {...params} label="Select a member from the group" variant="outlined" />}
              value={selectedMember}
              onChange={(event, newValue) => setSelectedMember(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ mt: 1 }}
              disabled={!!error}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained" disabled={loading || !selectedMember || !!error}>
          {loading ? <CircularProgress size={24} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 