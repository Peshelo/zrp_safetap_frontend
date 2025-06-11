'use client';
import { useState, useEffect } from 'react';
import pb from "@/app/lib/connection";
import Link from "next/link";
import {
  AttachMoney as DollarSign,
  People as Users,
  CreditCard,
  TrendingUp as Activity,
  Map as MapIcon,
  Assignment as CasesIcon,
  CheckCircle as ResolvedIcon,
  HourglassEmpty as OngoingIcon,
  LockOpen as OpenIcon,
} from "@mui/icons-material";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function MerchantDashboard() {
  const theme = useTheme();
  const [totalCases, setTotalCases] = useState([]);
  const [totalOpenCases, setOpenCases] = useState([]);
  const [totalOngoingCases, setOngoingCases] = useState([]);
  const [totalResolvedCases, setResolvedCases] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const fetchStatistics = async () => {
    let cases = [];
    let openCases = [];
    let ongoingCases = [];
    let resolvedCases = [];

    try {
      cases = await pb.collection('cases').getFullList({
        sort: '-created',
      });
      openCases = (await pb.collection('cases').getList(1, 50, { filter: 'status="Open"' })).items;
      ongoingCases = (await pb.collection('cases').getList(1, 50, { filter: 'status="Ongoing"' })).items;
      resolvedCases = (await pb.collection('cases').getList(1, 50, { filter: 'status="Resolved"' })).items;

    } catch (e) {
      setSnackbar({
        open: true,
        message: e.message,
        severity: 'error',
      });
    }
    setTotalCases(cases);
    setOpenCases(openCases);
    setOngoingCases(ongoingCases);
    setResolvedCases(resolvedCases);
    setLoading(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => {
    return (
      <Card sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.2)} 0%, ${alpha(theme.palette[color].light, 0.1)} 100%)`,
        borderLeft: `4px solid ${theme.palette[color].main}`,
        borderRadius: '8px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[4],
        }
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="h4" mt={1} color={theme.palette[color].dark} fontWeight={700}>
                {isLoading ? <Skeleton width={60} /> : value}
              </Typography>
            </Box>
            <Box sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              p: 1.5,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ color: theme.palette[color].main, fontSize: '28px' }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'primary';
      case 'Ongoing': return 'secondary';
      case 'Resolved': return 'success';
      default: return 'info';
    }
  };

  return (
    <PageContainer title="Merchant Dashboard" description="Merchant case management dashboard">
      <Box sx={{ 
        background: theme.palette.background.default,
        minHeight: '100vh',
        py: 4,
        px: { xs: 2, md: 4 },
      }}>
        <Grid container spacing={3}>
          {/* Top Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Cases"
                  value={totalCases?.length}
                  icon={CasesIcon}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Open Cases"
                  value={totalOpenCases?.length}
                  icon={OpenIcon}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ongoing Cases"
                  value={totalOngoingCases?.length}
                  icon={OngoingIcon}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Resolved Cases"
                  value={totalResolvedCases?.length}
                  icon={ResolvedIcon}
                  color="success"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Ongoing Cases Table */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Ongoing Cases
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      A list of all ongoing cases requiring attention
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      component={Link}
                      href="/merchant/cases"
                      variant="contained"
                      size="small"
                      endIcon={<Activity fontSize="small" />}
                      sx={{
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      View All
                    </Button>
                    <Button
                      component={Link}
                      href="/merchant/map-view"
                      variant="outlined"
                      size="small"
                      startIcon={<MapIcon fontSize="small" />}
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': { borderColor: 'primary.dark' }
                      }}
                    >
                      Open Map
                    </Button>
                  </Box>
                </Box>

                <TableContainer component={Paper} sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Address</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Case ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill().map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={5}>
                              <Skeleton variant="text" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : totalOngoingCases.length > 0 ? (
                        totalOngoingCases.map(mycase => (
                          <TableRow key={mycase.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                            <TableCell>
                              <Typography fontWeight="600">{mycase?.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {mycase?.description}
                              </Typography>
                            </TableCell>
                            <TableCell>{mycase?.address}</TableCell>
                            <TableCell>
                              <Chip
                                label={mycase?.status}
                                color={getStatusColor(mycase?.status)}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  minWidth: 80,
                                  textTransform: 'uppercase'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={mycase?.id.slice(0, 8)}
                                color="info"
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: `${getPriorityColor(mycase?.priority)}.main`,
                                  boxShadow: `0 0 0 3px ${alpha(theme.palette[getPriorityColor(mycase?.priority)].main, 0.2)}`,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No ongoing cases found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Cases List */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
                  Recent Cases
                </Typography>
                <List sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto',
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                }}>
                  {isLoading ? (
                    Array(5).fill().map((_, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <ListItemText
                          primary={<Skeleton width="80%" />}
                          secondary={<Skeleton width="60%" />}
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                    ))
                  ) : totalCases.length > 0 ? (
                    totalCases.map(mycase => (
                      <ListItem
                        key={mycase.id}
                        sx={{
                          px: 0,
                          py: 1.5,
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                            borderRadius: '8px',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: `${getStatusColor(mycase?.status)}.light`, 
                            color: `${getStatusColor(mycase?.status)}.dark`,
                            fontWeight: 600,
                          }}>
                            {mycase?.title.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography fontWeight={600}>
                              {mycase?.title.toUpperCase()}
                            </Typography>
                          }
                          secondary={mycase?.address}
                          secondaryTypographyProps={{ color: 'text.secondary' }}
                        />
                        <Chip
                          label={mycase?.status}
                          color={getStatusColor(mycase?.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            minWidth: 80,
                            textTransform: 'uppercase'
                          }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                      No cases found
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: theme.shadows[4],
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}