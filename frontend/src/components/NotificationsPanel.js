import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, List, ListItem, ListItemText, 
  Chip, Divider, Button, CircularProgress, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { getNotifications, markAllRead } from '../api';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Ошибка при получении уведомлений:', err);
      setError('Не удалось получить уведомления');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
    
    // Настраиваем интервал для автоматического обновления уведомлений
    const interval = setInterval(fetchNotifications, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error('Ошибка при отметке уведомлений как прочитанных:', err);
      setError('Не удалось отметить уведомления как прочитанные');
    }
  };
  
  const getNotificationColor = (type) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'info';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Уведомления</Typography>
        
        <Box>
          <IconButton 
            size="small" 
            onClick={fetchNotifications} 
            disabled={loading}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<DeleteSweepIcon />}
            onClick={handleMarkAllRead}
            disabled={loading || notifications.filter(n => !n.is_read).length === 0}
          >
            Отметить прочитанными
          </Button>
        </Box>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {!loading && notifications.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography color="text.secondary">
            Нет уведомлений
          </Typography>
        </Box>
      )}
      
      {!loading && notifications.length > 0 && (
        <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem alignItems="flex-start" sx={{ opacity: notification.is_read ? 0.7 : 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="subtitle2"
                        sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}
                      >
                        {notification.message}
                      </Typography>
                      <Chip 
                        label={
                          notification.notification_type === 'error' ? 'Ошибка' :
                          notification.notification_type === 'warning' ? 'Предупреждение' :
                          notification.notification_type === 'success' ? 'Успех' : 'Информация'
                        }
                        size="small"
                        color={getNotificationColor(notification.notification_type)}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationsPanel; 