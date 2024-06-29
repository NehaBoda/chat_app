import React from 'react'
import AppLayout from '../component/layout/AppLayout';
import { Box, Typography } from '@mui/material';
import { greyColor } from '../constants/Color';

const Home = () => {
  return (
    <Box bgcolor={greyColor} height={"100%"}>
      <Typography p={"2rem"} variant='h5' textAlign={"center"}>
       Select a Friend to chat 
       </Typography>
    </Box>
  );
   
};

export default AppLayout()(Home);

