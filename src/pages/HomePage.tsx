import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the root folder page
    navigate('/folder/root');
  }, [navigate]);

  return null; // This component will redirect, so no need to render anything
};

export default HomePage;
