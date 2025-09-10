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

interface InventoryItem {
  id: number;
  item_id: number;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  location?: string;
  expiry_date?: string;
  created_at: string;
}

interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
}

const Inventory: React.FC = () => {
  const { api } = useApi();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 0,
    min_quantity: 0,
    max_quantity: '',
    location: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, itemsRes] = await Promise.all([
        api.get('/inventory/'),
        api.get('/items/'),
      ]);
      setInventory(inventoryRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_id: item.item_id.toString(),
        quantity: item.quantity,
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity?.toString() || '',
        location: item.location || '',
        expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_id: '',
        quantity: 0,
        min_quantity: 0,
        max_quantity: '',
        location: '',
        expiry_date: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        item_id: parseInt(formData.item_id),
        quantity: parseFloat(formData.quantity.toString()),
        min_quantity: parseFloat(formData.min_quantity.toString()),
        max_quantity: formData.max_quantity ? parseFloat(formData.max_quantity) : null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };

      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, submitData);
      } else {
        await api.post('/inventory/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const getItemName = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown';
  };

  const getItemUnit = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.unit : '';
  };

  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= item.min_quantity;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading inventory...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Inventory Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Min Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{getItemName(item.item_id)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{getItemUnit(item.item_id)}</TableCell>
                <TableCell>{item.min_quantity}</TableCell>
                <TableCell>{item.location || '-'}</TableCell>
                <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={isLowStock(item) ? 'Low Stock' : 'In Stock'}
                    color={isLowStock(item) ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)}>
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
          {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Item</InputLabel>
                <Select
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                >
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.unit})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Quantity"
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Quantity"
                type="number"
                value={formData.max_quantity}
                onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
