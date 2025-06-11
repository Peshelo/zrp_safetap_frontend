"use client";
import { useState, useEffect } from "react";
import pb from "@/app/lib/connection";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

export default function CommentsPage() {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const flagColors = {
    COMPLAINT: "error",
    COMMENT: "info",
    SUGGESTION: "success",
    OTHER: "warning",
  };

  const flagLabels = {
    COMPLAINT: "Complaint",
    COMMENT: "Comment",
    SUGGESTION: "Suggestion",
    OTHER: "Other",
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection("comments").getFullList({
        sort: "-created",
      });
      setComments(records);
    } catch (error) {
      showSnackbar("Failed to fetch comments", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      await pb.collection("comments").delete(id);
      showSnackbar("Comment deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete comment", "error");
      console.error(error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchComments();

    const subscribeToComments = async () => {
      try {
        await pb.collection("comments").subscribe("*", function (e) {
          if (e.action === "create") {
            setComments((prev) => [e.record, ...prev]);
            showSnackbar("New comment added", "info");
          } else if (e.action === "update") {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === e.record.id ? e.record : comment
              )
            );
          } else if (e.action === "delete") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== e.record.id)
            );
          }
        });
      } catch (error) {
        console.error("Subscription error:", error);
      }
    };

    subscribeToComments();

    return () => {
      pb.collection("comments").unsubscribe("*");
    };
  }, []);

  const filteredComments = comments.filter((comment) => {
    const matchesFilter = filter === "ALL" || comment.flag === filter;
    const matchesSearch = comment.comment
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comments Management
      </Typography>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search comments..."
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Flag</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter by Flag"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ALL">All Flags</MenuItem>
                  <MenuItem value="COMPLAINT">Complaints</MenuItem>
                  <MenuItem value="COMMENT">Comments</MenuItem>
                  <MenuItem value="SUGGESTION">Suggestions</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchComments}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredComments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No comments found
          </Typography>
        </Paper>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                    <TableCell>Flag</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow key={comment.id} hover>
                      <TableCell>
                        <Chip
                          label={flagLabels[comment.flag] || comment.flag}
                          color={flagColors[comment.flag] || "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            whiteSpace: "pre-line",
                            maxWidth: "500px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {comment.comment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(comment.created).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this comment?"
                              )
                            ) {
                              deleteComment(comment.id);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}