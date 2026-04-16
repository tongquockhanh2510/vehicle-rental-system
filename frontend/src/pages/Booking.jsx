import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Booking({ vehicleId }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (vehicleId) {
      navigate(`/vehicles/${vehicleId}`, { replace: true });
    } else {
      navigate('/vehicles', { replace: true });
    }
  }, [vehicleId, navigate]);

  return null;
}
