import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Card,
  CardContent
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VideocamIcon from '@mui/icons-material/Videocam';
import { startProduction, stopProduction, startCamera, stopCamera, processFrame } from '../api';

const ComputerVision = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  // При монтировании компонента проверяем текущее состояние производства
  useEffect(() => {
    // Здесь можно добавить логику проверки активной партии
  }, []);

  const handleStartProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await startProduction();
      setIsActive(true);
      setActiveBatchId(response.data.id);
      
      // Запуск камеры автоматически после старта производства
      await handleStartCamera();
    } catch (err) {
      console.error('Ошибка при запуске производства:', err);
      setError('Не удалось запустить производство');
    } finally {
      setLoading(false);
    }
  };

  const handleStopProduction = async () => {
    if (!isActive || !activeBatchId) return;
    
    setLoading(true);
    setError('');
    try {
      await stopProduction(activeBatchId);
      setIsActive(false);
      setActiveBatchId(null);
      
      // Останавливаем камеру при остановке производства
      await handleStopCamera();
    } catch (err) {
      console.error('Ошибка при остановке производства:', err);
      setError('Не удалось остановить производство');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCamera = async () => {
    try {
      await startCamera();
      setCameraActive(true);
      
      // Здесь будет код для запуска реальной камеры
      console.log('Камера запущена');
    } catch (err) {
      console.error('Ошибка при запуске камеры:', err);
      setError('Не удалось запустить камеру');
    }
  };

  const handleStopCamera = async () => {
    try {
      await stopCamera();
      setCameraActive(false);
      
      // Здесь будет код для остановки реальной камеры
      console.log('Камера остановлена');
    } catch (err) {
      console.error('Ошибка при остановке камеры:', err);
      setError('Не удалось остановить камеру');
    }
  };

  const handleProcessFrame = async () => {
    try {
      // Обработка кадра с помощью YOLO
      const response = await processFrame();
      console.log('Обработан кадр:', response.data);
    } catch (err) {
      console.error('Ошибка при обработке кадра:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Компьютерное зрение
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Управление производством с компьютерным зрением
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartProduction}
                  disabled={isActive || loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Запустить производство'}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopProduction}
                  disabled={!isActive || loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Остановить производство'}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" align="center">
                      Статус
                    </Typography>
                    <Typography variant="body1" color={isActive ? 'success.main' : 'error.main'} align="center" sx={{ fontWeight: 'bold' }}>
                      {isActive ? 'Активно' : 'Остановлено'}
                    </Typography>
                    {cameraActive && (
                      <Typography variant="body2" color="info.main" align="center">
                        Камера активна
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Видео с камеры
            </Typography>
            
            {/* Место для отображения видео потока */}
            <Box 
              sx={{ 
                width: '100%', 
                height: '300px', 
                backgroundColor: '#000', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              {cameraActive ? (
                <img
                src="/images/cv-sample.png"
                alt="Computer Vision demo"
                width={640}
                height={480}
                style={{ objectFit: 'contain', border: '1px solid #ccc' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: '#fff' }}>
                  <VideocamIcon sx={{ fontSize: 60, opacity: 0.7, mb: 2 }} />
                  <Typography>
                    Здесь будет видео с распознаванием YOLO
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComputerVision; 