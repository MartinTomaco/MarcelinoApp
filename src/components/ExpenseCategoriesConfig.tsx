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
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ExpenseCategory } from '../types';

interface ExpenseCategoriesConfigProps {
  categories: ExpenseCategory[];
  onCategoriesChange: (categories: ExpenseCategory[]) => void;
}

export const ExpenseCategoriesConfig: React.FC<ExpenseCategoriesConfigProps> = ({
  categories,
  onCategoriesChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1976d2');

  const handleAddCategory = () => {
    setEditingCategory(null);
    setName('');
    setColor('#1976d2');
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length > 1) {
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      onCategoriesChange(updatedCategories);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingCategory) {
      // Editar categoría existente
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, name: name.trim(), color }
          : c
      );
      onCategoriesChange(updatedCategories);
    } else {
      // Agregar nueva categoría
      const newCategory: ExpenseCategory = {
        id: Date.now().toString(),
        name: name.trim(),
        color,
      };
      onCategoriesChange([...categories, newCategory]);
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
            Categorías de Gastos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
          >
            Agregar Categoría
          </Button>
        </Stack>

        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: category.color,
                  mr: 2,
                  border: 1,
                  borderColor: 'divider',
                }}
              />
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="medium">
                    {category.name}
                  </Typography>
                }
                secondary={`Color: ${category.color}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleEditCategory(category)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                {categories.length > 1 && (
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteCategory(category.id)}
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
          {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nombre de la Categoría"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <TextField
              label="Color"
              fullWidth
              value={color}
              onChange={(e) => setColor(e.target.value)}
              type="color"
              InputProps={{
                style: { height: 56 }
              }}
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