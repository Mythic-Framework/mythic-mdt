import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Avatar, List, ListItem, ListItemText, ListItemAvatar, Menu, MenuItem, Alert } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Nui from '../../util/Nui';
import { usePermissions, useQualifications } from '../../hooks';

import Unit from './components/Unit';

const useStyles = makeStyles((theme) => ({
	container: {
		height: '40%',
		width: '100%',
		overflowY: 'hidden',
		overflowX: 'auto',
		background: theme.palette.secondary.dark,
		borderTop: `1px solid ${theme.palette.primary.main}25`,
	},
	wrapper: {
		height: '100%',
		'& h3': {
			padding: '8px 14px',
			margin: 0,
			fontSize: 12,
			fontWeight: 700,
			letterSpacing: '0.1em',
			textTransform: 'uppercase',
			color: theme.palette.primary.main,
			borderBottom: `1px solid ${theme.palette.primary.main}20`,
			'& small': {
				fontSize: 11,
				letterSpacing: '0.04em',
				textTransform: 'none',
				color: 'rgba(255,255,255,0.4)',
				fontWeight: 400,
			},
		},
	},
	list: {
		maxHeight: '85%',
		overflow: 'auto',
		'&::-webkit-scrollbar': { width: 4 },
		'&::-webkit-scrollbar-track': { background: 'transparent' },
		'&::-webkit-scrollbar-thumb': { background: `${theme.palette.primary.main}40`, borderRadius: 2 },
	},
	alert: {
		width: 'fit-content',
		margin: 'auto',
	},
}));

export default () => {
	const classes = useStyles();
	const user = useSelector((state) => state.app.user);
	const job = useSelector((state) => state.app.govJob);
	const onDuty = useSelector((state) => state.alerts.onDuty);
	const emergencyMembers = useSelector((state) => state.alerts.emergencyMembers);

	if (!user || (job.Id != 'police' && job.Id != 'ems' && job.Id != 'tow')) return null;

	const policeOnDuty = onDuty.filter((m) => Boolean(m.primary) && m.job === 'police');
	const emsOnDuty = onDuty.filter((m) => Boolean(m.primary) && m.job === 'ems');
	const towOnDuty = emergencyMembers.filter((m) => m.Job === 'tow');

	const pdcount = emergencyMembers.filter((m) => Boolean(m.Callsign) && m.Job == 'police').length;
	const emscount = emergencyMembers.filter((m) => Boolean(m.Callsign) && m.Job == 'ems').length;
	const towcount = emergencyMembers.filter((m) => m.Job == 'tow').length;

	return (
		<Grid className={classes.container} container>
			{job.Id != 'tow' && (
				<Grid item xs={4} className={classes.wrapper}>
					<h3>
						Police
						{policeOnDuty.length > 0 && (
							<small>
								{' - On Duty: '}
								<b>{pdcount}</b>
							</small>
						)}
					</h3>
					{policeOnDuty.length > 0 ? (
						<List className={classes.list}>
							{policeOnDuty.length > 0 &&
								policeOnDuty
									.sort((a, b) => a.primary - b.primary)
									.map((unit, k) => {
										return <Unit key={`unit-${k}`} unitData={unit} unitType="police" />;
									})}
						</List>
					) : (
						<List className={classes.list}>
							<Alert className={classes.alert} variant="outlined" severity="info">
								No Police On Duty
							</Alert>
						</List>
					)}
				</Grid>
			)}
			{job.Id != 'tow' && (
				<Grid item xs={4} className={classes.wrapper}>
					<h3>
						EMS
						{emsOnDuty.length > 0 && (
							<small>
								{' - On Duty: '}
								<b>{emscount}</b>
							</small>
						)}
					</h3>
					{emsOnDuty.length > 0 ? (
						<List className={classes.list}>
							{emsOnDuty.length > 0 &&
								emsOnDuty
									.sort((a, b) => a.primary - b.primary)
									.map((unit, k) => {
										return <Unit key={`unit-${k}`} unitData={unit} unitType="ems" />;
									})}
						</List>
					) : (
						<List className={classes.list}>
							<Alert className={classes.alert} variant="outlined" severity="info">
								No EMS On Duty
							</Alert>
						</List>
					)}
				</Grid>
			)}
			<Grid item xs={job.Id != 'tow' ? 4 : 12} className={classes.wrapper}>
				<h3>
					Tow
					{towOnDuty.length > 0 && (
						<small>
							{' - On Duty: '}
							<b>{towcount}</b>
						</small>
					)}
				</h3>
				{towOnDuty.length > 0 ? (
					<List className={classes.list}>
						{towOnDuty.map((unit, k) => {
							return <Unit key={`unit-${k}`} unitData={unit} unitType="tow" />;
						})}
					</List>
				) : (
					<List className={classes.list}>
						<Alert className={classes.alert} variant="outlined" severity="info">
							No Tow On Duty
						</Alert>
					</List>
				)}
			</Grid>
		</Grid>
	);
};
