import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	Avatar,
	ListItem,
	ListItemText,
	Grid,
	List,
	TextField,
	Button,
	MenuItem,
	ButtonGroup,
	Select,
	Chip,
	FormControl,
	InputLabel,
	Box,
	OutlinedInput,
	DialogContent,
	DialogContentText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
//import _ from 'lodash';
import { toast } from 'react-toastify';
import moment from 'moment';
import { usePermissions } from '../../../../hooks';
import { Modal } from '../../../../components';
import Nui from '../../../../util/Nui';

const parseDutyTime = (dutyTime, job) => {
	if (dutyTime && dutyTime[job]) {
		const afterTime = moment().subtract(7, 'days').unix();
		let timeWorked = 0;
		dutyTime[job].forEach(t => {
			if (t.time >= afterTime) {
				timeWorked += t.minutes;
			}
		});

		if (timeWorked > 0) {
			return moment.duration(timeWorked, "minutes").humanize();
		} else {
			return '0 minutes';
		}
	
	} else {
		return '0 minutes';
	}
}

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: 16,
		height: '100%',
		background: theme.palette.secondary.main,
		borderLeft: `1px solid ${theme.palette.primary.main}20`,
	},
	inner: {
		padding: 12,
		background: theme.palette.secondary.dark,
		height: '100%',
		border: `1px solid ${theme.palette.primary.main}20`,
		borderRadius: 4,
	},
	avatar: {
		height: 200,
		width: 200,
		margin: 'auto',
		border: `2px solid ${theme.palette.primary.main}40`,
		transition: 'filter ease-in 0.15s, border-color ease-in 0.15s',
		'&.hoverable:hover': {
			filter: 'brightness(0.7)',
			borderColor: theme.palette.primary.main,
			cursor: 'pointer',
		},
	},
	listItem: {
		padding: '6px 8px',
		borderBottom: `1px solid rgba(255,255,255,0.04)`,
	},
	listLabel: {
		fontSize: 10,
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: theme.palette.primary.main,
		marginBottom: 2,
	},
	listValue: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.85)',
		fontWeight: 500,
	},
	field: {
		marginTop: 16,
	},
	hoverable: {
		transition: 'opacity ease-in 0.15s',
		cursor: 'pointer',
		'&:hover': { opacity: 0.65 },
	},
	editorField: {
		marginBottom: 10,
	},
}));

export default ({ selectedJob, officer, onUpdate }) => {
	const classes = useStyles();
	const hasPerm = usePermissions();
	const user = useSelector((state) => state.app.user);
	const myJob = useSelector(state => state.app.govJob);
	const jobData = useSelector(state => state.data.data.governmentJobsData)?.[myJob.Id];
	const availablePermissions = useSelector(state => state.data.data.permissions);
	const availableQualifications = useSelector(state => state.data.data.qualifications);

	const officerGovJobData = officer.Jobs?.find(j => j.Id == myJob.Id);
	if (!officerGovJobData) return null;

	const isHighCommand = hasPerm('PD_HIGH_COMMAND') || hasPerm('SAFD_HIGH_COMMAND') || hasPerm('DOJ_JUDGE');
	const canFire = hasPerm('MDT_FIRE') || isHighCommand;
	const canPromote = hasPerm('MDT_PROMOTE') || isHighCommand;
	const canEdit = hasPerm('MDT_EDIT_EMPLOYEE') || isHighCommand;

	const [picture, setPicture] = useState(false);
	const [callsign, setCallsign] = useState(false);
	const [qualEdit, setQualEdit] = useState(false);
	const [jobEdit, setJobEdit] = useState(false);
	const [jobFire, setJobFire] = useState(false);
	const [pendingQuals, setPendingQual] = useState(Array());
	const [pJob, setPJob] = useState(officerGovJobData);

	const [pending, setPending] = useState({
		picture: officer.Mugshot ?? '',
		callsign: Boolean(officer.Callsign) ? officer.Callsign : '',
	});

	useEffect(() => {
		setPicture(false);
		setCallsign(false);
		setPJob(officer.Jobs?.find(j => j.Id == myJob.Id));
		setPendingQual(officer.Qualifications ?? Array());
		setPending({
			picture: officer.Mugshot ?? '',
			callsign: Boolean(officer.Callsign) ? officer.Callsign : '',
		});
	}, [officer]);

	const onSavePicture = async (e) => {
		e.preventDefault();
		if (!canEdit) return;

		try {
			let res = await (
				await Nui.send('Update', {
					type: 'person',
					SID: officer.SID,
					Key: 'Mugshot',
					Data: pending.picture,
				})
			).json();
			if (res) {
				toast.success('Profile Picture Updated');
				onUpdate();
				setPicture(false);
			} else toast.error('Unable to Update Profile Picture');
		} catch (err) {
			console.log(err);
			toast.error('Unable to Update Profile Picture');
		}
	};

	const onSaveCallsign = async (e) => {
		e.preventDefault();
		if (!canEdit) return;
		if (officer.Callsign == pending.callsign) {
			toast.success('Callsign Updated');
			setCallsign(false);
			return;
		}

		try {
			let res = await (
				await Nui.send('CheckCallsign', parseInt(pending.callsign))
			).json();

			if (res) {
				let res2 = await (
					await Nui.send('Update', {
						type: 'person',
						SID: officer.SID,
						Key: 'Callsign',
						Data: parseInt(pending.callsign),
					})
				).json();
				if (res2) {
					toast.success('Callsign Updated');
					onUpdate();
					setCallsign(false);
				} else toast.error('Unable to Update Callsign');
			} else toast.error('Callsign Already Assigned');
		} catch (err) {
			console.log(err);
			toast.error('Unable to Update Callsign');
		}
	};

	const onSaveJob = async (e) => {
		e.preventDefault();
		if (!canPromote) return;

		try {
			let res = await (
				await Nui.send('ManageEmployment', {
					SID: officer.SID,
					data: pJob,
					JobId: myJob?.Id
				})
			).json();
			if (res) {
				toast.success('Employment Updated');
				onUpdate();
				setJobEdit(false);
			} else toast.error('Unable to Update Employment');
		} catch (err) {
			console.log(err);
			toast.error('Unable to Update Employment');
		}
	};

	const onQualChange = (e) => {
		setPendingQual([...e.target.value]);
	};

	const onSaveQuals = async (e) => {
		e.preventDefault();
		if (!isHighCommand) return;

		try {
			let res = await (
				await Nui.send('Update', {
					type: 'person',
					SID: officer.SID,
					Key: 'Qualifications',
					Data: pendingQuals,
				})
			).json();
			if (res) {
				toast.success('Qualifications Updated');
				onUpdate();
				setQualEdit(false);
			} else toast.error('Unable to Update Qualifications');
		} catch (err) {
			console.log(err);
			toast.error('Unable to Update Qualifications');
		}
	};

	const fireEmployee = async () => {
		if (!canFire) return;

		try {
			let res = await (
				await Nui.send('FireEmployee', {
					SID: officer.SID,
					JobId: myJob.Id,
				})
			).json();

			if (res) {
				toast.success('Employee Terminated');
				onUpdate();
			} else toast.error('Unable to Fire Employee');
		} catch (err) {
			console.log(err);
			toast.error('Unable to Fire Employee');
		}
	};

	const onPrintBadge = async () => {
		try {
			await Nui.send('Close', {})
			Nui.send('PrintBadge', {
				SID: officer.SID,
				JobId: pJob?.Id,
			});
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className={classes.wrapper}>
			<Grid container style={{ height: '100%' }}>
				<Grid item xs={6}>
					<div className={classes.inner} style={{ marginRight: 10 }}>
						<Avatar
							className={`${classes.avatar}${canEdit ? ' hoverable' : ''}`}
							src={Boolean(officer?.Mugshot) ? officer?.Mugshot : ''}
							alt={officer.First}
							onClick={canEdit ? () => setPicture(true) : null}
						/>
						<List disablePadding>
							{[{label:'State ID',value:officer.SID},{label:'Name',value:`${officer.First} ${officer.Last}`},{label:'Phone',value:officer.Phone}].map(({label,value})=>(
								<ListItem key={label} className={classes.listItem}><div><div className={classes.listLabel}>{label}</div><div className={classes.listValue}>{value}</div></div></ListItem>
							))}
							{(myJob.Id === 'police' || (myJob.Id === 'ems' && myJob.Workplace?.Id === 'safd')) && (
								<ListItem className={`${classes.listItem}${canEdit ? ' ' + classes.hoverable : ''}`} onClick={canEdit ? () => setCallsign(true) : null}>
									<div><div className={classes.listLabel}>Callsign {canEdit && <span style={{color:'rgba(255,255,255,0.3)',fontSize:9}}>· click to edit</span>}</div><div className={classes.listValue}>{Boolean(officer.Callsign) ? officer.Callsign : 'Not Set'}</div></div>
								</ListItem>
							)}
							{officer?.LastClockOn?.[myJob.Id] && (
								<ListItem className={classes.listItem}><div><div className={classes.listLabel}>Last Clocked On</div><div className={classes.listValue}>{moment(officer?.LastClockOn?.[myJob.Id] * 1000).format('LLL')} ({moment(officer?.LastClockOn?.[myJob.Id] * 1000).fromNow()})</div></div></ListItem>
							)}
							{officer?.TimeClockedOn?.[myJob.Id] && (
								<ListItem className={classes.listItem}><div><div className={classes.listLabel}>Time Worked (Last Week)</div><div className={classes.listValue}>{parseDutyTime(officer.TimeClockedOn, myJob.Id)}</div></div></ListItem>
							)}
						</List>
					</div>
				</Grid>
				<Grid item xs={6}>
					<div className={classes.inner} style={{ marginLeft: 10 }}>
						<List disablePadding>
							{(officer.SID != user.SID && !officer.MDTSystemAdmin) && (
								<ListItem className={classes.listItem}>
									<ButtonGroup fullWidth>
										{canPromote && <Button onClick={() => setJobEdit(true)}>
											Edit
										</Button>}
										{canFire && <Button onClick={() => setJobFire(true)}>
											Fire
										</Button>}
										{isHighCommand && <Button onClick={() => setQualEdit(true)}>
											Qual.
										</Button>}
										{isHighCommand && <Button onClick={() => onPrintBadge()}>
											Badge
										</Button>}
									</ButtonGroup>
								</ListItem>
							)}
							{(officer.SID == user.SID && isHighCommand) && (
								<ListItem className={classes.listItem}>
									<ButtonGroup fullWidth>
										{isHighCommand && <Button onClick={() => setQualEdit(true)}>Qualifications</Button>}
										{isHighCommand && <Button onClick={() => onPrintBadge()}>Badge</Button>}
									</ButtonGroup>
								</ListItem>
							)}
							{[
								{label:'Department', value: officerGovJobData?.Workplace?.Name},
								{label:'Rank', value: officerGovJobData?.Grade?.Name},
								{label:'Qualifications', value: Boolean(officer.Qualifications) && officer.Qualifications.length > 0 ? officer.Qualifications.map(q => availableQualifications[q]?.name ?? 'Unknown').join(', ') : 'No Qualifications'},
								{label:'Permissions', value: Object.keys(jobData.Workplaces.find(w => w.Id == officerGovJobData?.Workplace?.Id)?.Grades.find(g => g.Id == officerGovJobData?.Grade.Id)?.Permissions).map(k => availablePermissions[k]?.name ?? 'Unknown').join(', ')},
							].map(({label, value}) => (
								<ListItem key={label} className={classes.listItem}>
									<div><div className={classes.listLabel}>{label}</div><div className={classes.listValue}>{value}</div></div>
								</ListItem>
							))}
						</List>
					</div>
				</Grid>
			</Grid>
			<Modal
				open={picture}
				maxWidth="sm"
				title="Update Profile Picture"
				onSubmit={onSavePicture}
				onClose={() => setPicture(false)}
			>
				<Avatar
					className={classes.avatar}
					src={pending.picture}
					alt={officer.First}
				/>
				<TextField
					fullWidth
					required
					label="Image URL"
					variant="outlined"
					name="picture"
					value={pending.picture}
					className={classes.field}
					onChange={(e) =>
						setPending({
							...pending,
							picture: e.target.value,
						})
					}
				/>
			</Modal>
			<Modal
				open={callsign}
				maxWidth="sm"
				title="Update Callsign"
				onSubmit={onSaveCallsign}
				onClose={() => setCallsign(false)}
			>
				<TextField
					fullWidth
					required
					label="Callsign"
					helperText="3 characters long, NUMBERS ONLY"
					variant="outlined"
					name="callsign"
					value={pending.callsign}
					className={classes.field}
					inputProps={{
						pattern: '[0-9]{3}',
						maxLength: 3,
					}}
					onChange={(e) => {
						let v = e.target.value;
						if (/[0-9\b]+$/.test(v))
							setPending({
								...pending,
								callsign: e.target.value,
							});
					}}
				/>
			</Modal>
			<Modal
				open={jobEdit}
				maxWidth="sm"
				title="Update Job"
				onSubmit={onSaveJob}
				onClose={() => setJobEdit(false)}
			>
				<TextField
					select
					fullWidth
					disabled={!hasPerm('PD_HIGH_COMMAND') && !hasPerm('DOJ_JUDGE')}
					label="Department"
					className={classes.editorField}
					value={pJob.Workplace.Id}
					onChange={(e) =>
						setPJob({
							...pJob,
							Workplace: jobData.Workplaces.find(w => w.Id == e.target.value),
							Grade: jobData.Workplaces.find(w => w.Id == e.target.value)?.Grades.sort((a, b) => a.Level - b.Level)[0],
						})
					}
				>
					{jobData.Workplaces.map((w) => (
						<MenuItem key={w.Id} value={w.Id}>
							{w.Name}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					fullWidth
					disabled={!canPromote}
					label="Rank"
					className={classes.editorField}
					value={pJob.Grade.Id}
					onChange={(e) =>
						setPJob({
							...pJob,
							Grade: jobData.Workplaces.find(
								(w) => w.Id == pJob.Workplace.Id
							)?.Grades.find(
								(g) => g.Id == e.target.value
							),
						})
					}
				>
					{jobData.Workplaces.find(w => w.Id == pJob.Workplace.Id)?.Grades.map(g => (
						<MenuItem
							key={g.Id}
							value={g.Id}
							disabled={!hasPerm(true) && g.Level >= myJob.Grade.Level}
						>
							{g.Name}
						</MenuItem>
					))}
				</TextField>
			</Modal>

			<Modal
				open={qualEdit}
				maxWidth="sm"
				title="Update Qualifications"
				onSubmit={onSaveQuals}
				onClose={() => setQualEdit(false)}
			>
				<FormControl fullWidth className={classes.editorField}>
					<InputLabel>
						Qualifications
					</InputLabel>
					<Select
						multiple
						fullWidth
						value={pendingQuals}
						onChange={onQualChange}
						input={
							<OutlinedInput fullWidth label="Qualifications" />
						}
						renderValue={(selected) => (
							<Box style={{ display: 'flex', flexWrap: 'wrap' }}>
								{selected.map((value) => (
									<Chip
										key={value}
										label={availableQualifications[value]?.name ?? 'Unknown'}
										style={{ margin: 2 }}
									/>
								))}
							</Box>
						)}
					>
						{Object.keys(availableQualifications)
							.filter(qual => {
								const data = availableQualifications[qual];
								return (data && (!data.restrict || (data.restrict.job === myJob.Id && (!data.restrict.workplace || data.restrict.workplace == myJob?.Workplace?.Id))));
							}).map(qual => (
								<MenuItem key={`q-${qual}`} value={qual}>
									{availableQualifications[qual]?.name}
								</MenuItem>
							)
						)}
					</Select>
				</FormControl>
			</Modal>
			<Modal
				open={jobFire}
				maxWidth="sm"
				title={`Fire ${officer.First} ${officer.Last}?`}
				acceptLang="Yes"
				closeLang="No"
				onAccept={fireEmployee}
				onClose={() => setJobFire(false)}
			>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to terminate{' '}
						{officerGovJobData?.Workplace?.Name} {officerGovJobData?.Grade.Name}{' '}
						{officer.First} {officer.Last}?
					</DialogContentText>
				</DialogContent>
			</Modal>
		</div>
	);
};
