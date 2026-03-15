import React from 'react';
import { ListItem, ListItemText, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';

import { VehicleTypes } from '../../../../data';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '10px 14px',
		borderBottom: `1px solid rgba(255,255,255,0.05)`,
		borderLeft: '3px solid transparent',
		transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
		'&:first-of-type': { borderTop: `1px solid rgba(255,255,255,0.05)` },
		'&:hover': {
			background: `${theme.palette.primary.main}0d`,
			borderLeftColor: `${theme.palette.primary.main}80`,
		},
	},
	label: {
		fontSize: 10,
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: 'rgba(255,255,255,0.35)',
		marginBottom: 2,
	},
	value: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
}));

export default ({ vehicle }) => {
	const classes = useStyles();
	const history = useNavigate();

	const onClick = () => {
		history(`/search/vehicles/${vehicle.VIN}`);
	};

	const Cell = ({ label, value, xs }) => (
		<Grid item xs={xs}>
			<div className={classes.label}>{label}</div>
			<div className={classes.value}>{value}</div>
		</Grid>
	);

	return (
		<ListItem className={classes.wrapper} button onClick={onClick}>
			<Grid container alignItems="center" spacing={1}>
				<Cell xs={2} label="VIN" value={vehicle.VIN} />
				<Cell xs={1} label="Plate" value={vehicle.RegisteredPlate} />
				<Cell xs={3} label="Make / Model" value={`${vehicle.Make} ${vehicle.Model}`} />
				<Cell xs={2} label="Registered Owner" value={vehicle.Owner?.Type === 0 ? `State ID: ${vehicle.Owner?.Id}` : 'Organization/Business'} />
				<Cell xs={1} label="Type" value={VehicleTypes[vehicle.Type] ?? 'Vehicle'} />
				<Cell xs={2} label="Registration Date" value={vehicle.RegistrationDate ? <Moment date={vehicle.RegistrationDate} unix format="LL" /> : 'Unknown'} />
				<Cell xs={1} label="Impounded" value={vehicle.Storage?.Type === 0 ? 'Yes' : 'No'} />
			</Grid>
		</ListItem>
	);
};
