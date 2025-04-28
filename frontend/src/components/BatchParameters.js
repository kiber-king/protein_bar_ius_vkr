import React from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

const BatchParameters = ({ activeBatch, currentParameters }) => {
  // Форматирование процента брака
  const formatDefectPercentage = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Текущие параметры производства</Typography>
      
      <Grid container spacing={3}>
        {/* Статистика партии */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Статистика партии
              </Typography>
              
              {activeBatch ? (
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th">Номер партии:</TableCell>
                        <TableCell>{activeBatch.batch_number}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Время начала:</TableCell>
                        <TableCell>{new Date(activeBatch.start_time).toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Общее количество:</TableCell>
                        <TableCell>{activeBatch.total_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Количество брака:</TableCell>
                        <TableCell>{activeBatch.defect_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Процент брака:</TableCell>
                        <TableCell sx={{
                          color: activeBatch.defect_percentage > 10 ? 'error.main' : 
                                 activeBatch.defect_percentage > 5 ? 'warning.main' : 'success.main'
                        }}>
                          {formatDefectPercentage(activeBatch.defect_percentage)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Производство не запущено
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Текущие параметры */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Технологические параметры
              </Typography>
              
              {currentParameters ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Параметр</TableCell>
                        <TableCell>Значение</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th">Температура</TableCell>
                        <TableCell>{currentParameters.temperature.toFixed(1)} °C</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              width: 15, 
                              height: 15, 
                              borderRadius: '50%', 
                              bgcolor: (currentParameters.temperature < 160 || currentParameters.temperature > 180) ? 'error.main' : 'success.main',
                              display: 'inline-block'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Давление</TableCell>
                        <TableCell>{currentParameters.pressure.toFixed(2)} атм</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              width: 15, 
                              height: 15, 
                              borderRadius: '50%', 
                              bgcolor: (currentParameters.pressure < 2.0 || currentParameters.pressure > 3.0) ? 'error.main' : 'success.main',
                              display: 'inline-block'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Скорость перемешивания</TableCell>
                        <TableCell>{currentParameters.mixing_speed.toFixed(1)} об/мин</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              width: 15, 
                              height: 15, 
                              borderRadius: '50%', 
                              bgcolor: (currentParameters.mixing_speed < 55.0 || currentParameters.mixing_speed > 65.0) ? 'error.main' : 'success.main',
                              display: 'inline-block'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Толщина глазури</TableCell>
                        <TableCell>{currentParameters.glazing_thickness.toFixed(2)} мм</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              width: 15, 
                              height: 15, 
                              borderRadius: '50%', 
                              bgcolor: (currentParameters.glazing_thickness < 1.8 || currentParameters.glazing_thickness > 2.2) ? 'error.main' : 'success.main',
                              display: 'inline-block'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет данных о параметрах
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BatchParameters; 