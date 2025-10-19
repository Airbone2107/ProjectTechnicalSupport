import React, { useState, useEffect, useCallback } from 'react';
import { getPermissionRequests, approveRequest, rejectRequest } from '../api/permissionService';
import { PermissionRequest } from 'types/entities';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, IconButton, Box, Button, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ReviewPermissionPage: React.FC = () => {
    const [requests, setRequests] = useState<PermissionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchRequests = useCallback(() => {
        setLoading(true);
        getPermissionRequests({ pendingOnly: true })
            .then(res => res.succeeded && setRequests(res.data.items))
            .finally(() => setLoading(false));
    }, []);

    useEffect(fetchRequests, [fetchRequests]);

    const handleProcess = async (id: number, action: 'approve' | 'reject') => {
        const notes = prompt(`Nhập ghi chú cho hành động '${action}':`);
        if (notes === null) return; // User cancelled

        try {
            if (action === 'approve') {
                await approveRequest(id, { notes });
            } else {
                await rejectRequest(id, { notes });
            }
            alert(`Yêu cầu đã được ${action} thành công.`);
            fetchRequests();
        } catch (err) {
            alert('Xử lý yêu cầu thất bại.');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Pending Permission Requests
            </Typography>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Requester</TableCell>
                            <TableCell>Permission</TableCell>
                            <TableCell>Justification</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.requester.displayName}</TableCell>
                                <TableCell>
                                    <Chip label={req.requestedPermission} color="secondary" size="small" />
                                </TableCell>
                                <TableCell>{req.justification}</TableCell>
                                <TableCell>
                                    <Chip label={req.status} color="warning" size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleProcess(req.id, 'approve')}
                                        sx={{ mr: 1 }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleProcess(req.id, 'reject')}
                                    >
                                        Reject
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
             {requests.length === 0 && (
                <Typography sx={{ mt: 3, textAlign: 'center' }}>No pending requests.</Typography>
            )}
        </Paper>
    );
};

export default ReviewPermissionPage; 