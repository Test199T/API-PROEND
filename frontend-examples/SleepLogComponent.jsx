import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  Bed as BedIcon,
  WbSunny as WbSunnyIcon,
} from '@mui/icons-material';

const SleepLogComponent = () => {
  const [sleepLogs, setSleepLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    sleep_date: '',
    bedtime: '',
    wake_time: '',
    sleep_duration_hours: 0,
    sleep_quality: 'good',
    sleep_efficiency_percentage: 0,
    time_to_fall_asleep_minutes: 0,
    awakenings_count: 0,
    deep_sleep_minutes: 0,
    light_sleep_minutes: 0,
    rem_sleep_minutes: 0,
    awake_minutes: 0,
    heart_rate_avg: 0,
    room_temperature_celsius: 0,
    caffeine_intake_mg: 0,
    alcohol_intake_ml: 0,
    exercise_before_bed_hours: 0,
    screen_time_before_bed_minutes: 0,
    stress_level: 5,
    mood_before_sleep: 5,
    mood_after_wake: 5,
    energy_level: 5,
    notes: '',
    dreams_remembered: false,
    nightmares: false,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Fetch sleep logs
  const fetchSleepLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sleep-log`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sleep logs');
      }
      
      const data = await response.json();
      setSleepLogs(data.data.sleep_logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sleep-log/stats/overview`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch trends
  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sleep-log/trends?days=7`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrends(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sleep-log/recommendations`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  // Create or update sleep log
  const saveSleepLog = async () => {
    try {
      setLoading(true);
      const url = editingLog 
        ? `${API_BASE_URL}/sleep-log/${editingLog.id}`
        : `${API_BASE_URL}/sleep-log`;
      
      const method = editingLog ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save sleep log');
      }
      
      await fetchSleepLogs();
      await fetchStats();
      await fetchTrends();
      await fetchRecommendations();
      
      setOpenDialog(false);
      setEditingLog(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete sleep log
  const deleteSleepLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sleep log?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sleep-log/${id}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete sleep log');
      }
      
      await fetchSleepLogs();
      await fetchStats();
      await fetchTrends();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      sleep_date: '',
      bedtime: '',
      wake_time: '',
      sleep_duration_hours: 0,
      sleep_quality: 'good',
      sleep_efficiency_percentage: 0,
      time_to_fall_asleep_minutes: 0,
      awakenings_count: 0,
      deep_sleep_minutes: 0,
      light_sleep_minutes: 0,
      rem_sleep_minutes: 0,
      awake_minutes: 0,
      heart_rate_avg: 0,
      room_temperature_celsius: 0,
      caffeine_intake_mg: 0,
      alcohol_intake_ml: 0,
      exercise_before_bed_hours: 0,
      screen_time_before_bed_minutes: 0,
      stress_level: 5,
      mood_before_sleep: 5,
      mood_after_wake: 5,
      energy_level: 5,
      notes: '',
      dreams_remembered: false,
      nightmares: false,
    });
  };

  // Open dialog for editing
  const openEditDialog = (log) => {
    setEditingLog(log);
    setFormData({
      sleep_date: log.sleep_date.split('T')[0],
      bedtime: log.bedtime,
      wake_time: log.wake_time,
      sleep_duration_hours: log.sleep_duration_hours,
      sleep_quality: log.sleep_quality,
      sleep_efficiency_percentage: log.sleep_efficiency_percentage,
      time_to_fall_asleep_minutes: log.time_to_fall_asleep_minutes,
      awakenings_count: log.awakenings_count,
      deep_sleep_minutes: log.deep_sleep_minutes,
      light_sleep_minutes: log.light_sleep_minutes,
      rem_sleep_minutes: log.rem_sleep_minutes,
      awake_minutes: log.awake_minutes,
      heart_rate_avg: log.heart_rate_avg,
      room_temperature_celsius: log.room_temperature_celsius,
      caffeine_intake_mg: log.caffeine_intake_mg,
      alcohol_intake_ml: log.alcohol_intake_ml,
      exercise_before_bed_hours: log.exercise_before_bed_hours,
      screen_time_before_bed_minutes: log.screen_time_before_bed_minutes,
      stress_level: log.stress_level,
      mood_before_sleep: log.mood_before_sleep,
      mood_after_wake: log.mood_after_wake,
      energy_level: log.energy_level,
      notes: log.notes,
      dreams_remembered: log.dreams_remembered,
      nightmares: log.nightmares,
    });
    setOpenDialog(true);
  };

  // Get sleep quality color
  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      case 'very_poor': return 'error';
      default: return 'default';
    }
  };

  // Get sleep quality label
  const getSleepQualityLabel = (quality) => {
    switch (quality) {
      case 'excellent': return 'ยอดเยี่ยม';
      case 'good': return 'ดี';
      case 'fair': return 'ปานกลาง';
      case 'poor': return 'แย่';
      case 'very_poor': return 'แย่มาก';
      default: return quality;
    }
  };

  // Format sleep duration
  const formatSleepDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ชม. ${m} นาที`;
  };

  useEffect(() => {
    fetchSleepLogs();
    fetchStats();
    fetchTrends();
    fetchRecommendations();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <BedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Sleep Log Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Sleep Duration
                </Typography>
                <Typography variant="h5">
                  {stats.average_sleep_duration_hours?.toFixed(1)} hrs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Sleep Score
                </Typography>
                <Typography variant="h5">
                  {stats.average_sleep_score?.toFixed(0)}/100
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Sleep Efficiency
                </Typography>
                <Typography variant="h5">
                  {stats.average_sleep_efficiency_percentage?.toFixed(0)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Logs
                </Typography>
                <Typography variant="h5">
                  {stats.total_sleep_logs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sleep Recommendations
            </Typography>
            {recommendations.map((rec, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{rec.title}</Typography>
                <Typography variant="body2">{rec.description}</Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setEditingLog(null);
            setOpenDialog(true);
          }}
        >
          Add Sleep Log
        </Button>
      </Box>

      {/* Sleep Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sleep Logs
          </Typography>
          
          {loading && <LinearProgress />}
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Bedtime</TableCell>
                  <TableCell>Wake Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Quality</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sleepLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.sleep_date).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1, fontSize: 16 }} />
                        {log.bedtime}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WbSunnyIcon sx={{ mr: 1, fontSize: 16 }} />
                        {log.wake_time}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatSleepDuration(log.sleep_duration_hours)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSleepQualityLabel(log.sleep_quality)}
                        color={getSleepQualityColor(log.sleep_quality)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {log.sleep_score}
                        {log.sleep_score >= 80 ? (
                          <TrendingUpIcon color="success" sx={{ ml: 1, fontSize: 16 }} />
                        ) : log.sleep_score < 60 ? (
                          <TrendingDownIcon color="error" sx={{ ml: 1, fontSize: 16 }} />
                        ) : null}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(log)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => deleteSleepLog(log.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLog ? 'Edit Sleep Log' : 'Add Sleep Log'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sleep Date"
                type="date"
                value={formData.sleep_date}
                onChange={(e) => setFormData({ ...formData, sleep_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedtime"
                type="time"
                value={formData.bedtime}
                onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Wake Time"
                type="time"
                value={formData.wake_time}
                onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sleep Duration (hours)"
                type="number"
                value={formData.sleep_duration_hours}
                onChange={(e) => setFormData({ ...formData, sleep_duration_hours: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 24, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sleep Quality</InputLabel>
                <Select
                  value={formData.sleep_quality}
                  onChange={(e) => setFormData({ ...formData, sleep_quality: e.target.value })}
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="very_poor">Very Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sleep Efficiency (%)"
                type="number"
                value={formData.sleep_efficiency_percentage}
                onChange={(e) => setFormData({ ...formData, sleep_efficiency_percentage: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time to Fall Asleep (minutes)"
                type="number"
                value={formData.time_to_fall_asleep_minutes}
                onChange={(e) => setFormData({ ...formData, time_to_fall_asleep_minutes: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Awakenings Count"
                type="number"
                value={formData.awakenings_count}
                onChange={(e) => setFormData({ ...formData, awakenings_count: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={saveSleepLog} variant="contained" disabled={loading}>
            {editingLog ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SleepLogComponent;
