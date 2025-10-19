import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const UnauthorizedPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <BlockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          403 - Forbidden
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Bạn không có quyền truy cập vào trang này.
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          color="primary"
        >
          Quay về Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage; 