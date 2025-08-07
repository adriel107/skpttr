import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Assessment,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCampaignReports,
  fetchSalesData,
  clearError,
} from '../store/slices/reportsSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);

  const dispatch = useDispatch();
  const {
    campaignReports,
    salesData,
    campaignsLoading,
    campaignsError,
    salesLoading,
    salesError,
  } = useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchCampaignReports());
    dispatch(fetchSalesData());
  }, [dispatch]);

  useEffect(() => {
    if (campaignsError || salesError) {
      dispatch(clearError());
    }
  }, [dispatch, campaignsError, salesError]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Análise detalhada do desempenho das suas campanhas e vendas
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="reports tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Relatórios de Campanhas" />
          <Tab label="Dados de Vendas" />
        </Tabs>

        {/* Relatórios de Campanhas */}
        <TabPanel value={tabValue} index={0}>
          {campaignsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {campaignsError}
            </Alert>
          )}

          {campaignsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Cards de métricas */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Total de Campanhas
                          </Typography>
                          <Typography variant="h4" component="div">
                            {campaignReports.length}
                          </Typography>
                        </Box>
                        <Assessment color="primary" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Vendas Totais
                          </Typography>
                          <Typography variant="h4" component="div">
                            {campaignReports.reduce((sum, campaign) => sum + (campaign.total_sales || 0), 0)}
                          </Typography>
                        </Box>
                        <AttachMoney color="success" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Valor Total
                          </Typography>
                          <Typography variant="h4" component="div">
                            {formatCurrency(
                              campaignReports.reduce((sum, campaign) => sum + (campaign.total_value || 0), 0)
                            )}
                          </Typography>
                        </Box>
                        <TrendingUp color="info" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Taxa Média
                          </Typography>
                          <Typography variant="h4" component="div">
                            {campaignReports.length > 0
                              ? (campaignReports.reduce((sum, campaign) => sum + (campaign.conversion_rate || 0), 0) / campaignReports.length).toFixed(1)
                              : 0}%
                          </Typography>
                        </Box>
                        <Assessment color="secondary" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabela de campanhas */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campanha</TableCell>
                      <TableCell>Vendas</TableCell>
                      <TableCell>Valor Total</TableCell>
                      <TableCell>Taxa de Conversão</TableCell>
                      <TableCell>Período</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaignReports.length > 0 ? (
                      campaignReports.map((campaign) => (
                        <TableRow key={campaign.campaign_id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {campaign.campaign_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {campaign.total_sales || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(campaign.total_value)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {campaign.conversion_rate || 0}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.period_start && campaign.period_end
                                ? `${new Date(campaign.period_start).toLocaleDateString('pt-BR')} - ${new Date(campaign.period_end).toLocaleDateString('pt-BR')}`
                                : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Nenhum relatório de campanha encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* Dados de Vendas */}
        <TabPanel value={tabValue} index={1}>
          {salesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {salesError}
            </Alert>
          )}

          {salesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campanha</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status UTMify</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.length > 0 ? (
                    salesData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {sale.campaign_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(sale.sale_value)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(sale.utmify_status)}
                            color={getStatusColor(sale.utmify_status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(sale.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma venda encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports; 