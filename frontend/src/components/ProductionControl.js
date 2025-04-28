import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, CircularProgress, 
  Alert, Grid, Card, CardContent 
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { startProduction, stopProduction, getBatches } from '../api';

const ProductionControl = ({ onBatchChange, simulationInterval, setSimulationInterval }) => {
  const [loading, setLoading] = useState(false);
  const [activeBatch, setActiveBatch] = useState(null);
  const [error, setError] = useState('');
  
  const fetchActiveBatch = async () => {
    try {
      const response = await getBatches();
      const batches = response.data;
      const active = batches.find(batch => batch.is_active);
      setActiveBatch(active || null);
      if (active && onBatchChange) {
        onBatchChange(active);
      }
    } catch (err) {
      console.error('Ошибка при получении активной партии:', err);
      setError('Не удалось получить информацию о текущей партии');
    }
  };
  
  useEffect(() => {
    fetchActiveBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleStartProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await startProduction();
      setActiveBatch(response.data);
      if (onBatchChange) {
        onBatchChange(response.data);
      }
      
      // Очистить предыдущий интервал, если он есть
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    } catch (err) {
      console.error('Ошибка при запуске производства:', err);
      setError('Не удалось запустить производство');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStopProduction = async () => {
    if (!activeBatch) return;
    
    setLoading(true);
    setError('');
    try {
      await stopProduction(activeBatch.id);
      setActiveBatch(null);
      if (onBatchChange) {
        onBatchChange(null);
      }
      
      // Остановить симуляцию при остановке производства
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
    } catch (err) {
      console.error('Ошибка при остановке производства:', err);
      setError('Не удалось остановить производство');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Управление производством</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Статус производства
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', color: activeBatch ? 'green' : 'red' }}>
                  {activeBatch ? 'Активно' : 'Остановлено'}
                </Typography>
                {activeBatch && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Текущая партия: {activeBatch.batch_number}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Управление
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartProduction}
                    disabled={loading || activeBatch !== null}
                    sx={{ minWidth: '150px' }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Старт'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleStopProduction}
                    disabled={loading || activeBatch === null}
                    sx={{ minWidth: '150px' }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Стоп'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductionControl; 