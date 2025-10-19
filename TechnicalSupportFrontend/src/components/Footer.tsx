import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        p: 2,
        mt: 'auto',
        backgroundColor: '#fff',
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Technical Support System ©{new Date().getFullYear()}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Version 1.0.0
      </Typography>
    </Box>
  );
};

export default Footer;