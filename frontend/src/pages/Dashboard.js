import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, CircularProgress, Alert } from '@mui/material';
import ProductionControl from '../components/ProductionControl';
import BatchParameters from '../components/BatchParameters';
import ParametersChart from '../components/ParametersChart';
import NotificationsPanel from '../components/NotificationsPanel';
import { getCurrentParameters, simulateParameter } from '../api';

const Dashboard = ({ simulationInterval, setSimulationInterval }) => {
  const [activeBatch, setActiveBatch] = useState(null);
  const [currentParameters, setCurrentParameters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  
  // Получение текущих параметров
  const fetchCurrentParameters = async () => {
    if (!activeBatch) {
      setCurrentParameters(null);
      return;
    }
    
    try {
      const response = await getCurrentParameters();
      setCurrentParameters(response.data);
    } catch (err) {
      console.error('Ошибка при получении текущих параметров:', err);
      // Не показываем ошибку на UI, так как это автоматическое обновление
    }
  };
  
  // Обновляем параметры при изменении активной партии
  useEffect(() => {
    fetchCurrentParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBatch]);
  
  // Обработчик изменения активной партии
  const handleBatchChange = (batch) => {
    setActiveBatch(batch);
  };
  
  // Функция для симуляции параметров
  const simulateParameterOnce = async () => {
    if (!activeBatch) return;
    
    setLoading(true);
    setError('');
    
    try {
      await simulateParameter(activeBatch.id);
      // Обновляем текущие параметры после симуляции
      fetchCurrentParameters();
    } catch (err) {
      console.error('Ошибка при симуляции параметров:', err);
      setError('Не удалось симулировать параметры');
    } finally {
      setLoading(false);
    }
  };
  
  // Запуск/остановка автоматической симуляции
  const toggleSimulation = () => {
    if (simulating) {
      // Остановка симуляции
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
      setSimulating(false);
    } else {
      // Запуск симуляции
      simulateParameterOnce(); // Сразу запускаем первую симуляцию
      
      // Настраиваем интервал
      const interval = setInterval(simulateParameterOnce, 3000);
      setSimulationInterval(interval);
      setSimulating(true);
    }
  };
  
  return (
    <Box>
      <ProductionControl 
        onBatchChange={handleBatchChange}
        simulationInterval={simulationInterval}
        setSimulationInterval={setSimulationInterval}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <BatchParameters 
            activeBatch={activeBatch} 
            currentParameters={currentParameters} 
          />
          
          <ParametersChart 
            activeBatch={activeBatch} 
            currentParameters={currentParameters} 
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          {activeBatch && (
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="contained" 
                color={simulating ? "error" : "primary"} 
                onClick={toggleSimulation}
                disabled={loading || !activeBatch}
                sx={{ width: '100%', py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 
                  (simulating ? "Остановить симуляцию" : "Запустить симуляцию")}
              </Button>
            </Box>
          )}
          
          <NotificationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 