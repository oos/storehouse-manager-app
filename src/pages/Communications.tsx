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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '../contexts/ApiContext';

interface Communication {
  id: number;
  recipient_type: string;
  recipient_id?: number;
  subject: string;
  message: string;
  communication_type: string;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  created_by: number;
}

interface Template {
  id: number;
  name: string;
  subject: string;
  message: string;
  recipient_type: string;
  communication_type: string;
}

const Communications: React.FC = () => {
  const { api } = useApi();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    recipient_type: '',
    recipient_id: '',
    subject: '',
    message: '',
    communication_type: 'email',
    status: 'draft',
    scheduled_at: dayjs(),
  });
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    message: '',
    recipient_type: '',
    communication_type: 'email',
  });

  const recipientTypes = [
    { value: 'all_agencies', label: 'All Agencies' },
    { value: 'all_volunteers', label: 'All Volunteers' },
    { value: 'all_families', label: 'All Families' },
    { value: 'specific_agency', label: 'Specific Agency' },
    { value: 'specific_volunteer', label: 'Specific Volunteer' },
    { value: 'specific_family', label: 'Specific Family' },
  ];

  const communicationTypes = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'notification', label: 'In-App Notification' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [communicationsRes, templatesRes] = await Promise.all([
        api.get('/communications/'),
        api.get('/communication-templates/'),
      ]);
      setCommunications(communicationsRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (communication?: Communication) => {
    if (communication) {
      setEditingCommunication(communication);
      setFormData({
        recipient_type: communication.recipient_type,
        recipient_id: communication.recipient_id?.toString() || '',
        subject: communication.subject,
        message: communication.message,
        communication_type: communication.communication_type,
        status: communication.status,
        scheduled_at: communication.scheduled_at ? dayjs(communication.scheduled_at) : dayjs(),
      });
    } else {
      setEditingCommunication(null);
      setFormData({
        recipient_type: '',
        recipient_id: '',
        subject: '',
        message: '',
        communication_type: 'email',
        status: 'draft',
        scheduled_at: dayjs(),
      });
    }
    setOpen(true);
  };

  const handleTemplateOpen = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateData({
        name: template.name,
        subject: template.subject,
        message: template.message,
        recipient_type: template.recipient_type,
        communication_type: template.communication_type,
      });
    } else {
      setEditingTemplate(null);
      setTemplateData({
        name: '',
        subject: '',
        message: '',
        recipient_type: '',
        communication_type: 'email',
      });
    }
    setTemplateOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCommunication(null);
  };

  const handleTemplateClose = () => {
    setTemplateOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        recipient_id: formData.recipient_id ? parseInt(formData.recipient_id) : null,
        scheduled_at: formData.scheduled_at.toISOString(),
      };

      if (editingCommunication) {
        await api.put(`/communications/${editingCommunication.id}`, submitData);
      } else {
        await api.post('/communications/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving communication:', error);
    }
  };

  const handleTemplateSubmit = async () => {
    try {
      if (editingTemplate) {
        await api.put(`/communication-templates/${editingTemplate.id}`, templateData);
      } else {
        await api.post('/communication-templates/', templateData);
      }
      fetchData();
      handleTemplateClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleSend = async (id: number) => {
    try {
      await api.post(`/communications/${id}/send`);
      fetchData();
    } catch (error) {
      console.error('Error sending communication:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        await api.delete(`/communications/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting communication:', error);
      }
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/communication-templates/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'scheduled':
        return <ScheduleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      case 'notification':
        return <NotificationsIcon />;
      default:
        return <EmailIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading communications...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Communications</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleTemplateOpen()}
            sx={{ mr: 2 }}
          >
            New Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            New Communication
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Communications" />
          <Tab label="Templates" />
          <Tab label="Scheduled" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {communications.filter(c => c.status !== 'scheduled').map((communication) => (
                <TableRow key={communication.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getCommunicationIcon(communication.communication_type)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {communication.communication_type.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{communication.recipient_type.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>{communication.subject}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(communication.status)}
                      label={communication.status.toUpperCase()}
                      color={getStatusColor(communication.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{dayjs(communication.created_at).format('MMM DD, YYYY')}</TableCell>
                  <TableCell>
                    {communication.status === 'draft' && (
                      <IconButton onClick={() => handleSend(communication.id)}>
                        <SendIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleOpen(communication)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(communication.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getCommunicationIcon(template.communication_type)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {template.communication_type.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{template.recipient_type.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleTemplateOpen(template)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Scheduled For</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {communications.filter(c => c.status === 'scheduled').map((communication) => (
                <TableRow key={communication.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getCommunicationIcon(communication.communication_type)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {communication.communication_type.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{communication.recipient_type.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>{communication.subject}</TableCell>
                  <TableCell>
                    {dayjs(communication.scheduled_at).format('MMM DD, YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(communication)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(communication.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Communication Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCommunication ? 'Edit Communication' : 'New Communication'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recipient Type</InputLabel>
                  <Select
                    value={formData.recipient_type}
                    onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                  >
                    {recipientTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Communication Type</InputLabel>
                  <Select
                    value={formData.communication_type}
                    onChange={(e) => setFormData({ ...formData, communication_type: e.target.value })}
                  >
                    {communicationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
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
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Scheduled At"
                  value={formData.scheduled_at}
                  onChange={(newValue) => setFormData({ ...formData, scheduled_at: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCommunication ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Form Dialog */}
      <Dialog open={templateOpen} onClose={handleTemplateClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Recipient Type</InputLabel>
                <Select
                  value={templateData.recipient_type}
                  onChange={(e) => setTemplateData({ ...templateData, recipient_type: e.target.value })}
                >
                  {recipientTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Communication Type</InputLabel>
                <Select
                  value={templateData.communication_type}
                  onChange={(e) => setTemplateData({ ...templateData, communication_type: e.target.value })}
                >
                  {communicationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={templateData.subject}
                onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Template"
                multiline
                rows={6}
                value={templateData.message}
                onChange={(e) => setTemplateData({ ...templateData, message: e.target.value })}
                placeholder="Enter your message template here. Use {name}, {agency}, etc. for placeholders..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTemplateClose}>Cancel</Button>
          <Button onClick={handleTemplateSubmit} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Communications;