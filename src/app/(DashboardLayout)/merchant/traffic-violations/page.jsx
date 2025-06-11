'use client';
import { useState, useEffect } from 'react';
import pb from '@/app/lib/connection';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  useTheme,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Papa from 'papaparse';

export default function TrafficViolationsPage() {
  const theme = useTheme();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [newViolation, setNewViolation] = useState({
    licence_number: '',
    isSorted: false,
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const fetchViolations = async () => {
    setLoading(true);
    try {
      let filterQuery = '';
      if (searchTerm) {
        filterQuery += `licence_number ~ "${searchTerm}"`;
      }
      if (filter !== 'ALL') {
        if (filterQuery) filterQuery += ' && ';
        filterQuery += `isSorted = ${filter === 'SORTED'}`;
      }
var records = [];
      if(filterQuery) {
     records = await pb.collection('traffic_violations').getFullList({
        sort: '-created',
        filter: filterQuery || undefined,
        page: 1,
        perPage: 2, // Adjust as needed

      });
        } else {
      records = await pb.collection('traffic_violations').getFullList({
            sort: '-created',
             page: 1,
        perPage: 2, // Adjust as needed
            });
        }
      setViolations(records);
    } catch (error) {
      showSnackbar('Failed to fetch violations', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();

    const subscribeToViolations = async () => {
      try {
        await pb.collection('traffic_violations').subscribe('*', (e) => {
          if (e.action === 'create') {
            setViolations(prev => [e.record, ...prev]);
            showSnackbar('New violation added', 'info');
          } else if (e.action === 'update') {
            setViolations(prev =>
              prev.map(v => (v.id === e.record.id ? e.record : v))
            );
          } else if (e.action === 'delete') {
            setViolations(prev => prev.filter(v => v.id !== e.record.id));
          }
        });
      } catch (error) {
        console.error('Subscription error:', error);
      }
    };

    subscribeToViolations();

    return () => {
      pb.collection('traffic_violations').unsubscribe('*');
    };
  }, [searchTerm, filter]);

  const handleCreateViolation = async () => {
    try {
      await pb.collection('traffic_violations').create(newViolation);
      showSnackbar('Violation added successfully', 'success');
      setOpenDialog(false);
      setNewViolation({ licence_number: '', isSorted: false });
    } catch (error) {
      showSnackbar('Failed to add violation', 'error');
      console.error(error);
    }
  };

  const handleDeleteViolation = async (id) => {
    if (window.confirm('Are you sure you want to delete this violation?')) {
      try {
        await pb.collection('traffic_violations').delete(id);
        showSnackbar('Violation deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete violation', 'error');
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (violation) => {
    try {
      await pb.collection('traffic_violations').update(violation.id, {
        isSorted: !violation.isSorted,
      });
      showSnackbar('Violation status updated', 'success');
    } catch (error) {
      showSnackbar('Failed to update violation', 'error');
      console.error(error);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCsvPreview(results.data.slice(0, 5)); // Show first 5 rows as preview
        },
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
          const validRecords = results.data
            .filter(row => row.licence_number)
            .map(row => ({
              licence_number: row.licence_number,
              isSorted: row.isSorted === 'true' || row.isSorted === true,
            }));

          // Batch create records
          for (const record of validRecords) {
            await pb.collection('traffic_violations').create(record);
          }

          showSnackbar(`${validRecords.length} violations uploaded successfully`, 'success');
          setOpenUploadDialog(false);
          setCsvFile(null);
          setCsvPreview([]);
        },
      });
    } catch (error) {
      showSnackbar('Failed to upload CSV', 'error');
      console.error(error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Traffic Violations
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search license numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="SORTED">Sorted</MenuItem>
                  <MenuItem value="UNSORTED">Unsorted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Add Single
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUploadDialog(true)}
              >
                Upload CSV
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="text"
                startIcon={<RefreshIcon />}
                onClick={fetchViolations}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Violations Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : violations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No violations found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {violations.map((violation) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={violation.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${
                    violation.isSorted
                      ? theme.palette.success.main
                      : theme.palette.error.main
                  }`,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {violation.licence_number}
                  </Typography>
                  <Chip
                    label={violation.isSorted ? 'Sorted' : 'Unsorted'}
                    color={violation.isSorted ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Added: {new Date(violation.created).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <IconButton
                    color={violation.isSorted ? 'success' : 'error'}
                    onClick={() => handleToggleStatus(violation)}
                  >
                    {violation.isSorted ? <CheckIcon /> : <CloseIcon />}
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteViolation(violation.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Single Violation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Violation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="License Number"
            fullWidth
            variant="outlined"
            value={newViolation.licence_number}
            onChange={(e) =>
              setNewViolation({ ...newViolation, licence_number: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newViolation.isSorted}
              onChange={(e) =>
                setNewViolation({ ...newViolation, isSorted: e.target.value })
              }
              label="Status"
            >
              <MenuItem value={false}>Unsorted</MenuItem>
              <MenuItem value={true}>Sorted</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateViolation} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Violations CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Upload a CSV file with license numbers. The file should have a header row with at least a "licence_number" column.
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
          >
            Select CSV File
            <input type="file" hidden accept=".csv" onChange={handleCsvUpload} />
          </Button>
          
          {csvFile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                File: {csvFile.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                First {csvPreview.length} rows:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {csvPreview[0] &&
                        Object.keys(csvPreview[0]).map((key) => (
                          <TableCell key={key}>{key}</TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {csvPreview.map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((value, j) => (
                          <TableCell key={j}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!csvFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}