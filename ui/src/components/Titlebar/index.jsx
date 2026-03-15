import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, IconButton, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useBranding, useCitySeal } from '../../hooks';
import Nui from '../../util/Nui';
import Account from './Account';

const useStyles = makeStyles((theme) => ({
	navbar: {
		background: theme.palette.secondary.dark,
		width: '100%',
		borderBottom: `2px solid ${theme.palette.primary.main}`,
		boxShadow: `0 2px 12px rgba(0,0,0,0.6)`,
		position: 'relative',
	},
	cityLogoLink: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 14px',
		height: '100%',
		minHeight: 56,
		borderRight: `1px solid ${theme.palette.primary.main}40`,
		transition: 'background ease-in 0.15s',
		'&:hover': {
			background: `${theme.palette.primary.main}18`,
		},
	},
	cityLogo: {
		width: 34,
		height: 34,
		objectFit: 'contain',
	},
	branding: {
		marginLeft: 12,
		marginRight: 12,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		'& .primary-label': {
			display: 'block',
			fontSize: 15,
			fontWeight: 700,
			letterSpacing: '0.06em',
			textTransform: 'uppercase',
			color: theme.palette.primary.main,
		},
		'& .secondary-label': {
			display: 'block',
			fontSize: 10,
			letterSpacing: '0.14em',
			textTransform: 'uppercase',
			color: 'rgba(255,255,255,0.45)',
		},
	},
	navLinks: {
		display: 'inline-flex',
		alignItems: 'stretch',
		width: '100%',
		height: '100%',
	},
	title: {
		flexGrow: 1,
		display: 'flex',
		alignItems: 'stretch',
	},
	brandingCenter: {
		position: 'absolute',
		left: '50%',
		transform: 'translateX(-50%)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
		'& .primary-label': {
			display: 'block',
			fontSize: 13,
			fontWeight: 700,
			letterSpacing: '0.08em',
			textTransform: 'uppercase',
			color: theme.palette.primary.main,
		},
		'& .secondary-label': {
			display: 'block',
			fontSize: 9,
			letterSpacing: '0.16em',
			textTransform: 'uppercase',
			color: 'rgba(255,255,255,0.75)',
		},
	},
	right: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 2,
		paddingRight: 8,
	},
	user: {
		marginRight: 10,
		textAlign: 'right',
		'& span': {
			display: 'block',
			fontSize: 13,
			fontWeight: 600,
			color: theme.palette.text.main,
		},
		'& small': {
			display: 'block',
			fontSize: 10,
			letterSpacing: '0.08em',
			textTransform: 'uppercase',
			color: theme.palette.primary.main,
		},
	},
	divider: {
		margin: '14px 6px',
		background: 'rgba(255,255,255,0.1)',
	},
	navBtn: {
		color: 'rgba(255,255,255,0.5)',
		transition: 'color ease-in 0.15s, background ease-in 0.15s',
		borderRadius: 6,
		'&:hover': {
			color: theme.palette.primary.main,
			background: `${theme.palette.primary.main}18`,
		},
	},
	closeBtn: {
		color: 'rgba(255,255,255,0.5)',
		transition: 'color ease-in 0.15s, background ease-in 0.15s',
		borderRadius: 6,
		'&:hover': {
			color: '#ff5555',
			background: 'rgba(255, 85, 85, 0.12)',
		},
	},
}));

export default ({ businessData }) => {
	const classes = useStyles();
	const history = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const getSeal = useCitySeal();
	const job = useSelector((state) => state.app.govJob);
	const attorney = useSelector((state) => state.app.attorney);
	const hidden = useSelector((state) => state.app.hidden);

	const branding = useBranding(job, attorney);


	const onClose = () => {
		Nui.send('Close');
	};

	const hoverChange = (state) => {
		if (!hidden && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/system')) {
			dispatch({
				type: 'SET_OPACITY_MODE',
				payload: {
					state,
				},
			});
		}
	};

	return (
		<AppBar elevation={0} position="relative" color="transparent" className={classes.navbar}>
			<Toolbar disableGutters style={{ minHeight: 56, height: 56, position: 'relative' }}>
				<div
					className={classes.title}
					onMouseEnter={() => hoverChange(true)}
					onMouseLeave={() => hoverChange(false)}
				>
					<div className={classes.navLinks}>
						<Link to="/" className={classes.cityLogoLink}>
							<img src={getSeal()} className={classes.cityLogo} />
						</Link>
					</div>
				</div>
				<div className={classes.brandingCenter}>
					<span className="primary-label">{branding.primary}</span>
					<span className="secondary-label">{branding.secondary}</span>
				</div>
				<div className={classes.right}>
					<div className={classes.user}>
						<Account />
					</div>
					<Divider orientation="vertical" className={classes.divider} flexItem />
					<IconButton className={classes.navBtn} onClick={() => history(-1)}>
						<FontAwesomeIcon icon={['fas', 'chevron-left']} />
					</IconButton>
					<IconButton className={classes.navBtn} onClick={() => history(1)}>
						<FontAwesomeIcon icon={['fas', 'chevron-right']} />
					</IconButton>
					<IconButton className={classes.closeBtn} onClick={onClose}>
						<FontAwesomeIcon icon={['fas', 'xmark']} />
					</IconButton>
				</div>
			</Toolbar>
		</AppBar>
	);
};
