import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/system';

const Datasets = () => {
    return (
        <Box sx={{ height: '100%' }} component={motion.div} initial={{ y: '-100vh' }} animate={{ y: 0, transition: { duration: 0.25 } }} exit={{ transition: { duration: 0.1 } }}>
            <div>Daytrade/Datasets</div>
        </Box>
    );
};

export default Datasets;
