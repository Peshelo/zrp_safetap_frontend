'use client';
import { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

const pb = new PocketBase('https://swiftly.pockethost.io');

export default function StationsPage() {
  const theme = useTheme();
  const [stations, setStations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [filters, setFilters] = useState({
    province: '',
    active: '',
    specialty: '',
  });
  const [sort, setSort] = useState({
    field: 'created',
    order: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    station: '',
    province: '',
    district: '',
    location: '',
    active: true,
    station_number: '',
    whatsapp_number: '',
    member_in_charge: '',
    member_in_charge_number: '',
    specialty: '',
  });
  const [errors, setErrors] = useState({});

  const fetchStations = async () => {
    try {
      let filter = '';
      if (searchTerm) {
        filter += `(station ~ "${searchTerm}" || member_in_charge ~ "${searchTerm}" || station_number ~ "${searchTerm}")`;
      }
      if (filters.province) {
        if (filter) filter += ' && ';
        filter += `province = "${filters.province}"`;
      }
      if (filters.active !== '') {
        if (filter) filter += ' && ';
        filter += `active = ${filters.active}`;
      }
      if (filters.specialty) {
        if (filter) filter += ' && ';
        filter += `specialty = "${filters.specialty}"`;
      }
      var records=null;
      if(filter) {
      records = await pb.collection('contacts').getFullList({
        sort: `${sort.order === 'desc' ? '-' : ''}${sort.field}`,
        filter: filter || undefined,
      });
        } else {
      records = await pb.collection('contacts').getFullList({
            sort: `${sort.order === 'desc' ? '-' : ''}${sort.field}`,
        });
      }
      setStations(records);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  useEffect(() => {
    fetchStations();
  }, [filters, sort, searchTerm]);

  const handleCreateStation = () => {
    setEditingStation(null);
    setFormData({
      station: '',
      province: '',
      district: '',
      location: '',
      active: true,
      station_number: '',
      whatsapp_number: '',
      member_in_charge: '',
      member_in_charge_number: '',
      specialty: '',
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    setFormData({
      station: station.station,
      province: station.province,
      district: station.district,
      location: station.location,
      active: station.active,
      station_number: station.station_number,
      whatsapp_number: station.whatsapp_number,
      member_in_charge: station.member_in_charge,
      member_in_charge_number: station.member_in_charge_number,
      specialty: station.specialty,
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleDeleteStation = async (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await pb.collection('contacts').delete(id);
        showSnackbar('Station deleted successfully', 'success');
        fetchStations();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.station) newErrors.station = 'Station name is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.member_in_charge) newErrors.member_in_charge = 'Member in charge is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingStation) {
        await pb.collection('contacts').update(editingStation.id, formData);
        showSnackbar('Station updated successfully', 'success');
      } else {
        await pb.collection('contacts').create(formData);
        showSnackbar('Station created successfully', 'success');
      }
      setOpenDialog(false);
      fetchStations();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const provinces = ['Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central', 
                    'Mashonaland East', 'Mashonaland West', 'Masvingo', 
                    'Matabeleland North', 'Matabeleland South', 'Midlands'];

  const specialties = ['Police', 'Fire', 'Ambulance', 'Hospital', 'Clinic', 'Other'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Stations Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateStation}
        >
          New Station
        </Button>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search stations..."
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
                <InputLabel>Province</InputLabel>
                <Select
                  value={filters.province}
                  onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                  label="Province"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Provinces</MenuItem>
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.active}
                  onChange={(e) => setFilters({ ...filters, active: e.target.value === '' ? '' : e.target.value === 'true' })}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  label="Specialty"
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sort.field}
                  onChange={(e) => setSort({ ...sort, field: e.target.value })}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="created">Created Date</MenuItem>
                  <MenuItem value="station">Station Name</MenuItem>
                  <MenuItem value="province">Province</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stations Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                  <TableCell>Station</TableCell>
                  <TableCell>Contact Details</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stations.length > 0 ? (
                  stations.map((station) => (
                    <TableRow key={station.id} hover>
                      <TableCell>
                        <Typography fontWeight="bold">{station.station}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {station.specialty}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {station.station_number && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" />
                              <Typography>{station.station_number}</Typography>
                            </Box>
                          )}
                          {station.whatsapp_number && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WhatsAppIcon fontSize="small" color="success" />
                              <Typography>{station.whatsapp_number}</Typography>
                            </Box>
                          )}
                          {station.member_in_charge_number && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" />
                              <Typography>{station.member_in_charge} ({station.member_in_charge_number})</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>{station.province}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {station.district}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={station.active ? 'Active' : 'Inactive'}
                          color={station.active ? 'success' : 'error'}
                          icon={station.active ? <ActiveIcon /> : <InactiveIcon />}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditStation(station)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteStation(station.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No stations found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Station Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingStation ? 'Edit Station' : 'Create New Station'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Name *"
                name="station"
                value={formData.station}
                onChange={handleFormChange}
                error={!!errors.station}
                helperText={errors.station}
                margin="normal"
              />
              <FormControl fullWidth margin="normal" error={!!errors.province}>
                <InputLabel>Province *</InputLabel>
                <Select
                  name="province"
                  value={formData.province}
                  onChange={handleFormChange}
                  label="Province *"
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
                {errors.province && (
                  <Typography variant="caption" color="error">
                    {errors.province}
                  </Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="District *"
                name="district"
                value={formData.district}
                onChange={handleFormChange}
                error={!!errors.district}
                helperText={errors.district}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Specialty</InputLabel>
                <Select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleFormChange}
                  label="Specialty"
                >
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Number"
                name="station_number"
                value={formData.station_number}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="WhatsApp Number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WhatsAppIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Member in Charge *"
                name="member_in_charge"
                value={formData.member_in_charge}
                onChange={handleFormChange}
                error={!!errors.member_in_charge}
                helperText={errors.member_in_charge}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Member Contact Number"
                name="member_in_charge_number"
                value={formData.member_in_charge_number}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="active"
                  value={formData.active}
                  onChange={(e) => handleFormChange({
                    target: {
                      name: 'active',
                      value: e.target.value === 'true'
                    }
                  })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingStation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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