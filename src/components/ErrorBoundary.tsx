import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error en la aplicación:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyError = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    const errorText = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(errorText)
      .then(() => {
        alert('Detalles del error copiados al portapapeles');
      })
      .catch(() => {
        alert('No se pudo copiar el error. Por favor, toma una captura de pantalla');
      });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              maxWidth: '100%',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5" color="error" gutterBottom>
                ¡Ups! Algo salió mal
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                {this.state.error?.message || 'Ha ocurrido un error inesperado'}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detalles del error:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100',
                    maxHeight: '200px',
                    overflow: 'auto',
                    fontSize: '0.8rem'
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {this.state.error?.stack}
                  </pre>
                </Paper>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  fullWidth
                >
                  Recargar la aplicación
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleCopyError}
                  startIcon={<ContentCopyIcon />}
                  fullWidth
                >
                  Copiar error
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Si el problema persiste, por favor comparte los detalles del error con el soporte técnico.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 