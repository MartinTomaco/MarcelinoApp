import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Driver } from '../types';

interface DriversConfigProps {
  drivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
}

export const DriversConfig: React.FC<DriversConfigProps> = ({
  drivers,
  onDriversChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState<'taxi' | 'remise'>('taxi');
  const [vehicleColor, setVehicleColor] = useState('#1976d2');
  const [active, setActive] = useState(true);

  const handleAddDriver = () => {
    setEditingDriver(null);
    setName('');
    setVehicleType('taxi');
    setVehicleColor('#1976d2');
    setActive(true);
    setIsDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setVehicleType(driver.vehicleType);
    setVehicleColor(driver.vehicleColor);
    setActive(driver.active);
    setIsDialogOpen(true);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (drivers.length > 1) {
      const updatedDrivers = drivers.filter(d => d.id !== driverId);
      onDriversChange(updatedDrivers);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingDriver) {
      // Editar conductor existente
      const updatedDrivers = drivers.map(d =>
        d.id === editingDriver.id
          ? { ...d, name, vehicleType, vehicleColor, active }
          : d
      );
      onDriversChange(updatedDrivers);
    } else {
      // Agregar nuevo conductor
      const newDriver: Driver = {
        id: Date.now().toString(),
        name: name.trim(),
        vehicleType,
        vehicleColor,
        active,
      };
      onDriversChange([...drivers, newDriver]);
    }

    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Gestión de Conductores
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddDriver}
          >
            Agregar Conductor
          </Button>
        </Stack>

        <List>
          {drivers.map((driver) => (
            <ListItem
              key={driver.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                backgroundColor: driver.active ? 'background.paper' : 'grey.100',
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: driver.vehicleColor,
                  mr: 2,
                  border: 1,
                  borderColor: 'divider',
                }}
              />
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {driver.name}
                    </Typography>
                    <Chip
                      label={driver.vehicleType === 'taxi' ? 'Taxi' : 'Remise'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {!driver.active && (
                      <Chip
                        label="Inactivo"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                }
                secondary={`Color: ${driver.vehicleColor}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleEditDriver(driver)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                {drivers.length > 1 && (
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteDriver(driver.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={isDialogOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDriver ? 'Editar Conductor' : 'Agregar Conductor'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nombre del Conductor"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Vehículo</InputLabel>
              <Select
                value={vehicleType}
                label="Tipo de Vehículo"
                onChange={(e) => setVehicleType(e.target.value as 'taxi' | 'remise')}
              >
                <MenuItem value="taxi">Taxi</MenuItem>
                <MenuItem value="remise">Remise</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Color del Vehículo"
              fullWidth
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              type="color"
              InputProps={{
                style: { height: 56 }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              }
              label="Conductor Activo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 