import React from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { NoticeBoard } from '../../../components';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '24px 20px',
		height: '100%',
	},
}));

export default () => {
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<Grid container spacing={2}>
				<NoticeBoard boardTitle={'Public Notice Board'} perPage={6} />
			</Grid>
		</div>
	);
};
