import React, { useEffect, useState } from 'react';
import {
	Divider,
	Button,
	Grid,
	IconButton,
	TextField,
	InputAdornment,
	MenuItem,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
const Truncate = ({ lines, children }) => <span style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { toast } from 'react-toastify';

import { Modal } from '../../components';
import { CurrencyFormat } from '../../util/Parser';
import { ChargeTypes } from '../../data';
import Nui from '../../util/Nui';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: 20,
		height: '100%',
	},
	chargesWrapper: {
		height: '90%',
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		placeContent: 'flex-start',
		gap: 5,
		overflowY: 'auto',
		overflowX: 'hidden',
		justifyContent: 'space-between',
	},
	charge: {
		width: '49%',
		marginBottom: 5,
		padding: '10px 12px',
		height: 70,
		userSelect: 'none',
		color: 'rgba(255,255,255,0.8)',
		background: theme.palette.secondary.dark,
		border: `1px solid rgba(255,255,255,0.06)`,
		borderRadius: 3,
		transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
		'& small': {
			fontSize: 11,
			color: 'rgba(255,255,255,0.4)',
		},
		'&:hover': {
			background: `${theme.palette.primary.main}12`,
			borderColor: `${theme.palette.primary.main}40`,
			cursor: 'pointer',
		},
		'&.type-1': {
			borderLeft: `4px solid ${theme.palette.info.main}`,
		},
		'&.type-2': {
			borderLeft: `4px solid ${theme.palette.warning.main}`,
		},
		'&.type-3': {
			borderLeft: `4px solid ${theme.palette.error.main}`,
		},
		'&-enter': {
			opacity: 0,
		},
		'&-enter-active': {
			opacity: 1,
			transition: 'opacity 500ms ease-in',
		},
		'&-exit': {
			opacity: 1,
		},
		'&-exit-active': {
			opacity: 0,
			transition: 'opacity 500ms ease-in',
		},
	},
	field: {
		marginBottom: 15,
	},
	key: {
		display: 'inline-flex',
		alignItems: 'center',
		height: 'fit-content',
		gap: 4,
	},
	keyTitle: {
		fontSize: 14,
		fontWeight: 700,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: theme.palette.primary.main,
		marginRight: 8,
	},
	keyItem: {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '4px 10px',
		gap: 6,
		fontSize: 12,
		color: 'rgba(255,255,255,0.55)',
		'& svg': {
			fontSize: 10,
		},
	},
	infractionKey: {
		color: theme.palette.info.main,
	},
	misdemeanorKey: {
		color: theme.palette.warning.main,
	},
	felonyKey: {
		color: theme.palette.error.main,
	},
}));

const initialState = {
	type: 1,
	title: '',
	description: '',
	fine: '',
	jail: '',
	points: '',
};

export default () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const charges = useSelector((state) => state.data.data.charges);
	const breakpoints = useSelector((state) => state.app.pointBreakpoints);

	const [search, setSearch] = useState('');
	const [selCharge, setSelCharge] = useState(null);
	const [filtered, setFiltered] = useState(Array());

	useEffect(() => {
		setFiltered(
			charges.filter((c) =>
				c.title.toUpperCase().includes(search.toUpperCase()),
			),
		);
	}, [search]);

	useEffect(() => {
		setFiltered(
			charges.filter((c) =>
				c.title.toUpperCase().includes(search.toUpperCase()),
			),
		);
	}, [charges]);

	return (
		<div className={classes.wrapper}>
			<Grid container spacing={2} className={classes.field}>
				<Grid item xs={6}>
					<div className={classes.key}>
						<div className={classes.keyTitle}>
							Penal Code
						</div>
						<Divider orientation="vertical" flexItem />
						<div className={classes.keyItem}>
							<FontAwesomeIcon
								icon={['fas', 'square']}
								className={classes.infractionKey}
							/>
							<span>Infraction</span>
						</div>
						<div className={classes.keyItem}>
							<FontAwesomeIcon
								icon={['fas', 'square']}
								className={classes.misdemeanorKey}
							/>
							<span>Misdemeanor</span>
						</div>
						<div className={classes.keyItem}>
							<FontAwesomeIcon
								icon={['fas', 'square']}
								className={classes.felonyKey}
							/>
							<span>Felony</span>
						</div>
					</div>
				</Grid>
				<Grid item xs={6}>
					<TextField
						fullWidth
						variant="outlined"
						name="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						label="Search Charge"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									{search != '' && (
										<IconButton
											type="button"
											onClick={() => setSearch('')}
										>
											<FontAwesomeIcon
												icon={['fas', 'xmark']}
											/>
										</IconButton>
									)}
								</InputAdornment>
							),
						}}
					/>
				</Grid>
			</Grid>
			<TransitionGroup className={classes.chargesWrapper}>
				{filtered
					.sort((a, b) => a.fine - b.fine)
					.sort((a, b) => a.jail - b.jail)
					.sort((a, b) => a.type - b.type)
					.map((charge) => {
						return (
							<CSSTransition
								key={`avail-${charge._id}`}
								timeout={500}
								classNames="item"
							>
								<div
									className={`${classes.charge} type-${charge.type}`}
									title={charge.title}
									onClick={() => setSelCharge(charge)}
								>
									<Truncate lines={1}>
										{charge.title}
									</Truncate>
									<div>
										<small>
											{charge.jail
												? `Time: ${charge.jail} `
												: null}
											{charge.fine
												? `Fine: ${CurrencyFormat.format(
														charge.fine,
												  )} `
												: null}
											{charge.points
												? `Points: ${charge.points}`
												: null}
										</small>
									</div>
								</div>
							</CSSTransition>
						);
					})}
			</TransitionGroup>
			<Modal
				open={selCharge != null}
				title={
					Boolean(selCharge) ? `${selCharge.title}` : 'UNK'
				}
				closeLang="Close"
				onClose={() => setSelCharge(null)}
			>
				{Boolean(selCharge) && (
					<List>
						<ListItem>
							<ListItemText
								primary="Charge Type"
								secondary={
									ChargeTypes.filter(
										(t) => t.value == selCharge.type,
									)[0].label
								}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Charge Name"
								secondary={selCharge.title}
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								style={{ whiteSpace: 'pre-line' }}
								primary="Charge Description"
								secondary={selCharge.description}
							/>
						</ListItem>
						{Boolean(selCharge.fine) && (
							<ListItem>
								<ListItemText
									primary="Fine"
									secondary={CurrencyFormat.format(
										selCharge.fine,
									)}
								/>
							</ListItem>
						)}
						{Boolean(selCharge.jail) && (
							<ListItem>
								<ListItemText
									primary="Jail Sentence"
									secondary={`${selCharge.jail} Months`}
								/>
							</ListItem>
						)}
						{Boolean(selCharge.points) && (
							<ListItem>
								<ListItemText
									primary="License Points"
									secondary={`${selCharge.points} Points`}
								/>
							</ListItem>
						)}
					</List>
				)}
			</Modal>
		</div>
	);
};