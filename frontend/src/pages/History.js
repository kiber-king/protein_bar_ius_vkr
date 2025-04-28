import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Collapse,
  Chip, Accordion, AccordionSummary, AccordionDetails,
  Grid, Card, CardContent, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getBatches, getParameters } from '../api';

// Компонент для отображения строки партии в таблице
const BatchRow = ({ batch, onExpandChange }) => {
  const [open, setOpen] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const toggleOpen = () => {
    setOpen(!open);
    if (!open && parameters.length === 0) {
      fetchParameters();
    }
    if (onExpandChange) {
      onExpandChange(!open);
    }
  };
  
  const fetchParameters = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getParameters(batch.id);
      setParameters(response.data);
    } catch (err) {
      console.error('Ошибка при получении параметров партии:', err);
      setError('Не удалось получить параметры партии');
    } finally {
      setLoading(false);
    }
  };
  
  // Форматирование времени
  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
  };
  
  // Форматирование процента брака
  const formatDefectPercentage = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };
  
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={toggleOpen}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {batch.batch_number}
        </TableCell>
        <TableCell>{formatDateTime(batch.start_time)}</TableCell>
        <TableCell>{batch.end_time ? formatDateTime(batch.end_time) : 'В процессе'}</TableCell>
        <TableCell>{batch.total_count}</TableCell>
        <TableCell>{batch.defect_count}</TableCell>
        <TableCell>
          <Chip 
            label={formatDefectPercentage(batch.defect_percentage)}
            color={
              batch.defect_percentage > 10 ? 'error' : 
              batch.defect_percentage > 5 ? 'warning' : 'success'
            }
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={batch.is_active ? 'Активна' : 'Завершена'} 
            color={batch.is_active ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, mb: 3 }}>
              <Typography variant="h6" gutterBottom component="div">
                Параметры партии
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {!loading && parameters.length === 0 && !error && (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  Нет данных о параметрах для этой партии
                </Typography>
              )}
              
              {!loading && parameters.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Время</TableCell>
                        <TableCell>Температура (°C)</TableCell>
                        <TableCell>Давление (атм)</TableCell>
                        <TableCell>Скорость (об/мин)</TableCell>
                        <TableCell>Глазурь (мм)</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parameters.map((param) => (
                        <TableRow key={param.id} sx={{ 
                          bgcolor: param.is_defect ? 'rgba(239, 83, 80, 0.1)' : 'inherit' 
                        }}>
                          <TableCell>{formatDateTime(param.timestamp)}</TableCell>
                          <TableCell>{param.temperature.toFixed(1)}</TableCell>
                          <TableCell>{param.pressure.toFixed(2)}</TableCell>
                          <TableCell>{param.mixing_speed.toFixed(1)}</TableCell>
                          <TableCell>{param.glazing_thickness.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={param.is_defect ? 'Брак' : 'Норма'} 
                              color={param.is_defect ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Основной компонент страницы истории
const History = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalItems: 0,
    totalDefects: 0,
    avgDefectPercentage: 0,
  });
  
  // Получение всех партий
  const fetchBatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getBatches();
      const fetchedBatches = response.data;
      setBatches(fetchedBatches);
      
      // Расчет статистики
      if (fetchedBatches.length > 0) {
        const totalItems = fetchedBatches.reduce((sum, batch) => sum + batch.total_count, 0);
        const totalDefects = fetchedBatches.reduce((sum, batch) => sum + batch.defect_count, 0);
        const avgDefectPercentage = totalItems > 0 ? (totalDefects / totalItems) * 100 : 0;
        
        setStats({
          totalBatches: fetchedBatches.length,
          totalItems,
          totalDefects,
          avgDefectPercentage,
        });
      }
    } catch (err) {
      console.error('Ошибка при получении партий:', err);
      setError('Не удалось получить историю партий');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBatches();
  }, []);
  
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        История производства
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Всего партий
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalBatches}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Всего батончиков
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Всего брака
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalDefects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Средний % брака
              </Typography>
              <Typography variant="h4" component="div" sx={{
                color: stats.avgDefectPercentage > 10 ? 'error.main' : 
                       stats.avgDefectPercentage > 5 ? 'warning.main' : 'success.main'
              }}>
                {stats.avgDefectPercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper elevation={3}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">История партий</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!loading && batches.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                Нет данных о партиях
              </Typography>
            )}
            
            {!loading && batches.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Номер партии</TableCell>
                      <TableCell>Время начала</TableCell>
                      <TableCell>Время окончания</TableCell>
                      <TableCell>Всего</TableCell>
                      <TableCell>Брак</TableCell>
                      <TableCell>% Брака</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((batch) => (
                      <BatchRow 
                        key={batch.id} 
                        batch={batch} 
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default History; 