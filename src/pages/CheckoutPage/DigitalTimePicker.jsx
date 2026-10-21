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

  const renderColumn = (field, title) => <Box className="digital-clock-column" role="group" aria-label={title}>
    <Typography component="span" className="digital-clock-column-title">{title}</Typography>
    <Box className={`digital-clock-scroll digital-clock-scroll-${field}`} role="listbox" aria-label={title} tabIndex={0} onKeyDown={(event) => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !options[field].length) return;
      event.preventDefault();
      const currentIndex = Math.max(0, options[field].indexOf(parts?.[field]));
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = options[field][(currentIndex + delta + options[field].length) % options[field].length];
      onChange(nearestOption(slots, field, next, selected)?.value || '');
    }} onWheel={(event) => {
      if (!options[field].length) return;
      event.preventDefault();
      const currentIndex = Math.max(0, options[field].indexOf(parts?.[field]));
      const delta = event.deltaY > 0 ? 1 : -1;
      const next = options[field][(currentIndex + delta + options[field].length) % options[field].length];
      onChange(nearestOption(slots, field, next, selected)?.value || '');
    }}>
      {options[field].map((option) => <button type="button" role="option" aria-selected={parts?.[field] === option} key={option} className={`digital-clock-flap ${parts?.[field] === option ? 'selected' : ''}`} onClick={() => onChange(nearestOption(slots, field, option, selected)?.value || '')}><span>{option}</span></button>)}
    </Box>
  </Box>;

  if (!slots.length) return <Typography className="digital-clock-empty">No valid times are available for this date.</Typography>;
  return <Box className="digital-clock-picker">
    <Typography className="digital-clock-preview-label">{label}</Typography>
    <Typography className="digital-clock-preview" aria-live="polite">{selected?.label || 'Choose a time'}</Typography>
    <Box className="digital-clock-columns">{renderColumn('hour', 'Hour')}<span className="digital-clock-colon">:</span>{renderColumn('minute', 'Minute')}{renderColumn('period', 'AM/PM')}</Box>
    <Typography className="digital-clock-help">Choose any hour from 1 to 12 and a quarter-hour time. This is a requested time and may need store confirmation.</Typography>
  </Box>;
};

export default DigitalTimePicker;
