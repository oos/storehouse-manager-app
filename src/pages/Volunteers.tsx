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
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '../contexts/ApiContext';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

interface Rota {
  id: number;
  rota_type: string;
  quarter_start: string;
  quarter_end: string;
  is_active: boolean;
  created_at: string;
}

interface RotaAssignment {
  id: number;
  rota_id: number;
  user_id: number;
  week_start: string;
  week_end: string;
  role: string;
  confirmed: boolean;
  notes?: string;
  created_at: string;
  user?: User;
}

const Volunteers: React.FC = () => {
  const { api } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [assignments, setAssignments] = useState<RotaAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [rotaOpen, setRotaOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRota, setEditingRota] = useState<Rota | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<RotaAssignment | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'packing_volunteer',
    phone: '',
    is_active: true,
  });
  const [rotaFormData, setRotaFormData] = useState({
    rota_type: 'packing',
    quarter_start: dayjs(),
    quarter_end: dayjs().add(3, 'month'),
    is_active: true,
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    rota_id: '',
    user_id: '',
    week_start: dayjs(),
    week_end: dayjs().add(1, 'week'),
    role: 'packing_volunteer',
    confirmed: false,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rotasRes, assignmentsRes] = await Promise.all([
        api.get('/users/'),
        api.get('/rotas/'),
        api.get('/rota-assignments/'),
      ]);
      setUsers(usersRes.data);
      setRotas(rotasRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserOpen = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone || '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        full_name: '',
        role: 'packing_volunteer',
        phone: '',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleRotaOpen = (rota?: Rota) => {
    if (rota) {
      setEditingRota(rota);
      setRotaFormData({
        rota_type: rota.rota_type,
        quarter_start: dayjs(rota.quarter_start),
        quarter_end: dayjs(rota.quarter_end),
        is_active: rota.is_active,
      });
    } else {
      setEditingRota(null);
      setRotaFormData({
        rota_type: 'packing',
        quarter_start: dayjs(),
        quarter_end: dayjs().add(3, 'month'),
        is_active: true,
      });
    }
    setRotaOpen(true);
  };

  const handleAssignmentOpen = (assignment?: RotaAssignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setAssignmentFormData({
        rota_id: assignment.rota_id.toString(),
        user_id: assignment.user_id.toString(),
        week_start: dayjs(assignment.week_start),
        week_end: dayjs(assignment.week_end),
        role: assignment.role,
        confirmed: assignment.confirmed,
        notes: assignment.notes || '',
      });
    } else {
      setEditingAssignment(null);
      setAssignmentFormData({
        rota_id: '',
        user_id: '',
        week_start: dayjs(),
        week_end: dayjs().add(1, 'week'),
        role: 'packing_volunteer',
        confirmed: false,
        notes: '',
      });
    }
    setAssignmentOpen(true);
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/auth/register', { ...formData, password: 'temp123' });
      }
      fetchData();
      setOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleRotaSubmit = async () => {
    try {
      const submitData = {
        ...rotaFormData,
        quarter_start: rotaFormData.quarter_start.toISOString(),
        quarter_end: rotaFormData.quarter_end.toISOString(),
      };

      if (editingRota) {
        await api.put(`/rotas/${editingRota.id}`, submitData);
      } else {
        await api.post('/rotas/', submitData);
      }
      fetchData();
      setRotaOpen(false);
    } catch (error) {
      console.error('Error saving rota:', error);
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      const submitData = {
        ...assignmentFormData,
        rota_id: parseInt(assignmentFormData.rota_id),
        user_id: parseInt(assignmentFormData.user_id),
        week_start: assignmentFormData.week_start.toISOString(),
        week_end: assignmentFormData.week_end.toISOString(),
      };

      if (editingAssignment) {
        await api.put(`/rota-assignments/${editingAssignment.id}`, submitData);
      } else {
        await api.post('/rota-assignments/', submitData);
      }
      fetchData();
      setAssignmentOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'primary';
      case 'rota_manager':
        return 'secondary';
      case 'packing_volunteer':
        return 'success';
      case 'driver':
        return 'warning';
      case 'resident':
        return 'info';
      default:
        return 'default';
    }
  };

  const getVolunteerUsers = () => {
    return users.filter(user => 
      ['packing_volunteer', 'driver', 'resident', 'online_shopper', 'physical_shopper'].includes(user.role)
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading volunteers...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Volunteers & Scheduling</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => handleUserOpen()}
            sx={{ mr: 1 }}
          >
            Add Volunteer
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => handleRotaOpen()}
            sx={{ mr: 1 }}
          >
            Create Rota
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => handleAssignmentOpen()}
          >
            Assign Volunteer
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Volunteers" />
          <Tab label="Rotas" />
          <Tab label="Assignments" />
        </Tabs>
      </Paper>

      {/* Volunteers Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getVolunteerUsers().map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.replace('_', ' ').toUpperCase()}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleUserOpen(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rotas Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Quarter Start</TableCell>
                <TableCell>Quarter End</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rotas.map((rota) => (
                <TableRow key={rota.id}>
                  <TableCell>
                    <Chip
                      label={rota.rota_type.toUpperCase()}
                      color={rota.rota_type === 'packing' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dayjs(rota.quarter_start).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>{dayjs(rota.quarter_end).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>
                    <Chip
                      label={rota.is_active ? 'Active' : 'Inactive'}
                      color={rota.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dayjs(rota.created_at).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRotaOpen(rota)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assignments Tab */}
      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Volunteer</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Week Start</TableCell>
                <TableCell>Week End</TableCell>
                <TableCell>Confirmed</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.user?.full_name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.role.replace('_', ' ').toUpperCase()}
                      color={getRoleColor(assignment.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dayjs(assignment.week_start).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>{dayjs(assignment.week_end).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.confirmed ? 'Confirmed' : 'Pending'}
                      color={assignment.confirmed ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleAssignmentOpen(assignment)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Form Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit Volunteer' : 'Add New Volunteer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="packing_volunteer">Packing Volunteer</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="resident">Resident on Site</MenuItem>
                  <MenuItem value="online_shopper">Online Shopper</MenuItem>
                  <MenuItem value="physical_shopper">Physical Shopper</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rota Form Dialog */}
      <Dialog open={rotaOpen} onClose={() => setRotaOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRota ? 'Edit Rota' : 'Create New Rota'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rota Type</InputLabel>
                  <Select
                    value={rotaFormData.rota_type}
                    onChange={(e) => setRotaFormData({ ...rotaFormData, rota_type: e.target.value })}
                  >
                    <MenuItem value="packing">Packing</MenuItem>
                    <MenuItem value="hygiene">Hygiene</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Quarter Start"
                  value={rotaFormData.quarter_start}
                  onChange={(newValue) => setRotaFormData({ ...rotaFormData, quarter_start: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Quarter End"
                  value={rotaFormData.quarter_end}
                  onChange={(newValue) => setRotaFormData({ ...rotaFormData, quarter_end: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rotaFormData.is_active}
                      onChange={(e) => setRotaFormData({ ...rotaFormData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRotaOpen(false)}>Cancel</Button>
          <Button onClick={handleRotaSubmit} variant="contained">
            {editingRota ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Form Dialog */}
      <Dialog open={assignmentOpen} onClose={() => setAssignmentOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rota</InputLabel>
                  <Select
                    value={assignmentFormData.rota_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, rota_id: e.target.value })}
                  >
                    {rotas.map((rota) => (
                      <MenuItem key={rota.id} value={rota.id.toString()}>
                        {rota.rota_type.toUpperCase()} - {dayjs(rota.quarter_start).format('MMM YYYY')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Volunteer</InputLabel>
                  <Select
                    value={assignmentFormData.user_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, user_id: e.target.value })}
                  >
                    {getVolunteerUsers().map((user) => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        {user.full_name} ({user.role.replace('_', ' ')})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Week Start"
                  value={assignmentFormData.week_start}
                  onChange={(newValue) => setAssignmentFormData({ ...assignmentFormData, week_start: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Week End"
                  value={assignmentFormData.week_end}
                  onChange={(newValue) => setAssignmentFormData({ ...assignmentFormData, week_end: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={assignmentFormData.role}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, role: e.target.value })}
                  >
                    <MenuItem value="packing_volunteer">Packing Volunteer</MenuItem>
                    <MenuItem value="driver">Driver</MenuItem>
                    <MenuItem value="resident">Resident on Site</MenuItem>
                    <MenuItem value="online_shopper">Online Shopper</MenuItem>
                    <MenuItem value="physical_shopper">Physical Shopper</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={assignmentFormData.notes}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={assignmentFormData.confirmed}
                      onChange={(e) => setAssignmentFormData({ ...assignmentFormData, confirmed: e.target.checked })}
                    />
                  }
                  label="Confirmed"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignmentSubmit} variant="contained">
            {editingAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Volunteers;
