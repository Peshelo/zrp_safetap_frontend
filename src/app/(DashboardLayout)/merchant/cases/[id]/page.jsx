'use client';
import { useState, useEffect } from "react";
import pb from "@/app/lib/connection";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  Button
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Assignment as CaseIcon,
  Warning as PriorityIcon,
  CheckCircle as StatusIcon,
  Image as ImageIcon,
  MapRounded
} from '@mui/icons-material';
import Link from "next/link";

export default function CaseDetailsReport() {
  const theme = useTheme();
  const [caseData, setCaseData] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, src: '' });
  const router = useRouter();
//   const searchParams = useSearchParams();
//   const caseId = searchParams.get('caseId');
  const caseId = useParams().id;
  const fetchCaseDetails = async (id) => {
    try {
      const record = await pb.collection('cases').getFirstListItem(`id="${id}"`, {
        expand: 'merchant,assignedOfficer',
      });
      setCaseData({
        id: record.id,
        caseNumber: record.caseNumber || `CASE-${record.id.slice(0, 8).toUpperCase()}`,
        title: record.title,
        description: record.description,
        category: record.category || 'General',
        subcategory: record.subcategory || 'N/A',
        city: record.city,
        address: record.address,
        latitude: record.latitude,
        longitude: record.longitude,
        status: record.status,
        priority: record.priority,
        createdAt: record.created,
        updatedAt: record.updated,
        reporterName: record.reporterName || 'Anonymous',
        reporterType: record.reporterType || 'Unknown',
        reporterContact: record.reporterContact || 'N/A',
        images: record.images || [],
        merchant: record.expand?.merchant || null,
        assignedOfficer: record.expand?.assignedOfficer || null,
        resolutionNotes: record.resolutionNotes || 'No resolution notes available',
        nextSteps: record.nextSteps || 'No next steps defined',
        attachments: record.attachments || []
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails(caseId);
    }
  }, [caseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // toast.success('Case link copied to clipboard');
  };

  const openImageModal = (src) => {
    setImageModal({ open: true, src });
  };

  const closeImageModal = () => {
    setImageModal({ open: false, src: '' });
  };

  const getPriorityColor = () => {
    if (!caseData) return 'default';
    switch (caseData.priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getStatusColor = () => {
    if (!caseData) return 'default';
    switch (caseData.status.toLowerCase()) {
      case 'open': return 'info';
      case 'in progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  if (!caseData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading case details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto', bgcolor: 'background.paper' }}>
      {/* Header with action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.back()}
          variant="outlined"
          sx={{ color: 'text.secondary' }}
        >
          Back to cases
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            Print Report
          </Button>
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
            variant="outlined"
            color="primary"
          >
            Share
          </Button>
        </Box>
      </Box>

      {/* Case Report Card */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          {/* Report Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            borderBottom: `2px solid ${theme.palette.divider}`,
            pb: 2
          }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                CASE REPORT
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {caseData.caseNumber}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={caseData.status}
                color={getStatusColor()}
                icon={<StatusIcon />}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={caseData.priority}
                color={getPriorityColor()}
                icon={<PriorityIcon />}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Case Details Grid */}
          <Grid container spacing={4}>
            {/* Left Column - Case Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: 'primary.main',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 2
              }}>
                CASE DETAILS
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell>{caseData.title}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell>{caseData.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell>{caseData.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subcategory</TableCell>
                      <TableCell>{caseData.subcategory}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
                      <TableCell>
                        {new Date(caseData.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
                      <TableCell>
                        {new Date(caseData.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ 
                mt: 4,
                color: 'primary.main',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 2
              }}>
                RESOLUTION INFORMATION
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Resolution Notes</TableCell>
                      <TableCell>{caseData.resolutionNotes}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Next Steps</TableCell>
                      <TableCell>{caseData.nextSteps}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Right Column - People and Location */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: 'primary.main',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 2
              }}>
                INVOLVED PARTIES
              </Typography>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Reporter Information
                      </Typography>
                      <Typography variant="body2">
                        {caseData.reporterName} ({caseData.reporterType})
                      </Typography>
                      <Typography variant="body2">
                        Contact: {caseData.phoneNumber}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {caseData.merchant && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Merchant Information
                        </Typography>
                        <Typography variant="body2">
                          {caseData.merchant.name}
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {caseData.merchant.phoneNumber}
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {caseData.assignedOfficer && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Assigned Officer
                        </Typography>
                        <Typography variant="body2">
                          {caseData.assignedOfficer.name}
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {caseData.assignedOfficer.contactNumber}
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {caseData.assignedOfficer.email}
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Typography variant="h6" gutterBottom sx={{ 
                color: 'primary.main',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 2
              }}>
                LOCATION DETAILS
              </Typography>

              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {caseData.address}, {caseData.city}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Coordinates: {caseData.latitude}, {caseData.longitude}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LocationIcon />}
                    href={`https://www.google.com/maps/dir/?api=1&destination=${caseData.latitude},${caseData.longitude}`}
                    target="_blank"
                    sx={{ mr: 1 }}
                  >
                    Get Directions
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapRounded />}
                    component={Link}
                    href={`/merchant/map?lat=${caseData.latitude}&long=${caseData.longitude}`}
                  >
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Evidence/Images Section */}
          {caseData.images.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ 
                mt: 4,
                color: 'primary.main',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 2
              }}>
                CASE EVIDENCE
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {caseData.images.map((image, index) => (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      width: 120,
                      height: 120,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => openImageModal(`https://swiftly.pockethost.io/api/files/vc5muu8hvdtzlf1/${caseData.id}/${image}`)}
                  >
                    <img
                      src={`https://swiftly.pockethost.io/api/files/vc5muu8hvdtzlf1/${caseData.id}/${image}`}
                      alt={`Case evidence ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={imageModal.open} onClose={closeImageModal} maxWidth="md" fullWidth>
        <DialogTitle>Case Evidence</DialogTitle>
        <DialogContent>
          <img
            src={imageModal.src}
            alt="Case evidence"
            style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          .MuiButton-root {
            display: none !important;
          }
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            page-break-inside: avoid;
          }
          .MuiGrid-container {
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}