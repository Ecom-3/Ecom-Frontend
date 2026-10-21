import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSearchBrowseState = (initialQuery = '') => {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? initialQuery;
  // Canonicalize inherited searches so Back can restore them after Home clears context.
  useEffect(() => {
    if (!params.has('q')) {
      setParams(current => {
        const next = new URLSearchParams(current);
        next.set('q', query);
        return next;
      }, { replace: true });
    }
  }, [params, query, setParams]);
  const update = (values) => setParams(current => {
    const next = new URLSearchParams(current);
    if (!next.has('q')) next.set('q', query);
    Object.entries(values).forEach(([key, value]) => next.set(key, value));
    return next;
  }, { replace: true });
  const allowed = (key, values, fallback) => values.includes(params.get(key)) ? params.get(key) : fallback;
  return {
    query,
    sort: allowed('sort', ['popularity', 'newest', 'price-low', 'price-high', 'pickup', 'offers', 'under30'], 'popularity'),
    category: params.get('category') || 'all',
    price: allowed('price', ['all', '150', '200', '300'], 'all'),
    rating: allowed('rating', ['all', '4', '5'], 'all'),
    availability: allowed('availability', ['all', 'pickup', 'under30'], 'all'),
    update,
  };
};
