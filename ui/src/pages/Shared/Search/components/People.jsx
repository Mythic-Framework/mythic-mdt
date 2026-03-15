import React from 'react';
import {
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Grid,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '10px 14px',
		borderBottom: `1px solid rgba(255,255,255,0.05)`,
		borderLeft: '3px solid transparent',
		transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
		'&:first-of-type': {
			borderTop: `1px solid rgba(255,255,255,0.05)`,
		},
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
	value: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.85)',
		fontWeight: 500,
	},
	mugshot: {
		height: 44,
		width: 44,
		border: `1px solid ${theme.palette.primary.main}40`,
	}
}));

export default ({ person }) => {
	const classes = useStyles();
	const history = useNavigate();
	const govJobs = useSelector(state => state.data.data.governmentJobs);

	const onClick = () => {
		history(`/search/people/${person.SID}`);
	};

	const jobCount = person.Jobs?.length ?? 0
	let isGovernment = false;

	if (jobCount > 0 && govJobs?.length > 0) {
		isGovernment = person.Jobs?.find(j => govJobs.includes(j.Id));
	}

	const Cell = ({ label, value, xs }) => (
		<Grid item xs={xs}>
			<div className={classes.label}>{label}</div>
			<div className={classes.value}>{value}</div>
		</Grid>
	);

	return (
		<ListItem className={classes.wrapper} button onClick={onClick}>
			<Grid container alignItems="center" spacing={1}>
				<Grid item xs={1}>
					<Avatar className={classes.mugshot} src={person.Mugshot} alt={person.First} />
				</Grid>
				<Cell xs={2} label="Name" value={`${person.First} ${person.Last}`} />
				<Cell xs={1} label="State ID" value={person.SID} />
				<Cell xs={1} label="Sex" value={person.Gender ? 'Female' : 'Male'} />
				<Cell xs={3} label="Date of Birth" value={moment(person.DOB * 1000).format('LL')} />
				{isGovernment && <Cell xs={4} label="Government Employee" value={`${isGovernment?.Workplace?.Name ?? isGovernment.Name} - ${isGovernment.Grade?.Name}`} />}
			</Grid>
		</ListItem>
	);
};
