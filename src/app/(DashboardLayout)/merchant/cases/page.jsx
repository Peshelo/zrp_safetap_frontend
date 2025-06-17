'use client';
import React, { useState, useEffect } from 'react';
import pb from '@/app/lib/connection';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Badge,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Map as MapIcon,
  Phone as PhoneIcon,
  Directions as DirectionsIcon,
  Person as PersonIcon,
  Assignment as CaseIcon,
  CheckCircle as ResolvedIcon,
  HourglassEmpty as PendingIcon,
  Warning as HighPriorityIcon,
  LowPriority as LowPriorityIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Note as NoteIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import PageContainer from '@/app/components/container/PageContainer';

export default function CADDispatchSystem() {
  const theme = useTheme();
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Form state for attending to a case
  const [formData, setFormData] = useState({
    reporterType: '',
    assignedTo: '',
    additionalNotes: '',
    nextSteps: '',
    caseStatus: 'open',
  });


  // {
//   "phone_number": "+263717201539",
//   "latitude": -17.8292,     
//   "longitude": 31.0522,
//   "name": "Accident Scene",
//   "address": "Near Jason Moyo and Leopord Takawira",
//   "message": "Case 4563: Assigned to inspector Nzira"
// }
const handleSentMessage = async (caseData) => {
  try {
    const message = `Case ${caseData.id}, Case Type: ${caseData.title}, Case Status: ${caseData.status}, Reporter Number: ${caseData.phoneNumber}, Assigned to you`;
    const data = {
      phone_number: caseData.assignedTo || '+263712495812', // Default or from case data
      latitude: caseData.latitude || -17.8292, // Default or from case data
      longitude: caseData.longitude || 31.0522, // Default or from case data
      name: `CaseId: ${caseData.id}, Title: ${caseData.title}` || 'Report', // Default or from case data
      address: caseData.address || '', // Default or from case data
      message: message,
    };
    // To api http://4.222.232.224:80/sent-message
    const response = await fetch('http://4.222.232.224:80/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      showSnackbar('Failed to send message', 'error');
    }
    const result = await response.json();
    showSnackbar(`Message sent successfully: ${result.message}`, 'success');
  } catch (error) {
    console.error('Error sending message:', error);
    showSnackbar(`Error sending message: ${error.message}`, 'error');
  }
};
  const fetchCases = async () => {
    try {
      let filter = '';
      if (searchTerm) {
        filter += `(title ~ "${searchTerm}" || description ~ "${searchTerm}" || address ~ "${searchTerm}")`;
      }
      if (statusFilter !== 'all') {
        if (filter) filter += ' && ';
        filter += `status = "${statusFilter}"`;
      }
      if (priorityFilter !== 'all') {
        if (filter) filter += ' && ';
        filter += `priority = "${priorityFilter}"`;
      }

      const records = await pb.collection('cases').getFullList({
        sort: '-created',
        // filter: filter || undefined,
      });
      setCases(records);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleAttendCase = (caseData) => {
    setCurrentCase(caseData);
    setFormData({
      reporterType: caseData.reporterType || '',
      assignedTo: caseData.assignedTo || '',
      additionalNotes: caseData.additionalNotes || '',
      nextSteps: caseData.nextSteps || '',
      caseStatus: caseData.status || 'open',
    });
    setOpenDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveCaseDetails = async () => {
    try {
      const dataForm = {
        ...formData,
        status: formData.caseStatus,
        reporterType: formData.reporterType || currentCase.reporterType,
        assignedTo: formData.assignedTo || currentCase.assignedTo,
        additionalNotes: formData.additionalNotes || currentCase.additionalNotes,
        nextSteps: formData.nextSteps || currentCase.nextSteps,
        // Ensure we don't overwrite existing fields unless specified
      };
      const data = { ...currentCase, ...dataForm };
      // Use the proper update method
      const record = await pb.collection('cases').update(currentCase.id, data);
      handleSentMessage(record); // Send message after updating case
      // Update local state
      setCases(prev => prev.map(c => c.id === currentCase.id ? record : c));
      
      showSnackbar('Case updated successfully', 'success');
      setOpenDialog(false);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const deleteCase = async (id) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await pb.collection('cases').delete(id);
        fetchCases();
        showSnackbar('Case deleted successfully', 'success');
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    // const unsubscribe = pb.collection('cases').subscribe('*', () => {
    //   fetchCases();
    // });
    fetchCases();
    // return () => unsubscribe();
  }, [searchTerm, statusFilter, priorityFilter]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return <ResolvedIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'high': return <HighPriorityIcon color="error" />;
      case 'low': return <LowPriorityIcon color="success" />;
      default: return <CaseIcon color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'info';
      case 'in progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <PageContainer title="CAD Dispatch System" description="Computer Aided Dispatch System">
      <Box sx={{ p: 3 }}>
        {/* Filters and Search */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.divider,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                      },
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="Ongoing">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    label="Priority"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                      },
                    }}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={fetchCases}
                  startIcon={<SearchIcon />}
                  sx={{
                    height: '56px',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                    },
                  }}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card sx={{ bgcolor: theme.palette.background.paper }}>
          <CardHeader
            title="Active Cases"
            subheader={`Total: ${cases.length} cases`}
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                href="/cases/new"
                sx={{
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                New Case
              </Button>
            }
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          />
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                    <TableCell>Case ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Reporter</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cases.length > 0 ? (
                    cases.map((caseItem) => (
                      <TableRow 
                        key={caseItem.id} 
                        hover
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {caseItem.id.slice(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">{caseItem.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {caseItem.description.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, bgcolor: theme.palette.primary.main }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography>{caseItem.reporterName || 'Anonymous'}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {caseItem.reporterType || 'Unknown'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography>{caseItem.address}</Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Tooltip title="Call reporter">
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={`tel:${caseItem.phoneNumber}`}
                              >
                                <PhoneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Get directions">
                              <IconButton
                                size="small"
                                color="secondary"
                                component="a"
                                target="_blank"
                                href={`https://www.google.com/maps/dir/?api=1&destination=${caseItem.latitude},${caseItem.longitude}`}
                              >
                                <DirectionsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={caseItem.priority}
                            color={getPriorityColor(caseItem.priority)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={caseItem.status}
                            color={getStatusColor(caseItem.status)}
                            icon={getStatusIcon(caseItem.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(caseItem.created).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Attend Case">
                              <IconButton
                                color="primary"
                                onClick={() => handleAttendCase(caseItem)}
                                sx={{
                                  bgcolor: theme.palette.primary.light,
                                  '&:hover': {
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                  },
                                }}
                              >
                                <AssignmentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton
                                color="info"
                                component={Link}
                                href={`./cases/${caseItem.id}`}
                                sx={{
                                  bgcolor: theme.palette.info.light,
                                  '&:hover': {
                                    bgcolor: theme.palette.info.main,
                                    color: 'white',
                                  },
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title="Edit">
                              <IconButton 
                                color="warning"
                                sx={{
                                  bgcolor: theme.palette.warning.light,
                                  '&:hover': {
                                    bgcolor: theme.palette.warning.main,
                                    color: 'white',
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                            {/* <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => deleteCase(caseItem.id)}
                                sx={{
                                  bgcolor: theme.palette.error.light,
                                  '&:hover': {
                                    bgcolor: theme.palette.error.main,
                                    color: 'white',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" color="text.secondary">
                          No cases found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Full-screen Case Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullScreen
          PaperProps={{
            sx: {
              background: theme.palette.background.default,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6">Case: {currentCase?.title}</Typography>
              <Typography variant="subtitle2">
                ID: {currentCase?.id} | Created: {currentCase?.created && new Date(currentCase.created).toLocaleString()}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setOpenDialog(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Tab label="Case Details" icon={<InfoIcon />} />
              <Tab label="Case Management" icon={<AssignmentIcon />} />
              <Tab label="History" icon={<HistoryIcon />} />
            </Tabs>
            
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardHeader
                      title="Case Information"
                      sx={{
                        bgcolor: theme.palette.primary.dark,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {currentCase?.title}
                      </Typography>
                      <Typography paragraph>
                        {currentCase?.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Reporter Details
                      </Typography>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography>
                            <strong>Name:</strong> {currentCase?.reporterName || 'Anonymous'}
                          </Typography>
                          <Typography>
                            <strong>Type:</strong> {currentCase?.reporterType || 'Unknown'}
                          </Typography>
                          {currentCase?.phoneNumber && (
                            <Typography>
                              <strong>Phone:</strong> 
                              <Button
                                startIcon={<PhoneIcon />}
                                href={`tel:${currentCase.phoneNumber}`}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                {currentCase.phoneNumber}
                              </Button>
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardHeader
                      title="Location Details"
                      sx={{
                        bgcolor: theme.palette.primary.dark,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Address
                      </Typography>
                      <Typography paragraph>
                        {currentCase?.address}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Coordinates
                      </Typography>
                      <Typography paragraph>
                        {currentCase?.latitude}, {currentCase?.longitude}
                      </Typography>
                      <Box display="flex" gap={2} mt={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DirectionsIcon />}
                          href={`https://www.google.com/maps/dir/?api=1&destination=${currentCase?.latitude},${currentCase?.longitude}`}
                          target="_blank"
                        >
                          Get Directions
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<MapIcon />}
                          component={Link}
                          href={`/merchant/map?lat=${currentCase?.latitude}&long=${currentCase?.longitude}`}
                        >
                          View on Map
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardHeader
                      title="Case Status"
                      sx={{
                     bgcolor: theme.palette.primary.dark,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                    <CardContent>
                      <Stepper orientation="vertical" activeStep={getStatusStep(currentCase?.status)}>
                        <Step>
                          <StepLabel>Case Opened</StepLabel>
                          <StepContent>
                            <Typography>
                              Case was opened on {currentCase?.created && new Date(currentCase.created).toLocaleString()}
                            </Typography>
                          </StepContent>
                        </Step>
                        <Step>
                          <StepLabel>Case In Progress</StepLabel>
                          <StepContent>
                            <Typography>
                              {currentCase?.status === 'in progress' ? 
                                'Case is currently being worked on' : 
                                'Case has not yet been assigned'}
                            </Typography>
                          </StepContent>
                        </Step>
                        <Step>
                          <StepLabel>Case Resolved</StepLabel>
                          <StepContent>
                            <Typography>
                              {currentCase?.status === 'Resolved' ? 
                                'Case has been resolved' : 
                                'Case is not yet resolved'}
                            </Typography>
                          </StepContent>
                        </Step>
                      </Stepper>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader
                      title="Update Case"
                      sx={{
                        bgcolor: theme.palette.primary.dark,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Reporter Type</InputLabel>
                            <Select
                              name="reporterType"
                              value={formData.reporterType}
                              onChange={handleFormChange}
                              label="Reporter Type"
                            >
                              <MenuItem value="victim">Victim</MenuItem>
                              <MenuItem value="witness">Witness</MenuItem>
                              <MenuItem value="officer">Officer</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Assigned Phone Number"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleFormChange}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Additional Notes"
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleFormChange}
                            multiline
                            rows={4}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Next Steps"
                            name="nextSteps"
                            value={formData.nextSteps}
                            onChange={handleFormChange}
                            multiline
                            rows={2}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Case Status</InputLabel>
                            <Select
                              name="caseStatus"
                              value={formData.caseStatus}
                              onChange={handleFormChange}
                              label="Case Status"
                            >
                              <MenuItem value="Open">Open</MenuItem>
                              <MenuItem value="Ongoing">On Going</MenuItem>
                              <MenuItem value="Resolved">Resolved</MenuItem>
                              <MenuItem value="Closed">Closed</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Card>
                <CardHeader
                  title="Case History"
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  }}
                />
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    Case history and audit log will appear here
                  </Typography>
                </CardContent>
              </Card>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              p: 2,
            }}
          >
            <Button
              onClick={() => setOpenDialog(false)}
              color="secondary"
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveCaseDetails}
              color="primary"
              variant="contained"
              startIcon={<DoneIcon />}
            >
              Save Changes
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
    </PageContainer>
  );
}

// Helper function to determine status step
function getStatusStep(status) {
  switch (status?.toLowerCase()) {
    case 'open': return 0;
    case 'in progress': return 1;
    case 'resolved': return 2;
    case 'closed': return 3;
    default: return 0;
  }
}