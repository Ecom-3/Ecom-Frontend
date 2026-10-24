import { Alert, Box, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

export default function DemoDeliveryTracking({ address }) {
  return <Box sx={{ py: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <LocalShippingOutlinedIcon color="success" />
      <Typography fontWeight={700}>Delivery tracking</Typography>
    </Box>
    <Alert severity="info">Tracking updates will appear here when the fulfillment service records them.</Alert>
    {address && <Typography sx={{ mt: 2, overflowWrap: 'anywhere' }}>Deliver to: {address}</Typography>}
  </Box>;
}
