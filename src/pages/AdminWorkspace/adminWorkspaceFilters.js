export const applyStatusFilterChange = ({ value, role, setStatusFilter, setPage }) => {
  setStatusFilter(value);
  if (role === 'store-manager') setPage(1);
};
