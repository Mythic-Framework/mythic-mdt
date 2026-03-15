import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Grid, List, ListItem, IconButton, Pagination } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGovJob, usePermissions } from '../../hooks';
import Item from './NBItem';

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
	},
	headerTitle: {
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

export default ({ boardTitle = 'Notice Board', perPage = 3 }) => {
	const classes = useStyles();
	const hasJob = useGovJob();
	const hasPerm = usePermissions();
	const myJob = useSelector((state) => state.app.govJob);
	const governmentJobs = useSelector((state) => state.data.data.governmentJobs);
	const notices = useSelector((state) => state.data.data.notices);
	const PER_PAGE = perPage;
	const [filtered, setFiltered] = useState(Array());
	const [pages, setPages] = useState(1);
	const [page, setPage] = useState(1);

	const isHighCommand = hasPerm('PD_HIGH_COMMAND') || hasPerm('SAFD_HIGH_COMMAND');

	useEffect(() => {
		setPages(Math.ceil(notices.length / PER_PAGE));
		setPage(1);
		setFiltered(
			filtered.filter(
				(n) =>
					!n.job ||
					(typeof n.job == 'boolean' && governmentJobs.includes(myJob?.Id)) ||
					hasJob(n.job, n.workplace) ||
					hasPerm(true),
			),
		);
	}, [notices]);

	useEffect(() => {
		setPages(Math.ceil(notices.length / PER_PAGE));
		setPage(1);
	}, [filtered]);

	const onPagi = (e, p) => {
		setPage(p);
	};

	return (
		<Grid item xs={12} className={classes.container}>
			<div className={classes.block}>
				<div className={classes.header}>
					<span className={classes.headerTitle}>{boardTitle}</span>
					{isHighCommand && (
						<IconButton component={Link} to="create/notice" className={classes.create} size="small">
							<FontAwesomeIcon icon={['fas', 'plus']} />
						</IconButton>
					)}
				</div>
				<List>
					{notices && notices.length > 0 ? (
						notices
							.slice((page - 1) * PER_PAGE, page * PER_PAGE)
							.sort((a, b) => b.time - a.time)
							.map((notice, k) => {
								return <Item key={`notices-${k}`} notice={notice} />;
							})
					) : (
						<ListItem>
							<Alert variant="outlined" severity="info">
								No Notices
							</Alert>
						</ListItem>
					)}
				</List>
				{pages > 1 && (
					<Pagination
						variant="outlined"
						shape="rounded"
						color="primary"
						page={page}
						count={pages}
						onChange={onPagi}
					/>
				)}
			</div>
		</Grid>
	);
};
