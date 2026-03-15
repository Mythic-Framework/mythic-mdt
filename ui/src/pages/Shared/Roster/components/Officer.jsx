import React from 'react';
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Grid,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { usePerson } from '../../../../hooks';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '10px 14px',
		borderBottom: `1px solid rgba(255,255,255,0.05)`,
		borderLeft: '3px solid transparent',
		transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
		'&:first-of-type': { borderTop: `1px solid rgba(255,255,255,0.05)` },
		'&:hover': {
			background: `${theme.palette.primary.main}0d`,
			borderLeftColor: `${theme.palette.primary.main}60`,
		},
		'&.active': {
			background: `${theme.palette.primary.main}15`,
			borderLeftColor: theme.palette.primary.main,
		},
	},
	picture: {
		height: 44,
		width: 44,
		border: `1px solid ${theme.palette.primary.main}40`,
	},
	name: {
		fontSize: 13,
		fontWeight: 600,
		color: 'rgba(255,255,255,0.9)',
	},
	sub: {
		fontSize: 11,
		color: 'rgba(255,255,255,0.4)',
		marginTop: 2,
	},
}));

export default ({ selected, officer, onSelect }) => {
	const classes = useStyles();
	const formatPerson = usePerson();
	const myJob = useSelector(state => state.app.govJob);
	const govJobData = officer.Jobs?.find(j => j.Id == myJob.Id);

	if (!govJobData) return null;

	return (
		<ListItem
			className={`${classes.wrapper}${selected ? ' active' : ''}`}
			button
			onClick={() => onSelect(selected ? null : officer)}
		>
			<Grid container alignItems="center" spacing={1}>
				<Grid item xs={2}>
					<Avatar className={classes.picture} src={officer?.Mugshot} alt={officer.First} />
				</Grid>
				<Grid item xs={10}>
					<div className={classes.name}>{formatPerson(officer.First, officer.Last, officer.Callsign, officer.SID)}</div>
					<div className={classes.sub}>{govJobData?.Workplace?.Name} — {govJobData?.Grade?.Name}</div>
				</Grid>
			</Grid>
		</ListItem>
	);
};
