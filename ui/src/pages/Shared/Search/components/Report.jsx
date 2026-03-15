import React from 'react';
import { ListItem, ListItemText, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router';
import { ReportTypes, GetOfficerNameFromReportType, GetOfficerJobFromReportType } from '../../../../data';
import { TitleCase } from '../../../../util/Parser';
import { usePerson } from '../../../../hooks';

import Moment from 'react-moment';

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
	subValue: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
}));

export default ({ report }) => {
	const classes = useStyles();
	const history = useNavigate();
	const formatPerson = usePerson();

	const onClick = () => {
		history(`/search/reports/${report._id}`);
	};

	const reportTypeName = ReportTypes.find(r => r.value == report.type)?.label ?? 'Incident Report';
	const reporterName = GetOfficerNameFromReportType(report.type);

	const Cell = ({ label, value, sub, xs }) => (
	<Grid item xs={xs}>
	<div className={classes.label}>{label}</div>
	<div className={classes.value}>{value}</div>
	{sub && <div className={classes.subValue}>{sub}</div>}
	</Grid>
	);

	const suspectsLabel = report.type === 0 ? 'Suspects' : 'People Involved';
	const suspectsValue = report.suspects.length == 1
	? `${report.suspects[0].suspect?.[0]?.First} ${report.suspects[0].suspect?.[0]?.Last}`
	: `${report.suspects.length} ${suspectsLabel}`;
	const officersValue = `${report.primaries.slice(0, 2).map(o => formatPerson(o.First, o.Last, o.Callsign, o.SID, false, true)).join(', ')}${report.primaries.length - 2 > 0 ? ` +${report.primaries.length - 2}` : ''}`;

	return (
	<ListItem className={classes.wrapper} button onClick={onClick}>
	<Grid container alignItems="center" spacing={1}>
	<Cell xs={3} label={`Case #${report.ID ?? 0}`} value={report.title} />
	<Cell xs={2} label="Type" value={reportTypeName} />
	<Cell xs={2} label={suspectsLabel} value={suspectsValue} />
	<Cell xs={4} label={report.type === 0 ? `Primary ${reporterName}` : `${reporterName} Involved`} value={officersValue} />
	<Cell xs={1} label="Created" value={<Moment date={report.time} fromNow />} />
	</Grid>
	</ListItem>
	);
};
