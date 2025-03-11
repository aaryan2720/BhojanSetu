import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Dark green
      light: '#4CAF50', // Medium green
      dark: '#1B5E20', // Deeper green
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784', // Light green
      light: '#A5D6A7',
      dark: '#66BB6A',
      contrastText: '#000000',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F',
    },
    background: {
      default: '#F5F7F5', // Light greenish background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B5E20', // Dark green for primary text
      secondary: '#558B2F', // Medium green for secondary text
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2E7D32', // Dark green app bar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#E8F5E9', // Very light green for table headers
          color: '#1B5E20',
          fontWeight: 'bold',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h2: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h3: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h4: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h5: {
      color: '#1B5E20',
      fontWeight: 600,
    },
    h6: {
      color: '#1B5E20',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(46, 125, 50, 0.1)',
    '0 4px 8px rgba(46, 125, 50, 0.1)',
    '0 8px 16px rgba(46, 125, 50, 0.1)',
    '0 12px 24px rgba(46, 125, 50, 0.1)',
    // ... rest of the shadows array
  ],
});

export default theme; 