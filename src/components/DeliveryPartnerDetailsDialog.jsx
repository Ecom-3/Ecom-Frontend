import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import { deliveryPartnerLocation } from '../services/deliveryPartnerLocation.js';

const Detail = ({ label, value }) => <Box>
  <Typography variant="caption" color="text.secondary">{label}</Typography>
  <Typography sx={{ overflowWrap: 'anywhere' }}>{value || 'Not recorded'}</Typography>
</Box>;

const displayDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
const displayRegion = (value) => String(value || '').trim().replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function DeliveryPartnerDetailsDialog({ partner, onClose }) {
  const location = deliveryPartnerLocation(partner);
  return <Dialog open={Boolean(partner)} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="delivery-partner-details-title">
    {partner && <>
      <DialogTitle id="delivery-partner-details-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <span>{partner.name || 'Delivery Partner'}</span>
        <Chip size="small" color={partner.status === 'Active' ? 'success' : 'default'} label={partner.status || 'Status unknown'} />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, py: 1 }}>
          <Detail label="Login username" value={partner.username} />
          <Detail label="Email" value={partner.email} />
          <Detail label="Mobile number" value={partner.mobile || partner.phone} />
          <Detail label="Emergency contact" value={partner.emergencyContact} />
          <Detail label="Vehicle type" value={partner.vehicleType} />
          <Detail label="Vehicle number" value={partner.vehicleNumber} />
          <Detail label="Driving licence number" value={partner.licenceNumber} />
          <Detail label="Assigned store" value={partner.store} />
          <Detail label="Service region" value={displayRegion(partner.location)} />
          <Detail label="Store location" value={displayRegion(partner.storeLocation)} />
          <Detail label="Partner address" value={partner.address} />
          <Detail label="Store address" value={partner.storeAddress} />
          <Detail label="Account created" value={displayDate(partner.accountCreatedAt)} />
          <Detail label="Account updated" value={displayDate(partner.accountUpdatedAt)} />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700}>Last shared location</Typography>
          {location ? <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · Updated {displayDate(location.updatedAt)}
            </Typography>
            <Link href={location.mapUrl} target="_blank" rel="noopener noreferrer">Open location in OpenStreetMap</Link>
            <Box sx={{ mt: 1, height: 300, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <iframe title={`${partner.name || 'Delivery partner'} last shared location`} src={location.embedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </Box>
          </> : <Typography color="text.secondary" sx={{ mt: 1 }}>No valid GPS location has been shared by this partner yet.</Typography>}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </>}
  </Dialog>;
}
