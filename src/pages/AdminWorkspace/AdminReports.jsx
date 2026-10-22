import { useMemo, useState } from 'react';
import { Alert, Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { buildReportExport, calculateStorePerformance, downloadJsonReport, filterReportOrders } from './adminReportData.js';
import './AdminReports.css';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const AdminReports = ({ orders, customers, products, inventory, stores }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [location, setLocation] = useState('All');
  const [store, setStore] = useState('All');
  const [sort, setSort] = useState('revenue');
  const [exportMessage, setExportMessage] = useState('');
  const locations = [...new Set(stores.map((item) => item.location).filter(Boolean))].sort();
  const selectableStores = stores.filter((item) => location === 'All' || item.location === location)
    .sort((left, right) => left.name.localeCompare(right.name));
  const filtered = useMemo(() => filterReportOrders(orders, { from, to, location, store }), [orders, from, to, location, store]);
  const revenue = filtered.filter((item) => item.status !== 'Cancelled' && item.status !== 'CANCELLED')
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
  const delivered = filtered.filter((item) => item.status === 'Delivered' || item.status === 'DELIVERED').length;
  const performance = useMemo(() => calculateStorePerformance(
    selectableStores.filter((item) => store === 'All' || item.name === store), filtered, sort,
  ), [selectableStores, filtered, store, sort]);
  const reset = () => {
    setFrom(''); setTo(''); setLocation('All'); setStore('All'); setSort('revenue'); setExportMessage('');
  };
  const exportReport = () => {
    try {
      const payload = buildReportExport({ filters: { from, to, location, store, sort }, orders: filtered, storePerformance: performance });
      const filename = downloadJsonReport(payload);
      setExportMessage(`Download started: ${filename}. Check your browser downloads.`);
    } catch (error) {
      setExportMessage(`Could not export the report. ${error.message || 'Please try again.'}`);
    }
  };

  return <Box className="reports-dashboard">
    <Box className="reports-filters">
      <TextField label="From" type="date" size="small" value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="To" type="date" size="small" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <Select size="small" value={location} onChange={(event) => { setLocation(event.target.value); setStore('All'); }}>
        <MenuItem value="All">All locations</MenuItem>{locations.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
      </Select>
      <Select size="small" value={store} onChange={(event) => setStore(event.target.value)}>
        <MenuItem value="All">All stores in location</MenuItem>{selectableStores.map((item) => <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>)}
      </Select>
      <Select size="small" value={sort} onChange={(event) => setSort(event.target.value)}>
        <MenuItem value="revenue">Sort stores by revenue</MenuItem><MenuItem value="orders">Sort stores by orders</MenuItem><MenuItem value="name">Sort stores by name</MenuItem>
      </Select>
      <Button onClick={reset}>Reset</Button><Button variant="contained" onClick={exportReport}>Export JSON</Button>
    </Box>
    {exportMessage && <Alert role="status" severity={exportMessage.startsWith('Could not') ? 'error' : 'success'} sx={{ mt: 1 }}>{exportMessage}</Alert>}
    <Box className="reports-kpis">{[
      ['Revenue', money(revenue)], ['Orders', filtered.length], ['Delivered', delivered], ['Customers', customers.length],
      ['Products', products.length], ['Stock Units', inventory.reduce((sum, item) => sum + Number(item.availableQuantity || 0), 0)],
    ].map(([label, value]) => <Box className="reports-kpi" key={label}><Typography>{label}</Typography><Typography variant="h5">{value}</Typography><small>{store !== 'All' ? store : location !== 'All' ? location : 'All business data'}</small></Box>)}</Box>
    <Box className="report-card" sx={{ mt: 2 }}><Typography variant="h6" fontWeight={800}>Store performance</Typography>
      <Box className="analytics-table"><header><span>Store and location</span><span>Orders</span><span>Revenue</span></header>
        {performance.map((item) => <div key={item.name}><span>{item.name}<small style={{ display: 'block' }}>{item.location}</small></span><span>{item.orders}</span><strong>{money(item.revenue)}</strong></div>)}
      </Box>
    </Box>
  </Box>;
};

export default AdminReports;
