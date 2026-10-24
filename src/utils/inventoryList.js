export const matchesInventoryStatus = (record, selectedStatus) => selectedStatus === 'All'
  || String(record?.status || '').toUpperCase() === String(selectedStatus || '').toUpperCase();

export const filterInventoryRecords = (records, { query = '', status = 'All', sort = 'newest' } = {}) => {
  const normalizedQuery = String(query).toLowerCase();
  return records
    .filter((record) => JSON.stringify(record).toLowerCase().includes(normalizedQuery))
    .filter((record) => matchesInventoryStatus(record, status))
    .sort((left, right) => sort === 'name'
      ? String(left.name || left.id).localeCompare(String(right.name || right.id))
      : sort === 'oldest'
        ? String(left.createdAt).localeCompare(String(right.createdAt))
        : String(right.createdAt).localeCompare(String(left.createdAt)));
};

export const paginateInventoryRecords = (records, page, pageSize) => records.slice((page - 1) * pageSize, page * pageSize);
