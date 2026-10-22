import { Box, Typography } from '@mui/material';
import './DigitalTimePicker.css';

const clockParts = (slot) => {
  const minutes = Number(slot.value.slice(0, 2)) * 60 + Number(slot.value.slice(3, 5));
  const hour24 = Math.floor(minutes / 60);
  return { hour: String(hour24 % 12 || 12), minute: String(minutes % 60).padStart(2, '0'), period: hour24 < 12 ? 'AM' : 'PM' };
};

const nearestOption = (slots, field, value, current) => {
  const selected = current ? clockParts(current) : null;
  const candidates = slots.filter((slot) => {
    const parts = clockParts(slot);
    return parts[field] === value && (!selected || ['hour', 'minute', 'period'].every((key) => key === field || parts[key] === selected[key]));
  });
  if (candidates.length) return candidates[0];
  return slots.find((slot) => clockParts(slot)[field] === value) || slots[0];
};

const DigitalTimePicker = ({ slots = [], value = '', onChange, label = 'Available time' }) => {
  const selected = slots.find((slot) => slot.value === value) || null;
  const parts = selected ? clockParts(selected) : null;
  const options = {
    hour: Array.from({ length: 12 }, (_, index) => String(index + 1)),
    minute: ['00', '15', '30', '45'],
    period: ['AM', 'PM'],
  };
  const choose = (field, option) => onChange(nearestOption(slots, field, option, selected)?.value || '');

  const renderDial = (field, title, radius = 0) => <Box className={`round-clock-options round-clock-${field}`} role="group" aria-label={title}>
    {options[field].map((option, index) => {
      const angle = (index / options[field].length) * Math.PI * 2 - Math.PI / 2;
      const style = radius ? { left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%` } : undefined;
      const active = parts?.[field] === option;
      return <button type="button" key={option} style={style} className={`round-clock-option ${active ? 'selected' : ''}`} aria-pressed={active} onClick={() => choose(field, option)}>{option}</button>;
    })}
  </Box>;

  if (!slots.length) return <Typography className="digital-clock-empty">No valid times are available for this date.</Typography>;
  return <Box className="digital-clock-picker">
    <Typography className="digital-clock-preview-label">{label}</Typography>
    <Box className="round-clock" role="group" aria-label="Choose a delivery time">
      {renderDial('hour', 'Hour', 39)}
      <Box className="round-clock-center">
        <span className="round-clock-time" aria-live="polite">{selected?.label || 'Choose time'}</span>
        {renderDial('minute', 'Minute')}
        {renderDial('period', 'AM or PM')}
      </Box>
    </Box>
    <Typography className="digital-clock-help">Select an hour, quarter-hour, and AM/PM. This is a requested time and may need store confirmation.</Typography>
  </Box>;
};

export default DigitalTimePicker;
