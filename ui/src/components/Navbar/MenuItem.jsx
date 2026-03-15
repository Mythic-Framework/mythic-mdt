import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

export default (props) => {
	const useStyles = makeStyles((theme) => ({
		link: {
			paddingLeft: props.nested ? '32px !important' : null,
			color: 'rgba(255,255,255,0.5)',
			height: 52,
			borderLeft: '3px solid transparent',
			transition: 'color ease-in 0.15s, background ease-in 0.15s, border-color ease-in 0.15s',
			'& .MuiListItemIcon-root': {
				minWidth: 36,
				color: 'rgba(255,255,255,0.35)',
				transition: 'color ease-in 0.15s',
			},
			'& svg': {
				fontSize: 16,
			},
			'& .MuiListItemText-primary': {
				fontSize: 13,
				fontWeight: 500,
				letterSpacing: '0.03em',
			},
			'&:hover': {
				color: theme.palette.primary.main,
				background: `${theme.palette.primary.main}0f`,
				borderLeftColor: `${theme.palette.primary.main}60`,
				cursor: 'pointer',
				'& .MuiListItemIcon-root': {
					color: theme.palette.primary.main,
				},
			},
			'&.active': {
				color: theme.palette.primary.main,
				background: `${theme.palette.primary.main}15`,
				borderLeftColor: theme.palette.primary.main,
				'& .MuiListItemIcon-root': {
					color: theme.palette.primary.main,
				},
			},
		},
	}));
	const classes = useStyles();

	return (
		<ListItem
			button
			end={props.link.exact}
			className={classes.link}
			component={NavLink}
			to={props.link.path}
			name={props.link.name}
			onClick={props.onClick}
		>
			<ListItemIcon>
				<FontAwesomeIcon icon={props.link.icon} />
			</ListItemIcon>
			{!props.compress ? (
				<ListItemText primary={props.link.label} />
			) : null}
		</ListItem>
	);
};
