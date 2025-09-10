import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Family as FamilyIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

interface DashboardStats {
  totalAgencies: number;
  totalFamilies: number;
  totalItems: number;
  pendingPackingLists: number;
  upcomingSessions: number;
  activeVolunteers: number;
}

const Dashboard: React.FC = () => {
  const { api } = useApi();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalFamilies: 0,
    totalItems: 0,
    pendingPackingLists: 0,
    upcomingSessions: 0,
    activeVolunteers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agenciesRes, familiesRes, itemsRes, packingListsRes] = await Promise.all([
          api.get('/agencies/'),
          api.get('/families/'),
          api.get('/items/'),
          api.get('/packing-lists/'),
        ]);

        setStats({
          totalAgencies: agenciesRes.data.length,
          totalFamilies: familiesRes.data.length,
          totalItems: itemsRes.data.length,
          pendingPackingLists: packingListsRes.data.filter((list: any) => list.status === 'scheduled').length,
          upcomingSessions: 0, // TODO: Implement when packing sessions are added
          activeVolunteers: 0, // TODO: Implement when volunteers are added
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [api]);

  const statCards = [
    {
      title: 'Agencies',
      value: stats.totalAgencies,
      icon: <BusinessIcon />,
      color: '#1976d2',
    },
    {
      title: 'Families',
      value: stats.totalFamilies,
      icon: <FamilyIcon />,
      color: '#dc004e',
    },
    {
      title: 'Inventory Items',
      value: stats.totalItems,
      icon: <InventoryIcon />,
      color: '#2e7d32',
    },
    {
      title: 'Pending Packing Lists',
      value: stats.pendingPackingLists,
      icon: <AssignmentIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: <ScheduleIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Active Volunteers',
      value: stats.activeVolunteers,
      icon: <PeopleIcon />,
      color: '#f57c00',
    },
  ];

  const quickActions = [
    { title: 'Add New Agency', description: 'Register a new agency', path: '/agencies' },
    { title: 'Add Family', description: 'Register a new family', path: '/families' },
    { title: 'Create Packing List', description: 'Create a new packing list', path: '/packing-lists' },
    { title: 'View Inventory', description: 'Check current inventory levels', path: '/inventory' },
  ];

  const recentActivities = [
    { action: 'New family registered', time: '2 hours ago', type: 'info' },
    { action: 'Packing list completed', time: '4 hours ago', type: 'success' },
    { action: 'Inventory updated', time: '6 hours ago', type: 'info' },
    { action: 'New order placed', time: '1 day ago', type: 'warning' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box color={card.color}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              {quickActions.map((action, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={action.title}
                    secondary={action.description}
                  />
                  <Button variant="outlined" size="small">
                    Go
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                  />
                  <Chip
                    label={activity.type}
                    color={activity.type === 'success' ? 'success' : activity.type === 'warning' ? 'warning' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
