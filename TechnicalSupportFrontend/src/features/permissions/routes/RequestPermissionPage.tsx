import React, { useState } from 'react';
import { createPermissionRequest } from '../api/permissionService';
import { Container, Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';

const RequestPermissionPage: React.FC = () => {
    const [permission, setPermission] = useState('');
    const [justification, setJustification] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await createPermissionRequest({ requestedPermission: permission, justification });
            setMessage('Yêu cầu đã được gửi thành công!');
            setPermission('');
            setJustification('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gửi yêu cầu thất bại.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Request Special Permission
                </Typography>
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Permission"
                        value={permission}
                        onChange={e => setPermission(e.target.value)}
                        placeholder="e.g., ROLE:Manager"
                        required
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        label="Justification"
                        value={justification}
                        onChange={e => setJustification(e.target.value)}
                        placeholder="Explain why you need this permission..."
                        required
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default RequestPermissionPage; 