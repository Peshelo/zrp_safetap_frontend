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
  Tabs,
  Tab,
  useTheme,
  CardMedia,
  CardActionArea,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  TableView as TableViewIcon,
  GridView as GridViewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const pb = new PocketBase('https://swiftly.pockethost.io');

export default function PublicationsPage() {
  const theme = useTheme();
  const [publications, setPublications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    file: null,
  });
  const [errors, setErrors] = useState({});

  const fetchPublications = async () => {
    try {
      let filter = '';
      if (searchTerm) {
        filter = `(title ~ "${searchTerm}" || author ~ "${searchTerm}")`;
      }
      var records;
if(filter){
 records = await pb.collection('news').getFullList({
        sort: '-created',
        filter: filter || undefined,
      });
}else{
 records = await pb.collection('news').getFullList({
            sort: '-created',
        });
}
     
      setPublications(records);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [searchTerm]);

  const handleCreatePublication = () => {
    setEditingPublication(null);
    setFormData({
      title: '',
      description: '',
      author: '',
      file: null,
    });
    setFile(null);
    setFilePreview('');
    setErrors({});
    setOpenDialog(true);
  };

  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    setFormData({
      title: publication.title,
      description: publication.description,
      author: publication.author,
      file: null,
    });
    setFilePreview(publication.file ? pb.getFileUrl(publication, publication.file) : '');
    setErrors({});
    setOpenDialog(true);
  };

  const handleDeletePublication = async (id) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        await pb.collection('news').delete(id);
        showSnackbar('Publication deleted successfully', 'success');
        fetchPublications();
      } catch (error) {
        showSnackbar(error.message, 'error');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.author) newErrors.author = 'Author is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('author', formData.author);
      if (file) {
        data.append('file', file);
      }

      if (editingPublication) {
        await pb.collection('news').update(editingPublication.id, data);
        showSnackbar('Publication updated successfully', 'success');
      } else {
        await pb.collection('news').create(data);
        showSnackbar('Publication created successfully', 'success');
      }
      setOpenDialog(false);
      fetchPublications();
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview('');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <ArticleIcon />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon />;
    return <ArticleIcon />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Publications Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            startIcon={<TableViewIcon />}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            startIcon={<GridViewIcon />}
          >
            Grid View
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreatePublication}
          >
            New Publication
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search publications..."
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
        </CardContent>
      </Card>

      {/* Publications Display */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    {/* <TableCell>Description</TableCell> */}
                    <TableCell>Attachment</TableCell>
                    <TableCell>Date</TableCell>

                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {publications.length > 0 ? (
                    publications.map((publication) => (
                      <TableRow key={publication.id} hover>
                        <TableCell>
                          <Typography fontWeight="bold">{publication.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{publication.author}</Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Typography 
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            dangerouslySetInnerHTML={{ __html: publication.description }}
                          />
                        </TableCell> */}
                        <TableCell>
                          {publication.file && (
                            <Tooltip title={publication.file}>
                              <IconButton
                                component="a"
                                href={pb.getFileUrl(publication, publication.file)}
                                target="_blank"
                                download
                              >
                                {getFileIcon(publication.file)}
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {new Date(publication.created).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                })}
                            </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditPublication(publication)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => handleDeletePublication(publication.id)}
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
                        <Typography color="text.secondary">No publications found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {publications.length > 0 ? (
            publications.map((publication) => (
              <Grid item xs={12} sm={6} md={4} key={publication.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {publication.file && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={pb.getFileUrl(publication, publication.file)}
                      alt={publication.title}
                      sx={{
                        objectFit: 'cover',
                        display: publication.file.split('.').pop().toLowerCase() === 'pdf' ? 'none' : 'block'
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {publication.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      By {publication.author}
                    </Typography>
                    {/* <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      dangerouslySetInnerHTML={{ __html: publication.description }}
                    /> */}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    {publication.file && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={pb.getFileUrl(publication, publication.file)}
                        target="_blank"
                        download
                      >
                        Download
                      </Button>
                    )}
                    <Box>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditPublication(publication)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeletePublication(publication.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center">
                No publications found
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Publication Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingPublication ? 'Edit Publication' : 'Create New Publication'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Title *"
                name="title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Author *"
                name="author"
                value={formData.author}
                onChange={(e) => handleFormChange('author', e.target.value)}
                error={!!errors.author}
                helperText={errors.author}
                margin="normal"
              />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Description *
              </Typography>
              <Box sx={{ height: 300, mb: 2 }}>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => handleFormChange('description', value)}
                  style={{ height: 'calc(100% - 42px)' }}
                />
              </Box>
              {errors.description && (
                <Typography variant="caption" color="error">
                  {errors.description}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Attachment
              </Typography>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                {filePreview ? (
                  <>
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 16 }}
                    />
                    <Typography variant="body2">{file?.name}</Typography>
                  </>
                ) : editingPublication?.file ? (
                  <>
                    <Box sx={{ fontSize: 48, color: 'text.secondary' }}>
                      {getFileIcon(editingPublication.file)}
                    </Box>
                    <Typography variant="body2">{editingPublication.file}</Typography>
                  </>
                ) : (
                  <>
                    <Box sx={{ fontSize: 48, color: 'text.secondary' }}>
                      <ArticleIcon fontSize="inherit" />
                    </Box>
                    <Typography variant="body2">No file selected</Typography>
                  </>
                )}
              </Box>
              <Button
                variant="contained"
                component="label"
                fullWidth
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Supports images, PDFs, and documents
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingPublication ? 'Update' : 'Create'}
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