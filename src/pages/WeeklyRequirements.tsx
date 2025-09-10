import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '../contexts/ApiContext';

interface WeeklyRequirement {
  id: number;
  agency_id: number;
  week_start: string;
  week_end: string;
  total_families: number;
  total_boxes: number;
  special_requests?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  agency?: {
    id: number;
    name: string;
    contact_person: string;
  };
}

interface Agency {
  id: number;
  name: string;
  contact_person: string;
}

const WeeklyRequirements: React.FC = () => {
  const { api } = useApi();
  const [requirements, setRequirements] = useState<WeeklyRequirement[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<WeeklyRequirement | null>(null);
  const [formData, setFormData] = useState({
    agency_id: '',
    week_start: dayjs(),
    week_end: dayjs().add(7, 'day'),
    total_families: 0,
    total_boxes: 0,
    special_requests: '',
    status: 'pending',
  });

  const steps = ['Agency Submits', 'Coordinator Reviews', 'Packing List Created', 'Boxes Packed', 'Collected'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requirementsRes, agenciesRes] = await Promise.all([
        api.get('/weekly-requirements/'),
        api.get('/agencies/'),
      ]);
      setRequirements(requirementsRes.data);
      setAgencies(agenciesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (requirement?: WeeklyRequirement) => {
    if (requirement) {
      setEditingRequirement(requirement);
      setFormData({
        agency_id: requirement.agency_id.toString(),
        week_start: dayjs(requirement.week_start),
        week_end: dayjs(requirement.week_end),
        total_families: requirement.total_families,
        total_boxes: requirement.total_boxes,
        special_requests: requirement.special_requests || '',
        status: requirement.status,
      });
    } else {
      setEditingRequirement(null);
      setFormData({
        agency_id: '',
        week_start: dayjs(),
        week_end: dayjs().add(7, 'day'),
        total_families: 0,
        total_boxes: 0,
        special_requests: '',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRequirement(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        agency_id: parseInt(formData.agency_id),
        week_start: formData.week_start.toISOString(),
        week_end: formData.week_end.toISOString(),
      };

      if (editingRequirement) {
        await api.put(`/weekly-requirements/${editingRequirement.id}`, submitData);
      } else {
        await api.post('/weekly-requirements/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving weekly requirement:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this weekly requirement?')) {
      try {
        await api.delete(`/weekly-requirements/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting weekly requirement:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'info';
      case 'packed':
        return 'warning';
      case 'collected':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'packed':
        return 3;
      case 'collected':
        return 4;
      default:
        return 0;
    }
  };

  const getAgencyName = (agencyId: number) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading weekly requirements...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Weekly Requirements</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Submit Requirements
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Weekly Workflow:</strong> Agencies submit requirements by Wednesday afternoon → 
          Coordinator reviews and confirms → Packing lists are created → Boxes are packed → 
          Agencies collect on Thursday 9:30-10:30am
        </Typography>
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agency</TableCell>
              <TableCell>Week</TableCell>
              <TableCell>Families</TableCell>
              <TableCell>Boxes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((requirement) => (
              <TableRow key={requirement.id}>
                <TableCell>{getAgencyName(requirement.agency_id)}</TableCell>
                <TableCell>
                  {dayjs(requirement.week_start).format('MMM DD')} - {dayjs(requirement.week_end).format('MMM DD')}
                </TableCell>
                <TableCell>{requirement.total_families}</TableCell>
                <TableCell>{requirement.total_boxes}</TableCell>
                <TableCell>
                  <Chip
                    label={requirement.status.toUpperCase()}
                    color={getStatusColor(requirement.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stepper activeStep={getStatusStep(requirement.status)} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(requirement)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(requirement.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Weekly Requirement Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRequirement ? 'Edit Weekly Requirements' : 'Submit Weekly Requirements'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Agency</InputLabel>
                  <Select
                    value={formData.agency_id}
                    onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
                  >
                    {agencies.map((agency) => (
                      <MenuItem key={agency.id} value={agency.id.toString()}>
                        {agency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="packed">Packed</MenuItem>
                    <MenuItem value="collected">Collected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Week Start"
                  value={formData.week_start}
                  onChange={(newValue) => setFormData({ ...formData, week_start: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Week End"
                  value={formData.week_end}
                  onChange={(newValue) => setFormData({ ...formData, week_end: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Families"
                  type="number"
                  value={formData.total_families}
                  onChange={(e) => setFormData({ ...formData, total_families: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Boxes"
                  type="number"
                  value={formData.total_boxes}
                  onChange={(e) => setFormData({ ...formData, total_boxes: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests"
                  multiline
                  rows={3}
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  placeholder="Any special dietary requirements, allergies, or other needs..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRequirement ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyRequirements;
