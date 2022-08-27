import { Grid, Skeleton } from '@mui/material';
import React from 'react';

const AtivoNovoSkeleton = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
        </Grid>
    );
};

export default AtivoNovoSkeleton;
