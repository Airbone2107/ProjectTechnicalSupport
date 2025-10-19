import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';

const DashboardPage: React.FC = () => {
    const { user, hasPermission } = useAuth();

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Chào mừng, {user?.displayName}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Đây là tổng quan nhanh về hệ thống hỗ trợ.
            </Typography>
            <Grid container spacing={3}>
                {hasPermission('tickets:read_own') && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h3">My Tickets</Typography>
                                <Typography color="text.secondary">Xem và quản lý các yêu cầu hỗ trợ của bạn.</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={RouterLink} to="/my-tickets" size="small">Đi đến My Tickets</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )}
                {hasPermission('tickets:create') && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h3">New Ticket</Typography>
                                <Typography color="text.secondary">Cần giúp đỡ? Tạo một ticket mới ngay bây giờ.</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={RouterLink} to="/tickets/new" size="small">Tạo Ticket</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )}
                {hasPermission('tickets:read_queue') && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h3">Ticket Queue</Typography>
                                <Typography color="text.secondary">Xem và quản lý các ticket đã và chưa được gán.</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={RouterLink} to="/tickets" size="small">Đi đến Ticket Queue</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )}
                {hasPermission('users:manage') && (
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h3">User Management</Typography>
                                <Typography color="text.secondary">Quản lý người dùng và vai trò của họ.</Typography>
                            </CardContent>
                            <CardActions>
                                <Button component={RouterLink} to="/admin/users" size="small">Quản lý Người dùng</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default DashboardPage;