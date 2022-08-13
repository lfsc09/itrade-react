import { Grid, Skeleton } from '@mui/material';
import React from 'react';

const DatasetNovoSkeleton = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={6}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={6}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={400} />
            </Grid>
            <Grid item xs={12}>
                <Skeleton variant='rectangular' height={50} />
            </Grid>
        </Grid>
    );
};

export default DatasetNovoSkeleton;
