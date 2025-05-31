import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useSwipeable } from 'react-swipeable';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: (event) => {
      const target = event.event.target as HTMLElement;
      if (target?.closest('.MuiDateCalendar-root')) {
        return;
      }
      setActiveTab((prev) => (prev < 2 ? prev + 1 : prev));
    },
    onSwipedRight: (event) => {
      const target = event.event.target as HTMLElement;
      if (target?.closest('.MuiDateCalendar-root')) {
        return;
      }
      setActiveTab((prev) => (prev > 0 ? prev - 1 : prev));
    },
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
    preventScrollOnSwipe: true,
    trackTouch: true
  });

  return (
    <Box 
      {...handlers}
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      // ... rest of the existing code ...
    </Box>
  );
};

export default Dashboard; 