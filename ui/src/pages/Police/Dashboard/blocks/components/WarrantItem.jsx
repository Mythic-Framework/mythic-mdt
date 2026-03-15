import React from 'react';
import { useDispatch } from 'react-redux';
import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import Moment from 'react-moment';
const Truncate = ({ lines, children }) => <span style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>;
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		userSelect: 'none',
		borderLeft: '3px solid transparent',
		transition: 'background ease-in 0.15s, border-color ease-in 0.15s',
		'&:hover': {
			cursor: 'pointer',
			background: `${theme.palette.primary.main}0f`,
			borderLeftColor: `${theme.palette.primary.main}60`,
		},
	},
	time: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.35)',
		whiteSpace: 'nowrap',
		marginLeft: 8,
	},
}));

export default ({ warrant }) => {
	const classes = useStyles();
	const dispatch = useDispatch();

	return (
		<>
			<ListItem
				button
				className={classes.wrapper}
				component={Link}
				to={`/warrants/${warrant._id}`}
			>
				<ListItemAvatar>
					<Avatar
						src={warrant.suspect.Mugshot}
						alt={warrant.suspect.First}
					/>
				</ListItemAvatar>
				<ListItemText
					primary={
						<Truncate
							lines={1}
						>{`${warrant.suspect.First} ${warrant.suspect.Last}`}</Truncate>
					}
					secondary={
						<Truncate lines={1}>
							Expires:{' '}
							<Moment
								date={warrant.expires}
								fromNow
								withTitle
								titleFormat="LLLL"
								interval={60000}
							/>
						</Truncate>
					}
				/>
			</ListItem>
		</>
	);
};
