import { useNavigate } from 'react-router-dom';

// Mark an explicit Home action separately from category/search navigation.
export const useHomeNavigation = () => {
  const navigate = useNavigate();
  return () => navigate('/home', { state: { resetHome: true } });
};
