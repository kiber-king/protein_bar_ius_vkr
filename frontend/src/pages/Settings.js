import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getSettings, createSetting, updateSetting, deleteSetting, activateSetting } from '../api';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    temperature: '',
    pressure: '',
    mixing_speed: '',
    glazing_thickness: ''
  });
  
  // Загрузка настроек
  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getSettings();
      setSettings(response.data);
    } catch (err) {
      console.error('Ошибка при получении настроек:', err);
      setError('Не удалось получить настройки производства');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Открытие диалога для создания настройки
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setCurrentSetting(null);
    setFormData({
      name: '',
      temperature: '170',
      pressure: '2.5',
      mixing_speed: '60',
      glazing_thickness: '2.0'
    });
    setOpenDialog(true);
  };
  
  // Открытие диалога для редактирования настройки
  const handleOpenEditDialog = (setting) => {
    setEditMode(true);
    setCurrentSetting(setting);
    setFormData({
      name: setting.name,
      temperature: setting.temperature.toString(),
      pressure: setting.pressure.toString(),
      mixing_speed: setting.mixing_speed.toString(),
      glazing_thickness: setting.glazing_thickness.toString()
    });
    setOpenDialog(true);
  };
  
  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Название обязательно';
    }
    
    const temperature = parseFloat(formData.temperature);
    if (isNaN(temperature) || temperature < 150 || temperature > 190) {
      errors.temperature = 'Температура должна быть между 150 и 190°C';
    }
    
    const pressure = parseFloat(formData.pressure);
    if (isNaN(pressure) || pressure < 1.5 || pressure > 3.5) {
      errors.pressure = 'Давление должно быть между 1.5 и 3.5 атм';
    }
    
    const mixingSpeed = parseFloat(formData.mixing_speed);
    if (isNaN(mixingSpeed) || mixingSpeed < 50 || mixingSpeed > 70) {
      errors.mixing_speed = 'Скорость перемешивания должна быть между 50 и 70 об/мин';
    }
    
    const glazingThickness = parseFloat(formData.glazing_thickness);
    if (isNaN(glazingThickness) || glazingThickness < 1.5 || glazingThickness > 2.5) {
      errors.glazing_thickness = 'Толщина глазури должна быть между 1.5 и 2.5 мм';
    }
    
    return errors;
  };
  
  // Сохранение настройки
  const handleSaveSetting = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      // Если есть ошибки валидации, показываем первую
      setError(Object.values(errors)[0]);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = {
        name: formData.name,
        temperature: parseFloat(formData.temperature),
        pressure: parseFloat(formData.pressure),
        mixing_speed: parseFloat(formData.mixing_speed),
        glazing_thickness: parseFloat(formData.glazing_thickness),
        is_active: false
      };
      
      if (editMode && currentSetting) {
        await updateSetting(currentSetting.id, data);
      } else {
        await createSetting(data);
      }
      
      fetchSettings();
      handleCloseDialog();
    } catch (err) {
      console.error('Ошибка при сохранении настройки:', err);
      setError('Не удалось сохранить настройку производства');
    } finally {
      setLoading(false);
    }
  };
  
  // Удаление настройки
  const handleDeleteSetting = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту настройку?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await deleteSetting(id);
      fetchSettings();
    } catch (err) {
      console.error('Ошибка при удалении настройки:', err);
      setError('Не удалось удалить настройку производства');
    } finally {
      setLoading(false);
    }
  };
  
  // Активация настройки
  const handleActivateSetting = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      await activateSetting(id);
      fetchSettings();
    } catch (err) {
      console.error('Ошибка при активации настройки:', err);
      setError('Не удалось активировать настройку производства');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Настройки производства</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenCreateDialog}
            disabled={loading}
          >
            Добавить настройку
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && settings.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Нет настроек производства. Создайте первую настройку.
          </Typography>
        )}
        
        {!loading && settings.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Температура (°C)</TableCell>
                  <TableCell>Давление (атм)</TableCell>
                  <TableCell>Скорость (об/мин)</TableCell>
                  <TableCell>Глазурь (мм)</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id} sx={{ bgcolor: setting.is_active ? 'rgba(76, 175, 80, 0.1)' : 'inherit' }}>
                    <TableCell>{setting.name}</TableCell>
                    <TableCell>{setting.temperature}</TableCell>
                    <TableCell>{setting.pressure}</TableCell>
                    <TableCell>{setting.mixing_speed}</TableCell>
                    <TableCell>{setting.glazing_thickness}</TableCell>
                    <TableCell>
                      {setting.is_active ? (
                        <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
                          Активна
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">
                          Неактивна
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(setting)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteSetting(setting.id)}
                          disabled={setting.is_active}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        
                        {!setting.is_active && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="success"
                            onClick={() => handleActivateSetting(setting.id)}
                            sx={{ ml: 1 }}
                          >
                            Активировать
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Редактирование настройки' : 'Создание новой настройки'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название настройки"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Температура (°C)"
                  name="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ step: 0.1 }}
                  helperText="Допустимые значения: 150-190°C"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Давление (атм)"
                  name="pressure"
                  type="number"
                  value={formData.pressure}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ step: 0.01 }}
                  helperText="Допустимые значения: 1.5-3.5 атм"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Скорость перемешивания (об/мин)"
                  name="mixing_speed"
                  type="number"
                  value={formData.mixing_speed}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ step: 0.1 }}
                  helperText="Допустимые значения: 50-70 об/мин"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Толщина глазури (мм)"
                  name="glazing_thickness"
                  type="number"
                  value={formData.glazing_thickness}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ step: 0.01 }}
                  helperText="Допустимые значения: 1.5-2.5 мм"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleSaveSetting} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 