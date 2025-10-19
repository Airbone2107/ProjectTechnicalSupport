import React, { useState, useEffect, useCallback } from 'react';
import { getGroups, createGroup, getGroupMembers, addGroupMember, removeGroupMember, getAssignableUsers } from '../api/groupService';
import { Group, User } from 'types/entities';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  Grid, Paper, Typography, List, ListItem, ListItemButton, ListItemText, Divider, Box, TextField, Button,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Stack, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const GroupManagementPage: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [userToAdd, setUserToAdd] = useState<User | null>(null);

    const fetchGroups = useCallback(() => {
        setLoading(true);
        getGroups().then(res => res.succeeded && setGroups(res.data)).finally(() => setLoading(false));
    }, []);

    const fetchAssignableUsers = useCallback(() => {
        getAssignableUsers().then(res => {
            if (res.succeeded) {
                setAssignableUsers(res.data);
            }
        });
    }, []);

    useEffect(() => {
        fetchGroups();
        fetchAssignableUsers();
    }, [fetchGroups, fetchAssignableUsers]);

    const handleSelectGroup = (group: Group) => {
        setSelectedGroup(group);
        setLoadingDetails(true);
        setUserToAdd(null); // Reset lựa chọn user khi đổi group
        getGroupMembers(group.groupId).then(res => res.succeeded && setMembers(res.data)).finally(() => setLoadingDetails(false));
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        await createGroup({ name: newGroupName });
        setNewGroupName('');
        fetchGroups();
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup || !userToAdd) return;
        await addGroupMember(selectedGroup.groupId, { userId: userToAdd.id });
        setUserToAdd(null); // Reset Autocomplete
        
        const currentGroup = { ...selectedGroup };
        handleSelectGroup(currentGroup);
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedGroup || !window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;
        await removeGroupMember(selectedGroup.groupId, userId);
        
        const currentGroup = { ...selectedGroup };
        handleSelectGroup(currentGroup);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Group Management</Typography>
            <Grid container spacing={3}>
                <Grid
                    size={{
                        xs: 12,
                        md: 4
                    }}>
                    <Typography variant="h6">Support Groups</Typography>
                    <List component="nav">
                        {groups.map(g => (
                            <ListItemButton key={g.groupId} selected={selectedGroup?.groupId === g.groupId} onClick={() => handleSelectGroup(g)}>
                                <ListItemText primary={g.name} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box component="form" onSubmit={handleCreateGroup} sx={{ p: 1 }}>
                        <Typography variant="subtitle1">Create New Group</Typography>
                        <TextField fullWidth label="Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} margin="normal" size="small" />
                        <Button type="submit" fullWidth variant="contained">Create</Button>
                    </Box>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 8
                    }}>
                    {selectedGroup ? (
                        <>
                            <Typography variant="h6">Members of {selectedGroup.name}</Typography>
                            {loadingDetails ? <LoadingSpinner /> : (
                                <>
                                    <TableContainer sx={{ mt: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {members.map(m => (
                                                    <TableRow key={m.id}>
                                                        <TableCell>{m.displayName}</TableCell>
                                                        <TableCell>{m.email}</TableCell>
                                                        <TableCell>
                                                            <IconButton color="error" onClick={() => handleRemoveMember(m.id)}><DeleteIcon /></IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Divider sx={{ my: 3 }} />
                                    <Box component="form" onSubmit={handleAddMember}>
                                        <Typography variant="subtitle1">Add Member</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={assignableUsers.filter(u => !members.some(m => m.id === u.id))}
                                                getOptionLabel={(option) => `${option.displayName} (${option.email})`}
                                                renderInput={(params) => <TextField {...params} label="Search and Select User" />}
                                                value={userToAdd}
                                                onChange={(event, newValue: User | null) => {
                                                    setUserToAdd(newValue);
                                                }}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                            />
                                            <Button type="submit" variant="contained" disabled={!userToAdd}>Add</Button>
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                            <Typography>Select a group to manage its members</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
};

export default GroupManagementPage;