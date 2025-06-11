"use client";
import { useState, useEffect, Suspense } from "react";
import {
  Map,
  Marker,
  NavigationControl,
  Popup,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import { toast } from "sonner";
import pb from "@/app/lib/connection";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Directions as DirectionsIcon,
} from "@mui/icons-material";

function MapPage() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [siren, setSiren] = useState(null);
  const [notification, setNotification] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    assignedTo: "",
    notes: "",
  });

  const mapBoxKey = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [coordinates, setCoordinates] = useState({
    latitude: -17.825165,
    longitude: 31.053028,
  });

  const fetchCases = async () => {
    try {
      // Only fetch cases that are not resolved or cancelled
      const list = await pb.collection("cases").getFullList({
        filter: 'status != "Resolved" && status != "Cancelled"',
      });
      setCases(list);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    // Initialize audio only in browser environment
    if (typeof window !== "undefined") {
      setSiren(new Audio("/audio/siren.mp3"));
      setNotification(new Audio("/audio/notification.mp3"));
    }
  }, []);

  useEffect(() => {
    fetchCases();
    let subscription;

    const setupSubscription = async () => {
      try {
        subscription = await pb.collection("cases").subscribe("*", (e) => {
          if (e.action === "create") {
            // Only add to map if not resolved or cancelled
            if (e.record.status !== "Resolved" && e.record.status !== "Cancelled") {
              setCases((prevCases) => [...prevCases, e.record]);
              setCoordinates({
                latitude: e.record.latitude,
                longitude: e.record.longitude,
              });

              if (e.record?.title.toString().toLowerCase().includes("sos") && siren) {
                siren.play();
                console.error("New SOS Alert Triggered", {
                  description: "Please respond immediately",
                  action: {
                    label: "View",
                    onClick: () => {
                      setSelectedCase(e.record);
                      setCoordinates({
                        latitude: e.record.latitude,
                        longitude: e.record.longitude,
                      });
                    },
                  },
                });
              } else {
                if (notification) {
                  notification.play();
                }
                console.info(`New ${e.record.title} Alert Triggered`, {
                  description: "Please respond immediately",
                  action: {
                    label: "View",
                    onClick: () => {
                      setSelectedCase(e.record);
                      setCoordinates({
                        latitude: e.record.latitude,
                        longitude: e.record.longitude,
                      });
                    },
                  },
                });
              }
            }
          } else if (e.action === "update") {
            // Remove from map if resolved or cancelled
            if (e.record.status === "Resolved" || e.record.status === "Cancelled") {
              setCases((prevCases) =>
                prevCases.filter((mycase) => mycase.id !== e.record.id)
              );
            } else {
              setCases((prevCases) =>
                prevCases.map((mycase) =>
                  mycase.id === e.record.id ? { ...mycase, ...e.record } : mycase
                )
              );
            }
          } else if (e.action === "delete") {
            setCases((prevCases) =>
              prevCases.filter((mycase) => mycase.id !== e.record.id)
            );
          }
        });
      } catch (err) {
        console.error("Subscription error:", err);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        pb.collection("cases").unsubscribe("*");
      }
    };
  }, [siren, notification]);

  const handleAttendCase = (caseData) => {
    setSelectedCase(caseData);
    setFormData({
      status: caseData.status || "In Progress",
      assignedTo: caseData.assignedTo || "",
      notes: caseData.notes || "",
    });
    setOpenModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveCaseDetails = async () => {
    try {
      await pb.collection("cases").update(selectedCase.id, {
        ...formData,
      });
      console.success("Case updated successfully");
      setOpenModal(false);
      fetchCases();
    } catch (error) {
      console.error(error.message);
    }
  };

  const getMarkerIcon = (caseItem) => {
    if (caseItem?.title.toString().toLowerCase().includes("sos")) {
      return {
        src: "/images/sos.png",
        className: "bg-white border-2 border-white",
        pulse: true,
      };
    } else if (
      caseItem?.title.toString().toLowerCase().includes("accident") ||
      caseItem?.title.toString().toLowerCase().includes("traffic")
    ) {
      return {
        src: "/images/collision.png",
        className: "bg-white border-2 border-blue-600",
      };
    } else if (
      caseItem?.title.toString().toLowerCase().includes("crime") ||
      caseItem?.title.toString().toLowerCase().includes("robbery")
    ) {
      return {
        src: "/images/robbery.png",
        className: "bg-white border-2 border-orange-600",
      };
    }
    return {
      src: "/images/marker.png",
      className: "bg-white border-2 border-gray-600",
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "primary";
      case "Ongoing":
        return "warning";
      case "Resolved":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <Map
        mapboxAccessToken={mapBoxKey}
        initialViewState={{
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/standard"
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {cases.map((mycase, index) => {
          const marker = getMarkerIcon(mycase);
          return (
            <Marker
              key={index}
              longitude={mycase.longitude}
              latitude={mycase.latitude}
              onClick={() => setSelectedCase(mycase)}
            >
              <div className="flex flex-col justify-center items-center">
                <div className="relative flex items-center justify-center">
                  {marker.pulse && (
                    <span className="absolute w-10 h-10 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                  )}
                  <div className={`rounded-full flex items-center justify-center ${marker.className}`}>
                    <Image
                      src={marker.src}
                      alt="Marker"
                      width={30}
                      height={30}
                      className="relative z-10"
                    />
                  </div>
                </div>
                <p className="text-xs font-medium bg-white px-1 rounded">
                  {mycase.title}
                </p>
              </div>
            </Marker>
          );
        })}

        {selectedCase && (
          <Popup
            longitude={selectedCase.longitude}
            latitude={selectedCase.latitude}
            onClose={() => setSelectedCase(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div className="w-64">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedCase.title}
                </Typography>
                <Chip
                  label={selectedCase.status}
                  color={getStatusColor(selectedCase.status)}
                  size="small"
                />
              </div>
              <Typography variant="body2" className="mb-2">
                {selectedCase.description}
              </Typography>
              <div className="flex justify-between mt-3">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AssignmentIcon />}
                  onClick={() => handleAttendCase(selectedCase)}
                >
                  Attend
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DirectionsIcon />}
                  component={Link}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.latitude},${selectedCase.longitude}`}
                  target="_blank"
                >
                  Directions
                </Button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Case Details Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Case: {selectedCase?.title}
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Case Details
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell>{selectedCase?.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell>{selectedCase?.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                          <TableCell>{selectedCase?.address}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Coordinates</TableCell>
                          <TableCell>
                            {selectedCase?.latitude}, {selectedCase?.longitude}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Update Case
                  </Typography>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      label="Status"
                    >
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Assigned To"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleFormChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    multiline
                    rows={4}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveCaseDetails} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading Map...</div>}>
        <MapPage />
      </Suspense>
    </div>
  );
}