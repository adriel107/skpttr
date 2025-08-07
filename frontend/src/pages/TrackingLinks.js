import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTrackingLink,
  fetchTrackingLinks,
  deleteTrackingLink,
  toggleLinkStatus,
  clearError,
  clearCreateError,
} from '../store/slices/trackingSlice';

const TrackingLinks = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: '',
    campaignName: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { links, loading, error, createLoading, createError } = useSelector(
    (state) => state.tracking
  );

  useEffect(() => {
    dispatch(fetchTrackingLinks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.campaignId.trim()) {
      newErrors.campaignId = 'ID da campanha é obrigatório';
    }
    
    if (!formData.campaignName.trim()) {
      newErrors.campaignName = 'Nome da campanha é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createTrackingLink(formData)).unwrap();
      setOpenDialog(false);
      setFormData({ campaignId: '', campaignName: '' });
      setErrors({});
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Tem certeza que deseja deletar este link de rastreamento?')) {
      try {
        await dispatch(deleteTrackingLink(linkId)).unwrap();
      } catch (error) {
        // Error is handled by the Redux slice
      }
    }
  };

  const handleToggleStatus = async (linkId) => {
    try {
      await dispatch(toggleLinkStatus(linkId)).unwrap();
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  const handleCopyLink = (trackingUrl) => {
    navigator.clipboard.writeText(trackingUrl);
    // You could add a toast notification here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Links de Rastreamento
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Novo Link
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campanha</TableCell>
                <TableCell>ID da Campanha</TableCell>
                <TableCell>Link de Rastreamento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : links.length > 0 ? (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {link.campaign_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {link.campaign_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {link.tracking_url}
                        </Typography>
                        <Tooltip title="Copiar link">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyLink(link.tracking_url)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={link.is_active ? 'Ativo' : 'Inativo'}
                        color={link.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(link.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title={link.is_active ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(link.id)}
                          >
                            {link.is_active ? (
                              <PauseIcon fontSize="small" />
                            ) : (
                              <PlayIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(link.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum link de rastreamento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para criar novo link */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Link de Rastreamento</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              name="campaignId"
              label="ID da Campanha"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.campaignId}
              onChange={handleChange}
              error={!!errors.campaignId}
              helperText={errors.campaignId}
              disabled={createLoading}
            />
            
            <TextField
              margin="dense"
              name="campaignName"
              label="Nome da Campanha"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.campaignName}
              onChange={handleChange}
              error={!!errors.campaignName}
              helperText={errors.campaignName}
              disabled={createLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} disabled={createLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createLoading}
              startIcon={createLoading ? <CircularProgress size={20} /> : null}
            >
              {createLoading ? 'Criando...' : 'Criar Link'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrackingLinks; 