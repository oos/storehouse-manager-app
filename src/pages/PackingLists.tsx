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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '../contexts/ApiContext';

interface PackingList {
  id: number;
  week_start: string;
  week_end: string;
  total_boxes: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface PackingListItem {
  id: number;
  packing_list_id: number;
  item_id: number;
  quantity_per_box: number;
  total_quantity_needed: number;
  created_at: string;
  item?: {
    id: number;
    name: string;
    unit: string;
  };
}

interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
}

const PackingLists: React.FC = () => {
  const { api } = useApi();
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [packingListItems, setPackingListItems] = useState<PackingListItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [editingPackingList, setEditingPackingList] = useState<PackingList | null>(null);
  const [selectedPackingList, setSelectedPackingList] = useState<PackingList | null>(null);
  const [formData, setFormData] = useState({
    week_start: dayjs(),
    week_end: dayjs().add(7, 'day'),
    total_boxes: 0,
    status: 'scheduled',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packingListsRes, itemsRes] = await Promise.all([
        api.get('/packing-lists/'),
        api.get('/items/'),
      ]);
      setPackingLists(packingListsRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackingListItems = async (packingListId: number) => {
    try {
      const response = await api.get(`/packing-list-items/?packing_list_id=${packingListId}`);
      setPackingListItems(response.data);
    } catch (error) {
      console.error('Error fetching packing list items:', error);
    }
  };

  const handleOpen = (packingList?: PackingList) => {
    if (packingList) {
      setEditingPackingList(packingList);
      setFormData({
        week_start: dayjs(packingList.week_start),
        week_end: dayjs(packingList.week_end),
        total_boxes: packingList.total_boxes,
        status: packingList.status,
      });
    } else {
      setEditingPackingList(null);
      setFormData({
        week_start: dayjs(),
        week_end: dayjs().add(7, 'day'),
        total_boxes: 0,
        status: 'scheduled',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPackingList(null);
  };

  const handleItemsOpen = async (packingList: PackingList) => {
    setSelectedPackingList(packingList);
    await fetchPackingListItems(packingList.id);
    setItemsOpen(true);
  };

  const handleItemsClose = () => {
    setItemsOpen(false);
    setSelectedPackingList(null);
    setPackingListItems([]);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        week_start: formData.week_start.toISOString(),
        week_end: formData.week_end.toISOString(),
        total_boxes: formData.total_boxes,
        status: formData.status,
      };

      if (editingPackingList) {
        await api.put(`/packing-lists/${editingPackingList.id}`, submitData);
      } else {
        await api.post('/packing-lists/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving packing list:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this packing list?')) {
      try {
        await api.delete(`/packing-lists/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting packing list:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading packing lists...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Packing Lists</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Packing List
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Week Start</TableCell>
              <TableCell>Week End</TableCell>
              <TableCell>Total Boxes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packingLists.map((packingList) => (
              <TableRow key={packingList.id}>
                <TableCell>{dayjs(packingList.week_start).format('MMM DD, YYYY')}</TableCell>
                <TableCell>{dayjs(packingList.week_end).format('MMM DD, YYYY')}</TableCell>
                <TableCell>{packingList.total_boxes}</TableCell>
                <TableCell>
                  <Chip
                    label={packingList.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(packingList.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{dayjs(packingList.created_at).format('MMM DD, YYYY')}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleItemsOpen(packingList)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(packingList)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(packingList.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Packing List Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPackingList ? 'Edit Packing List' : 'Create New Packing List'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  label="Total Boxes"
                  type="number"
                  value={formData.total_boxes}
                  onChange={(e) => setFormData({ ...formData, total_boxes: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPackingList ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Packing List Items Dialog */}
      <Dialog open={itemsOpen} onClose={handleItemsClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon />
            Packing List Items - Week of {selectedPackingList && dayjs(selectedPackingList.week_start).format('MMM DD, YYYY')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {packingListItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary">
                No items in this packing list
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Add items to create a complete packing list
              </Typography>
            </Box>
          ) : (
            <List>
              {packingListItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.item?.name || 'Unknown Item'}`}
                      secondary={`${item.quantity_per_box} ${item.item?.unit || ''} per box × ${selectedPackingList?.total_boxes || 0} boxes = ${item.total_quantity_needed} ${item.item?.unit || ''} total`}
                    />
                  </ListItem>
                  {index < packingListItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleItemsClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PackingLists;
