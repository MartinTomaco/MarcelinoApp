import React, { useRef } from 'react';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import { generateBackup, restoreFromBackup } from '../services/localStorage';

export const BackupRestore: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateBackup = () => {
    const backupData = generateBackup();
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `marcelino-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (restoreFromBackup(content)) {
        alert('Respaldo restaurado exitosamente');
        window.location.reload(); // Recargar la página para actualizar los datos
      } else {
        alert('Error al restaurar el respaldo');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ 
      p: 2,
      '@media (max-width:370px)': { 
        p: 1 
      }
    }}>
      <Paper elevation={3} sx={{ 
        p: 2,
        '@media (max-width:370px)': { 
          p: 1 
        }
      }}>
        <Typography variant="h6" gutterBottom>
          Respaldo y Restauración de Datos
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateBackup}
            fullWidth
          >
            Generar Respaldo
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Restaurar Respaldo
          </Button>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleRestoreBackup}
          />
        </Stack>
      </Paper>
    </Box>
  );
}; 