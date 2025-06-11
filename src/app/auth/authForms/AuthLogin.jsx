"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import pb from "@/app/lib/connection";

const AuthLoginForm = ({ subtitle }) => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' // 'error' | 'warning' | 'info' | 'success'
  });

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const authData = await pb.collection('users').authWithPassword(
        formData.username,
        formData.password,
      );
      
      showToast("Login successful", "success");
      
      // Redirect based on user role
      const userRole = authData.record.role;
      if (userRole === "SUPER_ADMIN") {
        router.push('/super_admin');
      } else if (userRole === "MERCHANT") {
        router.push('/merchant');
      } else {
        throw new Error("Unauthorized access");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
        <Typography fontWeight="700" variant="h4" align="center" mb={1}>
          Zimbabwe Republic Police
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="textSecondary" mb={4}>
          Computer Aided Dispatch System
        </Typography>

        {error && (
          <Typography color="error" variant="body2" mb={2}>
            {error}
          </Typography>
        )}

        <Box mb={3}>
          <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
          <CustomTextField 
            id="username" 
            name="username"
            type="email"
            variant="outlined" 
            fullWidth 
            value={formData.username}
            onChange={handleInputChange}
            onFocus={() => setError('')}
            required
          />
        </Box>
        
        <Box mb={2}>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setError('')}
            required
          />
        </Box>
        
        <Stack
          justifyContent="flex-end"
          direction="row"
          alignItems="center"
          mb={2}
        >
          <Typography
            component={Link}
            href="/auth/forgot-password"
            fontWeight="500"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Forgot Password?
          </Typography>
        </Stack>
        
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ 
            mb: 3,
            py: 1.5,
            fontWeight: 600
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
        
        {subtitle}
      </Box>
      
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleToastClose} 
          severity={toast.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthLoginForm;