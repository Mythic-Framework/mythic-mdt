import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		textAlign: 'right',
	},
	workplace: {
		display: 'block',
		fontSize: 10,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: 'rgba(255,255,255,0.4)',
		marginBottom: 2,
	},
	name: {
		display: 'block',
		fontSize: 13,
		fontWeight: 600,
		color: '#fff',
	},
	callsign: {
	 color: '#fff',
	 fontWeight: 600,
	},
}));

export default () => {
	const classes = useStyles();
	const cData = useSelector((state) => state.app.user);
	const job = useSelector(state => state.app.govJob);

	if (!cData || !job) {
		return null;
	}

	switch (job?.Id) {
		case 'police':
			return (
				<div className={classes.wrapper}>
					<small className={classes.workplace}>{job.Workplace?.Name}</small>
					<span className={classes.name}>
						{Boolean(cData?.Callsign) && (
							<span className={classes.callsign}>{cData.Callsign} </span>
						)}
						{job.Grade?.Name} {cData.First} {cData.Last}
					</span>
				</div>
			);
		case 'government':
			return (
				<div className={classes.wrapper}>
					<small className={classes.workplace}>{job.Workplace?.Name}</small>
					<span className={classes.name}>{job.Grade?.Name} {cData.First} {cData.Last}</span>
				</div>
			);
		case 'ems':
			return (
				<div className={classes.wrapper}>
					<small className={classes.workplace}>{job.Workplace?.Name}</small>
					<span className={classes.name}>
						{Boolean(cData?.Callsign) && (
							<span className={classes.callsign}>{cData.Callsign} </span>
						)}
						{job.Grade?.Name} {cData.First} {cData.Last}
					</span>
				</div>
			);
		default:
			return null;
	}
};
