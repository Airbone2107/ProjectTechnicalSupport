import React, { useState, useEffect, useCallback } from 'react';
import { getProblemTypes, createProblemType, updateProblemType, deleteProblemType } from '../api/problemTypeService';
import { getGroups } from 'features/groups/api/groupService';
import { ProblemType, Group } from 'types/entities';
import { CreateProblemTypeModel } from 'types/models';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, IconButton, Box, Button, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ProblemTypeManagementPage: React.FC = () => {
    const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedType, setSelectedType] = useState<ProblemType | null>(null);
    const [modalData, setModalData] = useState<CreateProblemTypeModel>({ name: '', description: '', groupId: null });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const fetchAllData = useCallback(() => {
        setLoading(true);
        Promise.all([getProblemTypes(), getGroups()])
            .then(([typesRes, groupsRes]) => {
                if(typesRes.succeeded) setProblemTypes(typesRes.data);
                if(groupsRes.succeeded) setGroups(groupsRes.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const openModal = (mode: 'add' | 'edit', type: ProblemType | null = null) => {
        setModalMode(mode);
        setSelectedType(type);
        setModalData(type ? { name: type.name, description: type.description || '', groupId: type.groupId || null } : { name: '', description: '', groupId: null });
        setModalError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedType(null);
    };

    const handleModalDataChange = (e: React.ChangeEvent<HTMLInputElement | any>) => {
        const { name, value } = e.target;
        setModalData({ ...modalData, [name]: value === '' ? null : value });
    };

    const handleSave = async () => {
        setModalLoading(true);
        setModalError('');
        try {
            if (modalMode === 'add') {
                await createProblemType(modalData);
            } else if (selectedType) {
                await updateProblemType(selectedType.problemTypeId, modalData);
            }
            fetchAllData();
            closeModal();
        } catch (err: any) {
            setModalError(err.response?.data?.message || `Failed to ${modalMode} problem type.`);
        } finally {
            setModalLoading(false);
        }
    };
    
    const handleDelete = async (type: ProblemType) => {
        if (window.confirm(`Bạn có chắc muốn xóa loại vấn đề "${type.name}"?`)) {
            await deleteProblemType(type.problemTypeId);
            fetchAllData();
        }
    }

    return (
        <>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1">Problem Type Management</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal('add')}>
                        Add New Type
                    </Button>
                </Box>
                
                {loading ? <LoadingSpinner /> : (
                  <TableContainer>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Description</TableCell>
                                  <TableCell>Default Group</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {problemTypes.map(type => (
                                  <TableRow key={type.problemTypeId}>
                                      <TableCell>{type.name}</TableCell>
                                      <TableCell>{type.description}</TableCell>
                                      <TableCell>{groups.find(g => g.groupId === type.groupId)?.name || 'N/A'}</TableCell>
                                      <TableCell align="right">
                                          <IconButton onClick={() => openModal('edit', type)} color="primary"><EditIcon /></IconButton>
                                          <IconButton onClick={() => handleDelete(type)} color="error"><DeleteIcon /></IconButton>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
                )}
            </Paper>

            <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
                <DialogTitle>{modalMode === 'add' ? 'Add New Problem Type' : `Edit: ${selectedType?.name}`}</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
                    <TextField autoFocus margin="dense" name="name" label="Name" type="text" fullWidth variant="standard" value={modalData.name} onChange={handleModalDataChange} required/>
                    <TextField margin="dense" name="description" label="Description" type="text" fullWidth multiline rows={3} variant="standard" value={modalData.description} onChange={handleModalDataChange} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="group-select-label">Default Group (Optional)</InputLabel>
                        <Select name="groupId" labelId="group-select-label" value={modalData.groupId || ''} label="Default Group (Optional)" onChange={handleModalDataChange}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            {groups.map(g => <MenuItem key={g.groupId} value={g.groupId}>{g.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleSave} disabled={modalLoading}>
                        {modalLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProblemTypeManagementPage; 