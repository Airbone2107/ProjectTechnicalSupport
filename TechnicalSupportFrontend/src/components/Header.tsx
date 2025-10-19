import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { AppBar, Toolbar, Typography, Box, Chip, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from 'features/notifications/components/NotificationBell';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRoles = user?.role ? (Array.isArray(user.role) ? user.role.join(', ') : user.role) : 'Client';

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Box này đẩy các item sang phải */}
        <Box sx={{ flexGrow: 1 }} /> 
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationBell />
          <Typography>
            Xin chào, <strong>{user?.displayName || 'User'}</strong>
          </Typography>
          <Chip label={userRoles} color="primary" variant="outlined" size="small" />
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          >
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;