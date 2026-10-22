import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
  getNotificationsByOrder,
  isNotificationServiceUnavailable,
  normalizeNotification,
  sendNotification,
} from '../../services/notificationApi';
import './NotificationHistoryPanel.css';

const statusColor = {
  PENDING: 'warning',
  SENT: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

const formatDate = (value, formatDateTime) => {
  if (!value) return 'Not sent yet';
  if (formatDateTime) return formatDateTime(value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const NotificationHistoryPanel = ({ orderId, order, formatDateTime }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState('');
  const [error, setError] = useState('');

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [notifications]
  );
  const orderItemNames = (order?.items || []).map((item) => String(item.title || item.productName || '').trim().toLowerCase()).filter(Boolean);
  const visibleNotification = (notification) => {
    const text = `${notification.subject} ${notification.message}`.toLowerCase();
    const mentionsOtherProduct = orderItemNames.length > 0 && /\b(pickle|mango|lemon|raisin|almond|cashew|pistachio|chicken|fish|vegetable)s?\b/.test(text)
      && !orderItemNames.some((name) => text.includes(name));
    return mentionsOtherProduct ? { ...notification, subject: 'Order update', message: 'Updates for this order will appear here.' } : notification;
  };

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const response = await getNotificationsByOrder(orderId, 0, 20);
      const backend = (response?.content || []).map(normalizeNotification);
      setNotifications(backend);
    } catch (apiError) {
      setNotifications([]);
      setError(isNotificationServiceUnavailable(apiError) ? 'Notification Service is unavailable.' : apiError.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleSend = async (notificationId) => {
    setSendingId(notificationId);
    setError('');
    try {
      const updated = normalizeNotification(await sendNotification(notificationId));
      setNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSendingId('');
    }
  };

  return (
    <Box className="notification-history-card">
      <Box className="notification-history-header">
        <Box className="notification-history-title">
          <NotificationsNoneOutlinedIcon />
          <Typography>Notifications</Typography>
        </Box>
        <Button size="small" startIcon={<RefreshIcon />} disabled={loading || !orderId} onClick={load}>Refresh</Button>
      </Box>

      {loading && <Box className="notification-loading"><CircularProgress size={18} /><Typography>Loading notifications...</Typography></Box>}
      {error && <Typography className="notification-error" role="alert">{error}</Typography>}
      {!loading && !error && !sortedNotifications.length && <Typography className="notification-empty">No notifications found for this order.</Typography>}

      <Box className="notification-list">
        {sortedNotifications.map((savedNotification) => {
          const notification = visibleNotification(savedNotification);
          return (
          <Box className="notification-row" key={notification.id}>
            <Box className="notification-row-main">
              <Box className="notification-row-top">
                <Typography className="notification-subject">{notification.subject}</Typography>
                <Chip size="small" color={statusColor[notification.status] || 'default'} label={notification.status} />
              </Box>
              <Typography className="notification-message">{notification.message}</Typography>
              <Typography className="notification-meta">{notification.channel} {notification.recipient ? `to ${notification.recipient}` : 'to customer'} - {formatDate(notification.sentAt || notification.createdAt, formatDateTime)}</Typography>
            </Box>
            {notification.status === 'PENDING' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={sendingId === notification.id ? <CircularProgress size={14} /> : <SendOutlinedIcon />}
                disabled={Boolean(sendingId)}
                onClick={() => handleSend(notification.id)}
              >
                Send
              </Button>
            )}
          </Box>
        );})}
      </Box>
    </Box>
  );
};

export default NotificationHistoryPanel;
