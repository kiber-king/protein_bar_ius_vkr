import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';

const AppHeader = () => {
  const location = useLocation();
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ИУС по производству протеиновых батончиков
          </Typography>
          
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<DashboardIcon />}
            sx={{ 
              mx: 1, 
              color: location.pathname === '/' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid white',
              }
            }}
          >
            Панель управления
          </Button>
          
          <Button
            component={Link}
            to="/settings"
            color="inherit"
            startIcon={<SettingsIcon />}
            sx={{ 
              mx: 1, 
              color: location.pathname === '/settings' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              borderBottom: location.pathname === '/settings' ? '2px solid white' : 'none',
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid white',
              }
            }}
          >
            Настройки
          </Button>
          
          <Button
            component={Link}
            to="/history"
            color="inherit"
            startIcon={<HistoryIcon />}
            sx={{ 
              mx: 1, 
              color: location.pathname === '/history' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              borderBottom: location.pathname === '/history' ? '2px solid white' : 'none',
              borderRadius: 0,
              '&:hover': {
                borderBottom: '2px solid white',
              }
            }}
          >
            История
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default AppHeader; 