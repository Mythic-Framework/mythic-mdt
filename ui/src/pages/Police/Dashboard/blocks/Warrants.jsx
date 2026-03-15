import React from 'react';
import { useSelector } from 'react-redux';
import {
	Alert,
	Grid,
	List,
	ListItem,
	IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Item from './components/WarrantItem';

const useStyles = makeStyles((theme) => ({
	container: {
		padding: 10,
	},
	block: {
		padding: '0 0 10px 0',
		background: theme.palette.secondary.dark,
		border: `1px solid ${theme.palette.primary.main}25`,
		borderRadius: 4,
		overflow: 'hidden',
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 14px',
		borderBottom: `1px solid ${theme.palette.primary.main}25`,
		marginBottom: 4,
		background: `${theme.palette.primary.main}0a`,
		color: theme.palette.primary.main,
		fontSize: 12,
		fontWeight: 700,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
	},
	create: {
		color: theme.palette.primary.main,
		padding: 4,
		'&:hover': {
			background: `${theme.palette.primary.main}20`,
		},
	},
}));

export default () => {
	const classes = useStyles();
	const warrants = useSelector((state) => state.data.data.warrants);

	return (
		<Grid item xs={6} className={classes.container}>
			<div className={classes.block}>
				<div className={classes.header}>
					<span>Active Warrants</span>
					<IconButton component={Link} to="/warrants" className={classes.create} size="small">
						<FontAwesomeIcon icon={['fas', 'eye']} />
					</IconButton>
				</div>
				<List>
					{warrants.filter(w => w.state == 'active').length > 0 ? (
						warrants
							.filter(w => w.state == 'active')
							.sort((a, b) => a.expires - b.expires)
							.map((warrant, k) => {
								return (
									<Item
										key={`warrant-${k}`}
										warrant={warrant}
									/>
								);
							})
					) : (
						<ListItem>
							<Alert variant="outlined" severity="info">
								No Active Warrants
							</Alert>
						</ListItem>
					)}
				</List>
			</div>
		</Grid>
	);
};
