'use client';
import { useState, useEffect } from 'react';
import pb from '@/app/lib/connection';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { 
  useTheme, Grid, Stack, Typography, Avatar, Box, Card, CardContent, 
  Button, IconButton, MenuItem, Select, InputLabel, FormControl, Paper,
  CircularProgress
} from '@mui/material';
import {
  IconAlertCircle, IconCheck, IconX, IconMapPin, 
  IconNews, IconMessageCircle, IconRefresh
} from '@tabler/icons-react';
import DashboardCard from '@/app/components/shared/DashboardCard';

export default function SystemAnalyticsDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [stats, setStats] = useState({
    violations: { total: 0, sorted: 0 },
    cases: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    stations: { total: 0, active: 0 },
    publications: { total: 0 },
    recentActivity: [],
    trends: {
      violations: [0, 0, 0, 0, 0, 0], // Last 6 months data
      cases: [0, 0, 0, 0, 0, 0]
    }
  });

  // Helper function to get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    const range = parseInt(timeRange);
    
    if (timeRange === 'all') {
      return { start: new Date(0), end: now };
    }
    
    const start = new Date();
    start.setDate(now.getDate() - range);
    return { start, end: now };
  };

  // Fetch all system data
  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const dateFilter = `created >= '${start.toISOString()}' && created <= '${end.toISOString()}'`;

      // Fetch data with date filtering
      const [violations, cases, stations, publications] = await Promise.all([
        pb.collection('traffic_violations').getFullList({ filter: dateFilter }),
        pb.collection('cases').getFullList({ filter: dateFilter }),
        pb.collection('contacts').getFullList({ filter: dateFilter }),
        pb.collection('news').getFullList({ filter: dateFilter })
      ]);

      // Calculate statistics
      const sortedViolations = violations.filter(v => v.isSorted).length;
      const openCases = cases.filter(c => c.status === 'Open').length;
      const inProgressCases = cases.filter(c => c.status === 'In Progress').length;
      const resolvedCases = cases.filter(c => c.status === 'Resolved').length;
      const activeStations = stations.filter(s => s.active).length;

      // Generate trend data (simplified - in a real app you'd query by month)
      const violationsTrend = Array(6).fill(0).map((_, i) => 
        violations.filter(v => 
          new Date(v.created).getMonth() === (new Date().getMonth() - i + 12) % 12
        ).length
      ).reverse();

      const casesTrend = Array(6).fill(0).map((_, i) => 
        cases.filter(c => 
          new Date(c.created).getMonth() === (new Date().getMonth() - i + 12) % 12
        ).length
      ).reverse();

      setStats({
        violations: {
          total: violations.length,
          sorted: sortedViolations
        },
        cases: {
          total: cases.length,
          open: openCases,
          inProgress: inProgressCases,
          resolved: resolvedCases
        },
        stations: {
          total: stations.length,
          active: activeStations
        },
        publications: {
          total: publications.length
        },
        recentActivity: [
          ...violations.slice(0, 3).map(v => ({ ...v, type: 'violation' })),
          ...cases.slice(0, 3).map(c => ({ ...c, type: 'case' })),
          ...stations.slice(0, 2).map(s => ({ ...s, type: 'station' })),
          ...publications.slice(0, 2).map(p => ({ ...p, type: 'publication' }))
        ].sort((a, b) => new Date(b.created) - new Date(a.created)),
        trends: {
          violations: violationsTrend,
          cases: casesTrend
        }
      });
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    
    // Set up real-time subscriptions
    const subscribeToCollections = async () => {
      try {
        await Promise.all([
          pb.collection('traffic_violations').subscribe('*', () => fetchSystemData()),
          pb.collection('cases').subscribe('*', () => fetchSystemData()),
          pb.collection('contacts').subscribe('*', () => fetchSystemData()),
          pb.collection('news').subscribe('*', () => fetchSystemData())
        ]);
      } catch (error) {
        console.error('Subscription error:', error);
      }
    };

    subscribeToCollections();

    return () => {
      pb.collection('traffic_violations').unsubscribe('*');
      pb.collection('cases').unsubscribe('*');
      pb.collection('contacts').unsubscribe('*');
      pb.collection('news').unsubscribe('*');
    };
  }, [timeRange]);

  // Chart configurations
  const violationsChart = {
    options: {
      chart: {
        type: 'bar',
        foreColor: theme.palette.text.secondary,
        toolbar: { show: false },
        stacked: true,
      },
      colors: [theme.palette.success.main, theme.palette.error.main],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 6,
          columnWidth: '30%',
        },
      },
      xaxis: {
        categories: ['Violations'],
      },
      legend: { show: false },
      tooltip: { theme: theme.palette.mode },
    },
    series: [
      { name: 'Sorted', data: [stats.violations.sorted] },
      { name: 'Unsorted', data: [stats.violations.total - stats.violations.sorted] }
    ]
  };

  const casesChart = {
    options: {
      chart: {
        type: 'donut',
        foreColor: theme.palette.text.secondary,
      },
      labels: ['Open', 'In Progress', 'Resolved'],
      colors: [
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main
      ],
      legend: { position: 'bottom' },
      tooltip: { theme: theme.palette.mode },
    },
    series: [stats.cases.open, stats.cases.inProgress, stats.cases.resolved]
  };

  const violationsTrendChart = {
    options: {
      chart: {
        type: 'line',
        foreColor: theme.palette.text.secondary,
        toolbar: { show: false },
      },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: ['6m ago', '5m ago', '4m ago', '3m ago', '2m ago', 'Last month'],
      },
      tooltip: { theme: theme.palette.mode },
    },
    series: [{
      name: 'Violations',
      data: stats.trends.violations
    }]
  };

  const casesTrendChart = {
    options: {
      chart: {
        type: 'line',
        foreColor: theme.palette.text.secondary,
        toolbar: { show: false },
      },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: ['6m ago', '5m ago', '4m ago', '3m ago', '2m ago', 'Last month'],
      },
      tooltip: { theme: theme.palette.mode },
    },
    series: [{
      name: 'Cases',
      data: stats.trends.cases
    }]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Analytics Dashboard</Typography>
        <Button 
          variant="outlined" 
          startIcon={<IconRefresh />}
          onClick={fetchSystemData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* Time Range Selector */}
      <Card sx={{ mb: 3, p: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
            disabled={loading}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={3}>
            {/* Traffic Violations */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Traffic Violations"
                action={
                  <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                    <IconAlertCircle color={theme.palette.primary.main} />
                  </Avatar>
                }
              >
                <Typography variant="h3">{stats.violations.total}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stats.violations.sorted} sorted
                  </Typography>
                </Stack>
                <Chart
                  options={violationsChart.options}
                  series={violationsChart.series}
                  type="bar"
                  height={100}
                />
              </DashboardCard>
            </Grid>

            {/* Cases */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Cases"
                action={
                  <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                    <IconMessageCircle color={theme.palette.warning.main} />
                  </Avatar>
                }
              >
                <Typography variant="h3">{stats.cases.total}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stats.cases.open} open
                  </Typography>
                </Stack>
                <Chart
                  options={casesChart.options}
                  series={casesChart.series}
                  type="donut"
                  height={150}
                />
              </DashboardCard>
            </Grid>

            {/* Stations */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Stations"
                action={
                  <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                    <IconMapPin color={theme.palette.success.main} />
                  </Avatar>
                }
              >
                <Typography variant="h3">{stats.stations.total}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {stats.stations.active} active
                  </Typography>
                </Stack>
                <Box height={100} display="flex" alignItems="center" justifyContent="center">
                  <IconMapPin size={48} color={theme.palette.success.main} />
                </Box>
              </DashboardCard>
            </Grid>

            {/* Publications */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Publications"
                action={
                  <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                    <IconNews color={theme.palette.info.main} />
                  </Avatar>
                }
              >
                <Typography variant="h3">{stats.publications.total}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Latest updates
                  </Typography>
                </Stack>
                <Box height={100} display="flex" alignItems="center" justifyContent="center">
                  <IconNews size={48} color={theme.palette.info.main} />
                </Box>
              </DashboardCard>
            </Grid>
          </Grid>

          {/* Detailed Charts */}
          <Grid container spacing={3} mb={3}>
            {/* Violations Trend */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Violations Trend">
                <Chart
                  options={violationsTrendChart.options}
                  series={violationsTrendChart.series}
                  type="line"
                  height={300}
                />
              </DashboardCard>
            </Grid>

            {/* Cases Trend */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Cases Trend">
                <Chart
                  options={casesTrendChart.options}
                  series={casesTrendChart.series}
                  type="line"
                  height={300}
                />
              </DashboardCard>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <DashboardCard title="Recent Activity">
            <Stack spacing={2}>
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ 
                        bgcolor: 
                          item.type === 'violation' ? theme.palette.primary.light :
                          item.type === 'case' ? theme.palette.warning.light :
                          item.type === 'station' ? theme.palette.success.light :
                          theme.palette.info.light
                      }}>
                        {item.type === 'violation' && <IconAlertCircle color={theme.palette.primary.main} />}
                        {item.type === 'case' && <IconMessageCircle color={theme.palette.warning.main} />}
                        {item.type === 'station' && <IconMapPin color={theme.palette.success.main} />}
                        {item.type === 'publication' && <IconNews color={theme.palette.info.main} />}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          {item.type === 'violation' ? `Violation: ${item.licence_number}` :
                          item.type === 'case' ? `Case: ${item.title}` :
                          item.type === 'station' ? `Station: ${item.station}` :
                          `Publication: ${item.title}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(item.created).toLocaleString()}
                        </Typography>
                      </Box>
                      {item.isSorted || item.status === 'Resolved' ? (
                        <IconCheck color="success" />
                      ) : (
                        <IconX color="error" />
                      )}
                    </Stack>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                  No recent activity found
                </Typography>
              )}
            </Stack>
          </DashboardCard>
        </>
      )}
    </Box>
  );
}