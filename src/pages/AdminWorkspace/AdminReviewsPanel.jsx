import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Rating, Select, TextField, Typography } from '@mui/material';
import { getAdminReviews, moderateReview } from '../../services/reviewApi';

const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

export default function AdminReviewsPanel({ role }) {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [replies, setReplies] = useState({});
  const [busyId, setBusyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await getAdminReviews({ status, page, size: 20 });
      setData(result || { content: [], totalPages: 0, totalElements: 0 });
      setReplies(Object.fromEntries((result?.content || []).map((review) => [review.id, review.adminReply || ''])));
    } catch (requestError) { setError(requestError.message || 'Reviews could not be loaded.'); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const update = async (review, nextStatus) => {
    setBusyId(review.id); setError(''); setMessage('');
    try {
      await moderateReview(review.id, { status: nextStatus, adminReply: replies[review.id] || '' });
      setMessage(`Review ${nextStatus.toLowerCase()} and saved.`);
      await load();
    } catch (requestError) { setError(requestError.message || 'The review update could not be saved.'); }
    finally { setBusyId(''); }
  };

  return <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      <Select size="small" value={status} onChange={(event) => { setPage(0); setStatus(event.target.value); }} aria-label="Review moderation status">
        <MenuItem value="">All statuses</MenuItem>{statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </Select>
      <Typography color="text.secondary">{data.totalElements} reviews {role === 'global-admin' ? 'in global fulfillment' : ''}</Typography>
      <Button onClick={load}>Refresh</Button>
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      : !data.content?.length ? <Typography color="text.secondary">No reviews match this status.</Typography>
        : data.content.map((review) => <Box key={review.id} sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr auto' }, gap: 2, p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><Typography fontWeight={700}>{review.productName || 'Product'}</Typography><Chip size="small" label={review.status} color={review.status === 'APPROVED' ? 'success' : review.status === 'REJECTED' ? 'error' : 'warning'} /><Typography variant="caption">Order {review.orderNumber || review.orderId}</Typography></Box>
            <Rating value={Number(review.rating) || 0} readOnly size="small" />
            <Typography sx={{ whiteSpace: 'pre-wrap', my: 1 }}>{review.comment || 'No written comment.'}</Typography>
            {!!review.photoUrls?.length && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{review.photoUrls.map((url, index) => <Box key={`${review.id}:${index}`} component="img" src={url} alt={`Customer review ${index + 1}`} sx={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 1 }} />)}</Box>}
            <TextField fullWidth size="small" label="Reply to customer" value={replies[review.id] || ''} inputProps={{ maxLength: 1000 }} onChange={(event) => setReplies((current) => ({ ...current, [review.id]: event.target.value }))} sx={{ mt: 1.5 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button disabled={busyId === review.id} onClick={() => update(review, 'REJECTED')}>Reject</Button>
            <Button variant="contained" disabled={busyId === review.id} onClick={() => update(review, 'APPROVED')}>{busyId === review.id ? 'Saving…' : 'Approve & save reply'}</Button>
          </Box>
        </Box>)}
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}><Button disabled={page <= 0 || loading} onClick={() => setPage((current) => current - 1)}>Previous</Button><Typography>Page {data.totalPages ? page + 1 : 0} of {data.totalPages || 0}</Typography><Button disabled={page + 1 >= data.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next</Button></Box>
  </Box>;
}
