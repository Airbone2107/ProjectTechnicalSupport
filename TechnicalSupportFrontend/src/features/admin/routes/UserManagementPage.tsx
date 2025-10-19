import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser, updateUser, getAllRoles, updateUserRoles } from '../api/adminService';
import { UserDetail, UserFilterParams } from 'types/entities';
import LoadingSpinner from 'components/LoadingSpinner';
import { useAuth } from 'contexts/AuthContext';
import {
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, IconButton, Chip, Box, Button, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, CircularProgress, Alert, Tabs, Tab, Stack, Pagination,
  FormControl, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const UserManagementPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    
    // Modals states
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isRolesModalOpen, setRolesModalOpen] = useState(false);

    const [editModalData, setEditModalData] = useState({ displayName: '', expertise: '' });
    const [rolesModalData, setRolesModalData] = useState<string[]>([]);
    
    const [currentPassword, setCurrentPassword] = useState('');
    
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    
    const [filters, setFilters] = useState<UserFilterParams>({ pageNumber: 1, pageSize: 10 });
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(() => {
        setLoading(true);
        const params: UserFilterParams = {
            ...filters,
            displayNameQuery: searchQuery || undefined,
            role: activeTab === 'All' ? undefined : activeTab,
        };
        getUsers(params)
            .then(res => {
                if (res.succeeded) {
                    setUsers(res.data.items);
                    setTotalCount(res.data.totalCount);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [filters, activeTab, searchQuery]);

    useEffect(() => {
        fetchUsers();
        if (hasPermission(['users:manage'])) {
            getAllRoles().then(res => res.succeeded && setAllRoles(res.data));
        }
    }, [fetchUsers, hasPermission]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
        setFilters(prev => ({ ...prev, pageNumber: 1 }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setFilters(prev => ({ ...prev, pageNumber: value }));
    };
    
    const handleSearchOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setFilters(prev => ({ ...prev, pageNumber: 1 }));
            fetchUsers();
        }
    }

    const openEditModal = (user: UserDetail) => {
        setSelectedUser(user);
        setEditModalData({ displayName: user.displayName, expertise: user.expertise || '' });
        setEditModalOpen(true);
        setModalError('');
    };

    const openRolesModal = (user: UserDetail) => {
        setSelectedUser(user);
        setRolesModalData(user.roles);
        setRolesModalOpen(true);
        setModalError('');
    };
    
    const closeModal = () => {
        setEditModalOpen(false);
        setRolesModalOpen(false);
        setSelectedUser(null);
        setCurrentPassword('');
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setModalLoading(true);
        setModalError('');
        try {
            await updateUser(selectedUser.id, {
                displayName: editModalData.displayName,
                expertise: editModalData.expertise
            });
            fetchUsers();
            closeModal();
        } catch (err: any) {
            setModalError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setModalLoading(false);
        }
    };
    
    const handleRolesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setRolesModalData(prev => 
            checked ? [...prev, name] : prev.filter(role => role !== name)
        );
    };

    const handleUpdateRoles = async () => {
        if (!selectedUser) return;
        setModalLoading(true);
        setModalError('');
        try {
            await updateUserRoles(selectedUser.id, { roles: rolesModalData, currentPassword });
            fetchUsers();
            closeModal();
        } catch (err: any) {
            setModalError(err.response?.data?.message || 'Failed to update roles.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (userId: string, displayName: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa người dùng "${displayName}"? Hành động này không thể hoàn tác.`)) {
            try {
                await deleteUser(userId);
                alert("Đã xóa người dùng thành công.");
                fetchUsers();
            } catch (err) {
                alert("Xóa người dùng thất bại.");
            }
        }
    };

    return (
        <>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>User Management</Typography>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="user roles tabs">
                        <Tab label="All" value="All" />
                        <Tab label="Clients" value="Client" />
                        <Tab label="Agents" value="Agent" />
                        <Tab label="Group Managers" value="Group Manager" />
                        <Tab label="Ticket Managers" value="Ticket Manager" />
                        <Tab label="User Managers" value="Manager" />
                        <Tab label="Admins" value="Admin" />
                    </Tabs>
                </Box>
                
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField 
                        label="Search by Display Name"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchOnEnter}
                        variant="outlined"
                        size="small"
                        fullWidth
                    />
                    <Button variant="contained" onClick={fetchUsers}>Search</Button>
                </Stack>

                {loading ? <LoadingSpinner /> : (
                  <>
                      <TableContainer>
                          <Table sx={{ minWidth: 650 }}>
                              <TableHead>
                                  <TableRow>
                                      <TableCell>Display Name</TableCell>
                                      <TableCell>Email</TableCell>
                                      <TableCell>Roles</TableCell>
                                      <TableCell>Expertise</TableCell>
                                      <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                              </TableHead>
                              <TableBody>
                                  {users.map(user => (
                                      <TableRow key={user.id}>
                                          <TableCell>{user.displayName}</TableCell>
                                          <TableCell>{user.email}</TableCell>
                                          <TableCell><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{user.roles.map(r => <Chip key={r} label={r} size="small" />)}</Box></TableCell>
                                          <TableCell>{user.expertise || 'N/A'}</TableCell>
                                          <TableCell align="right">
                                              <IconButton onClick={() => openEditModal(user)} color="primary"><EditIcon /></IconButton>
                                              {hasPermission(['users:manage']) && <IconButton onClick={() => openRolesModal(user)} color="secondary"><ManageAccountsIcon /></IconButton>}
                                              <IconButton onClick={() => handleDelete(user.id, user.displayName)} color="error"><DeleteIcon /></IconButton>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </TableContainer>
                      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                          <Pagination
                              count={Math.ceil(totalCount / filters.pageSize!)}
                              page={filters.pageNumber}
                              onChange={handlePageChange}
                              color="primary"
                          />
                      </Box>
                  </>
                )}
                {!loading && users.length === 0 && (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                        Không tìm thấy người dùng nào phù hợp.
                    </Typography>
                )}
            </Paper>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onClose={closeModal} fullWidth maxWidth="xs">
                <DialogTitle>Edit User: {selectedUser?.displayName}</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
                    <TextField autoFocus margin="dense" name="displayName" label="Display Name" type="text" fullWidth variant="standard" value={editModalData.displayName} onChange={(e) => setEditModalData({ ...editModalData, displayName: e.target.value })} />
                    <TextField margin="dense" name="expertise" label="Expertise" type="text" fullWidth variant="standard" value={editModalData.expertise} onChange={(e) => setEditModalData({ ...editModalData, expertise: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleUpdateUser} disabled={modalLoading}>{modalLoading ? <CircularProgress size={24} /> : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* Manage Roles Modal */}
            <Dialog open={isRolesModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
                <DialogTitle>Manage Roles: {selectedUser?.displayName}</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
                    <Stack spacing={2}>
                        <FormControl component="fieldset" variant="standard">
                            <FormGroup>
                                {allRoles.filter(r => r !== "Admin").map(role => (
                                    <FormControlLabel
                                        key={role}
                                        control={<Checkbox checked={rolesModalData.includes(role)} onChange={handleRolesChange} name={role} />}
                                        label={role}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                        <Box>
                            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                                Để xác nhận thay đổi, vui lòng nhập mật khẩu của bạn:
                            </Typography>
                            <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="currentPassword"
                                name="currentPassword"
                                label="Mật khẩu của bạn"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleUpdateRoles} disabled={modalLoading || !currentPassword}>
                        {modalLoading ? <CircularProgress size={24} /> : 'Save Roles'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserManagementPage; 