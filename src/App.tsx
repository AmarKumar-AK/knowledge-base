import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './pages/HomePage';
import ViewDocumentPage from './pages/ViewDocumentPage';
import EditDocumentPage from './pages/EditDocumentPage';
import FolderPage from './pages/FolderPage';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/folder/:id" element={<FolderPage />} />
          <Route path="/view/:id" element={<ViewDocumentPage />} />
          <Route path="/edit/:id" element={<EditDocumentPage />} />
          <Route path="/edit" element={<EditDocumentPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
