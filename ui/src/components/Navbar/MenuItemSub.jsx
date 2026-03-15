import React from 'react';
import { makeStyles } from '@mui/styles';
import {
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Collapse,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

import MenuItem from './MenuItem';

const useStyles = makeStyles((theme) => ({
	link: {
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
	icon: {
		fontSize: 10,
		transition: 'transform 0.3s ease',
		color: 'rgba(255,255,255,0.3)',
	},
}));

export default (props) => {
	const classes = useStyles();

	return (
		<>
			<ListItem
				className={classes.link}
				component={NavLink}
				end={props.link.exact}
				to={props.link.path}
				name={props.link.name}
				onClick={props.onClick}
				button
			>
				<ListItemIcon>
					<FontAwesomeIcon icon={props.link.icon} />
				</ListItemIcon>
				<ListItemText primary={props.link.label} />
				{Boolean(props.link.items) && props.link.items.length > 0 ? (
					<FontAwesomeIcon
						className={classes.icon}
						icon={
							props.open === props.link.name
								? 'chevron-up'
								: 'chevron-down'
						}
					/>
				) : null}
			</ListItem>
			<Collapse in={props.open === props.link.name}>
				<List component="div" disablePadding>
					{props.link.items.map((sublink, j) => {
						return (
							<MenuItem
								key={`sub-${props.link.name}-${j}`}
								link={sublink}
								onClick={props.handleMenuClose}
								nested
							/>
						);
					})}
				</List>
			</Collapse>
		</>
	);
};
