export function adminLocationLookupOptions(locations = [], stores = []) {
  const names = new Map();
  const addName = (value) => {
      const name = String(value || '').trim();
      if (name && !names.has(name.toLocaleLowerCase())) names.set(name.toLocaleLowerCase(), name);
  };
  (Array.isArray(locations) ? locations : []).forEach((record) => addName(record?.name || record?.city || record?.location));
  (Array.isArray(stores) ? stores : []).forEach((store) => addName(store?.location));
  return [...names.values()].sort((left, right) => left.localeCompare(right));
}
