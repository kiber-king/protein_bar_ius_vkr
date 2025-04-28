import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getParameters } from '../api';

// Регистрация компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ParametersChart = ({ activeBatch, currentParameters }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    const fetchBatchParameters = async () => {
      if (!activeBatch) {
        setChartData(null);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const response = await getParameters(activeBatch.id);
        const parameters = response.data;
        
        if (parameters.length === 0) {
          setError('Нет данных для отображения на графике');
          setChartData(null);
          return;
        }
        
        const timestamps = parameters.map(param => {
          const date = new Date(param.timestamp);
          return date.toLocaleTimeString();
        }).reverse();
        
        const temperatureData = parameters.map(param => param.temperature).reverse();
        const pressureData = parameters.map(param => param.pressure).reverse();
        const mixingSpeedData = parameters.map(param => param.mixing_speed).reverse();
        const glazingThicknessData = parameters.map(param => param.glazing_thickness).reverse();
        
        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: 'Температура (°C)',
              data: temperatureData,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'temperature',
            },
            {
              label: 'Давление (атм)',
              data: pressureData,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              yAxisID: 'pressure',
            },
            {
              label: 'Скорость перемешивания (об/мин)',
              data: mixingSpeedData,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              yAxisID: 'mixingSpeed',
            },
            {
              label: 'Толщина глазури (мм)',
              data: glazingThicknessData,
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              yAxisID: 'glazingThickness',
            },
          ],
        });
        
      } catch (err) {
        console.error('Ошибка при получении параметров партии:', err);
        setError('Не удалось получить параметры партии для графика');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBatchParameters();
  }, [activeBatch, currentParameters]);
  
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      temperature: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Температура (°C)',
        },
        min: 150,
        max: 190,
        grid: {
          drawOnChartArea: false,
        },
      },
      pressure: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Давление (атм)',
        },
        min: 1.5,
        max: 3.5,
        grid: {
          drawOnChartArea: false,
        },
      },
      mixingSpeed: {
        type: 'linear',
        display: false,
        position: 'right',
        min: 50,
        max: 70,
      },
      glazingThickness: {
        type: 'linear',
        display: false,
        position: 'right',
        min: 1.5,
        max: 2.5,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Параметры производства в реальном времени',
      },
    },
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        График параметров
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {!loading && !error && chartData && (
        <Box sx={{ height: 400 }}>
          <Line options={chartOptions} data={chartData} />
        </Box>
      )}
      
      {!loading && !error && !chartData && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {activeBatch ? 'Нет данных для отображения' : 'Запустите производство для отображения графика'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ParametersChart; 