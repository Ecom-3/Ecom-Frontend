import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Select, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { assignGlobalStore, getGlobalStoreAssignmentOptions, getOrder } from '../../services/orderApi';
import { getStores } from '../../services/catalogApi';

const errorState = (error) => {
  if (Number(error?.status) === 404) return { title: 'Order not found', detail: 'This backend order could not be found.' };
  if (Number(error?.status) === 401 || Number(error?.status) === 403) return { title: 'Access denied', detail: 'Your account is not authorized to view or assign this order.' };
  return { title: 'Unable to load assignment', detail: error?.message || 'The order or store availability could not be loaded.' };
};

const GlobalStoreAssignment = ({ orderId }) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [options, setOptions] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedOrder, loadedOptions, loadedStores] = await Promise.all([
        getOrder(orderId), getGlobalStoreAssignmentOptions(orderId), getStores({ active: true }),
      ]);
      setOrder(loadedOrder);
      setOptions(Array.isArray(loadedOptions) ? loadedOptions : []);
      setStores(Array.isArray(loadedStores) ? loadedStores : loadedStores?.content || []);
    } catch (loadError) {
      setError(errorState(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(timer);
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const assign = async () => {
    if (!storeId) return;
    setSaving(true);
    setError(null);
    try {
      await assignGlobalStore(orderId, storeId);
      navigate('/admin/orders', { replace: true });
    } catch (assignmentError) {
      setError({ title: Number(assignmentError?.status) === 403 ? 'Access denied' : 'Assignment failed', detail: assignmentError?.message || 'The store assignment could not be saved.' });
      if (Number(assignmentError?.status) === 404) setOrder(null);
      if (Number(assignmentError?.status) === 409) await load();
    } finally {
      setSaving(false);
    }
  };

  const selectedOption = options.find((option) => option.storeId === storeId);
  const selectedStore = stores.find((store) => store.id === storeId);

  return <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400, bgcolor: 'rgba(15,23,42,.6)', p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
    <Box sx={{ maxWidth: 900, mx: 'auto', bgcolor: 'white', p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 24 }}>
      <Button onClick={() => navigate('/admin/orders')}>Close</Button>
      <Typography variant="h4" fontWeight={800} mt={2}>Assign stocked store</Typography>
      <Typography color="text.secondary">Only active stores with enough stock for every order item are listed.</Typography>
      {loading ? <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 4 }}><CircularProgress size={22} /><Typography>Loading order and store availability…</Typography></Box> : error ? <Alert severity="error" sx={{ mt: 3 }} action={<Button color="inherit" onClick={load}>Retry</Button>}><strong>{error.title}.</strong> {error.detail}</Alert> : !order ? <Alert severity="error" sx={{ mt: 3 }}>Order not found.</Alert> : <>
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2, my: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}><Typography fontWeight={800}>Order</Typography><Typography>{order.orderNumber || order.id}</Typography><Typography>Status: {order.status}</Typography><Typography>Payment: {order.paymentStatus}</Typography><Chip sx={{ mt: 1 }} label={order.globalApproval || 'Pending approval'} /></Box>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}><Typography fontWeight={800}>Product group</Typography>{order.items?.map((item) => <Typography key={item.id}>{item.productName || item.title} × {item.quantity}</Typography>)}</Box>
        </Box>
        {order.globalAssignedStoreId ? <Alert severity="info">Already assigned to {order.globalAssignedStoreId}.</Alert> : !options.length ? <Alert severity="warning">No active store has enough stock for this complete order.</Alert> : <>
          <Select fullWidth displayEmpty value={storeId} onChange={(event) => setStoreId(event.target.value)}>
            <MenuItem value="" disabled>Select stocked store</MenuItem>
            {options.map((option) => { const store = stores.find((entry) => entry.id === option.storeId); return <MenuItem key={option.storeId} value={option.storeId}>{store?.name || option.storeId} — {store?.location || store?.city || ''}</MenuItem>; })}
          </Select>
          {selectedOption && <Box sx={{ mt: 2, p: 2, border: '1px solid #dce9e3', borderRadius: 2 }}><Typography fontWeight={800}>{selectedStore?.name || selectedOption.storeId}</Typography>{selectedOption.items.map((item) => <Typography key={item.productName}>{item.productName}: {item.availableQuantity} available / {item.requestedQuantity} needed</Typography>)}</Box>}
          <Button sx={{ mt: 3 }} variant="contained" disabled={!storeId || saving} onClick={assign}>{saving ? 'Assigning…' : 'Confirm store assignment'}</Button>
        </>}
      </>}
    </Box>
  </Box>;
};

export default GlobalStoreAssignment;
