import React from 'react';
import { useSelector } from 'react-redux';
import {
	ListItem,
	ListItemText,
	Grid,
	Avatar,
	ListItemAvatar,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { useNavigate } from 'react-router';

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
	stateBadge: {
		display: 'inline-block',
		fontSize: 10,
		fontWeight: 700,
		letterSpacing: '0.06em',
		textTransform: 'uppercase',
		padding: '2px 7px',
		borderRadius: 3,
	},
}));

const warrantStates = {
	active: 'Active',
	void: 'Void',
	served: 'Served',
	expired: 'Expired',
}

export default ({ warrant }) => {
	const classes = useStyles();
	const history = useNavigate();
	const job = useSelector(state => state.app.govJob);

	const onClick = () => {
		if (job) {
			history(`/warrants/${warrant._id}`);
		}
	};
	
	const stateColors = { active: '#e05252', void: 'rgba(255,255,255,0.3)', served: '#00c9b1', expired: 'rgba(255,255,255,0.3)' };
	const stateColor = stateColors[warrant?.state] ?? 'rgba(255,255,255,0.3)';

	const Cell = ({ label, value, xs }) => (
		<Grid item xs={xs}>
			<div className={classes.label}>{label}</div>
			<div className={classes.value}>{value}</div>
		</Grid>
	);

	return (
		<ListItem className={classes.wrapper} button onClick={onClick}>
			<Grid container alignItems="center" spacing={1}>
				<Grid item xs={2}>
					<div className={classes.label}>State</div>
					<span className={classes.stateBadge} style={{ background: `${stateColor}20`, color: stateColor, border: `1px solid ${stateColor}60` }}>
						{warrantStates[warrant?.state] ?? 'Unknown'}
					</span>
				</Grid>
				<Cell xs={2} label="Subject" value={`${warrant.suspect.First} ${warrant.suspect.Last}`} />
				<Cell xs={2} label="Issuing Officer" value={`${warrant.author.First} ${warrant.author.Last}`} />
				<Cell xs={3} label="Created" value={moment(warrant.time).format('LLL')} />
				<Cell xs={3} label="Expires" value={moment(warrant.expires).format('LLL')} />
			</Grid>
		</ListItem>
	);
};
