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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

interface Family {
  id: number;
  agency_id: number;
  family_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  family_size: number;
  special_requirements?: string;
  status: string;
  created_at: string;
}

interface Agency {
  id: number;
  name: string;
}

const Families: React.FC = () => {
  const { api } = useApi();
  const [families, setFamilies] = useState<Family[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({
    agency_id: '',
    family_name: '',
    contact_person: '',
    phone: '',
    address: '',
    family_size: 1,
    special_requirements: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [familiesRes, agenciesRes] = await Promise.all([
        api.get('/families/'),
        api.get('/agencies/'),
      ]);
      setFamilies(familiesRes.data);
      setAgencies(agenciesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (family?: Family) => {
    if (family) {
      setEditingFamily(family);
      setFormData({
        agency_id: family.agency_id.toString(),
        family_name: family.family_name,
        contact_person: family.contact_person,
        phone: family.phone || '',
        address: family.address || '',
        family_size: family.family_size,
        special_requirements: family.special_requirements || '',
        status: family.status,
      });
    } else {
      setEditingFamily(null);
      setFormData({
        agency_id: '',
        family_name: '',
        contact_person: '',
        phone: '',
        address: '',
        family_size: 1,
        special_requirements: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFamily(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        agency_id: parseInt(formData.agency_id),
        family_size: parseInt(formData.family_size.toString()),
      };

      if (editingFamily) {
        await api.put(`/families/${editingFamily.id}`, submitData);
      } else {
        await api.post('/families/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving family:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this family?')) {
      try {
        await api.delete(`/families/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting family:', error);
      }
    }
  };

  const getAgencyName = (agencyId: number) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'Unknown';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading families...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Families</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Family
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Family Name</TableCell>
              <TableCell>Agency</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Family Size</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {families.map((family) => (
              <TableRow key={family.id}>
                <TableCell>{family.family_name}</TableCell>
                <TableCell>{getAgencyName(family.agency_id)}</TableCell>
                <TableCell>{family.contact_person}</TableCell>
                <TableCell>{family.family_size}</TableCell>
                <TableCell>{family.phone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={family.status}
                    color={family.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(family)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(family.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFamily ? 'Edit Family' : 'Add New Family'}
        </DialogTitle>
        <DialogContent>
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
              <TextField
                fullWidth
                label="Family Name"
                value={formData.family_name}
                onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Family Size"
                type="number"
                value={formData.family_size}
                onChange={(e) => setFormData({ ...formData, family_size: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="temporary">Temporary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements"
                multiline
                rows={2}
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFamily ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Families;
