import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Switch, TextField, Typography, FormControlLabel, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createDeliveryPartner, getDeliveryPartners, setDeliveryPartnerActive } from '../../services/deliveryPartnerApi';
import { deliveryPartnerLocation } from '../../services/deliveryPartnerLocation.js';
import DeliveryPartnerDetailsDialog from '../../components/DeliveryPartnerDetailsDialog.jsx';
import { orgAccessService } from '../../services/orgAccessService.js';

const locationUpdated = (partner) => {
  if (!deliveryPartnerLocation(partner)) return 'No valid GPS location shared';
  const date = partner.deliveryLocationUpdatedAt ? new Date(partner.deliveryLocationUpdatedAt) : null;
  return date && !Number.isNaN(date.getTime()) ? `Location updated ${date.toLocaleString()}` : 'Location available';
};
const displayRegion = (value) => String(value || '').trim().replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const mobilePattern = /^[+0-9 ()-]{7,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminDeliveryPartners({ role, location, stores = [] }) {
  const [partners, setPartners] = useState([]);
  const [managerStoreIds, setManagerStoreIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({name:'',mobile:'',username:'',email:'',password:'',vehicleType:'Bike',vehicleNumber:'',licenceNumber:'',address:'',active:true,storeId:''});
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await getDeliveryPartners();
      setPartners(Array.isArray(rows) ? rows : []);
    } catch (reason) {
      setError(reason.message || 'Unable to load delivery partners.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let ignore = false;
    const staffRequest = role === 'location-admin' ? orgAccessService.listUsers() : Promise.resolve([]);
    Promise.all([getDeliveryPartners(), staffRequest]).then(([rows, staff]) => {
      if (ignore) return;
      setPartners(Array.isArray(rows) ? rows : []);
      setManagerStoreIds(Array.isArray(staff) ? staff.filter((item) => String(item.role || '').toUpperCase() === 'STORE_MANAGER').map((item) => String(item.storeId || '')).filter(Boolean) : []);
    }).catch((reason) => { if (!ignore) setError(reason.message || 'Unable to load delivery partners.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [role]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return partners;
    return partners.filter((partner) => [partner.name, partner.username, partner.email, partner.mobile, partner.phone,
      partner.store, partner.storeLocation, partner.location, partner.address, partner.vehicleType, partner.vehicleNumber, partner.licenceNumber]
      .some((value) => String(value || '').trim().toLowerCase().includes(term)));
  }, [partners, query]);
  const locationStores = useMemo(() => stores.filter((store) =>
    String(store.location || '').trim().toLowerCase() === String(location || '').trim().toLowerCase() && managerStoreIds.includes(String(store.id))), [stores, location, managerStoreIds]);
  const updateStatus = async (partner, active) => {
    setPendingStatus(String(partner.id)); setError('');
    try {
      const saved = await setDeliveryPartnerActive(partner.id, active);
      setPartners((current) => current.map((item) => String(item.id) === String(partner.id) ? {...item,...saved,status:active?'Active':'Inactive',active} : item));
    } catch (reason) { setError(reason.message || 'Unable to update partner status.'); }
    finally { setPendingStatus(''); }
  };
  const submitPasswordReset = async () => {
    setResetError('');
    if (resetPassword.length < 8 || resetPassword.length > 100) return setResetError('Password must be between 8 and 100 characters.');
    if (resetPassword !== resetPasswordConfirm) return setResetError('Passwords do not match.');
    setResetting(true);
    try {
      await orgAccessService.resetManagedStaffPassword(resetTarget?.id, resetPassword);
      setResetTarget(null); setResetPassword(''); setResetPasswordConfirm('');
      setResetMessage(`Password reset for ${resetTarget?.name || 'Delivery Partner'}. Existing sessions have been signed out.`);
    } catch (reason) { setResetError(reason.message || 'Unable to reset this Delivery Partner password.'); }
    finally { setResetting(false); }
  };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name='Name is required.';
    else if (form.name.trim().length>180) next.name='Name must be 180 characters or fewer.';
    if (!form.mobile.trim()) next.mobile='Mobile number is required.';
    else if (!mobilePattern.test(form.mobile.trim())) next.mobile='Enter a valid mobile number.';
    if (!form.username.trim()) next.username='Login username is required.';
    else if (form.username.trim().length>190) next.username='Username must be 190 characters or fewer.';
    if (!form.email.trim()) next.email='Email is required.';
    else if (!emailPattern.test(form.email.trim()) || form.email.length>255) next.email='Enter a valid email address (255 characters or fewer).';
    if (!form.password) next.password='Password is required.';
    else if (form.password.length<8 || form.password.length>100) next.password='Password must be between 8 and 100 characters.';
    if (!form.vehicleType.trim()) next.vehicleType='Vehicle type is required.';
    if (!form.vehicleNumber.trim()) next.vehicleNumber='Vehicle number is required.';
    else if (form.vehicleNumber.length>40) next.vehicleNumber='Vehicle number must be 40 characters or fewer.';
    if (!form.licenceNumber.trim()) next.licenceNumber='Licence number is required.';
    else if (form.licenceNumber.length>60) next.licenceNumber='Licence number must be 60 characters or fewer.';
    if (form.address.length>700) next.address='Address must be 700 characters or fewer.';
    if (role==='location-admin' && !form.storeId) next.storeId='Select a store in your assigned location.';
    setFieldErrors(next); return !Object.keys(next).length;
  };
  const submit = async (event) => {
    event.preventDefault(); setFormError('');
    if (creating || !validate()) return;
    setCreating(true);
    try {
      const selectedStore=locationStores.find((store)=>String(store.id)===String(form.storeId));
      await createDeliveryPartner({...form, ...(role==='location-admin'?{location,storeId:selectedStore?.id}: {})});
      setCreateOpen(false); setForm({name:'',mobile:'',username:'',email:'',password:'',vehicleType:'Bike',vehicleNumber:'',licenceNumber:'',address:'',active:true,storeId:''});
      await load();
    } catch(reason) {
      const fields=reason.payload?.fields;
      if(fields&&typeof fields==='object') setFieldErrors(fields);
      setFormError(reason.message||'Unable to create delivery partner.');
    } finally { setCreating(false); }
  };
  const field=(key,label,type='text',required=false,maxLength)=> <TextField key={key} fullWidth label={label} type={type} required={required} value={form[key]} slotProps={{htmlInput:maxLength?{maxLength}:undefined}} error={Boolean(fieldErrors[key])} helperText={fieldErrors[key]} onChange={(event)=>setForm((current)=>({...current,[key]:event.target.value}))}/>;

  return <>
    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Typography color="text.secondary">Delivery Partner details and last shared GPS are limited to your authorized organization scope.</Typography>
        <Box sx={{display:'flex',gap:1,flexWrap:'wrap'}}>
          {role==='location-admin'&&<Button variant="contained" onClick={()=>{setFormError('');setFieldErrors({});setCreateOpen(true);}} disabled={!locationStores.length}>Create Delivery Partner</Button>}
          <Button onClick={load} disabled={loading}>Refresh partners</Button>
        </Box>
      </Box>
      <TextField size="small" label="Search partners" value={query} onChange={(event) => setQuery(event.target.value)} sx={{ mb: 2, width: { xs: '100%', sm: 360 } }} />
      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={load}>Retry</Button>}>{error}</Alert>}
      {resetMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResetMessage('')}>{resetMessage}</Alert>}
      {loading ? <Typography>Loading delivery partners...</Typography> : filtered.length ? filtered.map((partner) => <Box key={partner.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', p: 1.5, borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={700}>{partner.name || 'Delivery Partner'}</Typography>
          <Typography variant="body2" color="text.secondary">Store: {partner.store || 'Not assigned'} - Store location: {displayRegion(partner.storeLocation) || 'Not recorded'}</Typography>
          <Typography variant="body2" color="text.secondary">Service region: {displayRegion(partner.location) || 'Not assigned'}</Typography>
          <Typography variant="body2" color="text.secondary">{partner.vehicleType || 'Vehicle not recorded'} - {partner.vehicleNumber || 'No vehicle number'}</Typography>
          <Typography variant="caption" color="text.secondary">{locationUpdated(partner)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {role==='location-admin'?<FormControlLabel label={partner.status || 'Unknown'} control={<Switch checked={partner.active ?? partner.status==='Active'} disabled={pendingStatus===String(partner.id)} onChange={(event)=>updateStatus(partner,event.target.checked)} slotProps={{input:{'aria-label':`Set ${partner.name} active status`}}}/>}/>:<Chip size="small" label={partner.status || 'Unknown'} color={partner.status === 'Active' ? 'success' : 'default'} />}
          {role==='location-admin'&&<Button variant="outlined" onClick={()=>{setResetTarget(partner);setResetPassword('');setResetPasswordConfirm('');setResetError('');}}>Reset password</Button>}
          <Button variant="outlined" onClick={() => setSelected(partner)}>View full details & location</Button>
        </Box>
      </Box>) : <Typography color="text.secondary">{partners.length ? 'No partners match this search.' : 'No delivery partners in your authorized scope.'}</Typography>}
    </Box>
    <DeliveryPartnerDetailsDialog partner={selected} onClose={() => setSelected(null)} />
    <Dialog open={Boolean(resetTarget)} onClose={() => { if (!resetting) setResetTarget(null); }} fullWidth maxWidth="sm">
      <DialogTitle>Reset Delivery Partner password</DialogTitle>
      <DialogContent sx={{display:'grid',gap:2,pt:'12px !important'}}>
        <Typography>Set a new password for {resetTarget?.name || resetTarget?.username}. The account stays assigned to its current location and store.</Typography>
        {resetError && <Alert severity="error">{resetError}</Alert>}
        <TextField label="New password" type="password" autoComplete="new-password" value={resetPassword} onChange={(event)=>setResetPassword(event.target.value)} helperText="Use 8 to 100 characters." />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" value={resetPasswordConfirm} onChange={(event)=>setResetPasswordConfirm(event.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button disabled={resetting} onClick={()=>setResetTarget(null)}>Cancel</Button>
        <Button variant="contained" disabled={resetting||!resetPassword||!resetPasswordConfirm} onClick={submitPasswordReset}>{resetting?'Resetting...':'Reset password'}</Button>
      </DialogActions>
    </Dialog>
    {createOpen&&<Box role="dialog" aria-modal="true" aria-label="Create Delivery Partner" sx={{position:'fixed',inset:0,zIndex:1400,bgcolor:'rgba(15,23,42,.55)',display:'grid',placeItems:'center',p:2}}>
      <Box component="form" noValidate onSubmit={submit} sx={{width:'min(760px,100%)',maxHeight:'90vh',overflow:'auto',bgcolor:'white',borderRadius:2,p:3,display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:2}}>
        <Typography variant="h6" sx={{gridColumn:'1 / -1'}}>Create Delivery Partner</Typography>
        {formError&&<Alert severity="error" sx={{gridColumn:'1 / -1'}}>{formError}</Alert>}
        {field('name','Name','text',true,180)}{field('username','Login username','text',true,190)}
        {field('email','Email','email',true,255)}{field('mobile','Mobile number','tel',true,30)}
        {field('password','Temporary password','password',true,100)}
        <TextField select fullWidth required label="Vehicle type" value={form.vehicleType} error={Boolean(fieldErrors.vehicleType)} helperText={fieldErrors.vehicleType} onChange={(event)=>setForm((current)=>({...current,vehicleType:event.target.value}))}>{['Bike','Scooter','Electric Bike','Van'].map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        {field('vehicleNumber','Vehicle number','text',true,40)}{field('licenceNumber','Licence number','text',true,60)}
        <TextField fullWidth label="Address" multiline minRows={2} value={form.address} slotProps={{htmlInput:{maxLength:700}}} error={Boolean(fieldErrors.address)} helperText={fieldErrors.address} onChange={(event)=>setForm((current)=>({...current,address:event.target.value}))}/>
        {role==='location-admin'&&<TextField select fullWidth required label="Store" value={form.storeId} error={Boolean(fieldErrors.storeId)} helperText={fieldErrors.storeId||`Only stores in ${location} already assigned within your managed location are available.`} onChange={(event)=>setForm((current)=>({...current,storeId:event.target.value}))}>{locationStores.map((store)=><MenuItem key={store.id} value={store.id}>{store.name}</MenuItem>)}</TextField>}
        <FormControlLabel control={<Switch checked={form.active} onChange={(event)=>setForm((current)=>({...current,active:event.target.checked}))}/>} label={form.active?'Active':'Inactive'} sx={{gridColumn:'1 / -1'}}/>
        <Box sx={{gridColumn:'1 / -1',display:'flex',justifyContent:'flex-end',gap:1}}><Button type="button" onClick={()=>setCreateOpen(false)} disabled={creating}>Cancel</Button><Button type="submit" variant="contained" disabled={creating}>{creating?'Creating...':'Create Delivery Partner'}</Button></Box>
      </Box>
    </Box>}
  </>;
}
