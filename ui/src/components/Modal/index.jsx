import React, { useEffect } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Paper,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import Draggable from 'react-draggable';

const useStyles = makeStyles((theme) => ({
	dialog: {
		'& .MuiPaper-root': {
			background: theme.palette.secondary.dark,
			border: `1px solid ${theme.palette.primary.main}30`,
			boxShadow: `0 8px 32px rgba(0,0,0,0.8)`,
			borderRadius: 4,
		},
	},
	title: {
		padding: '14px 20px',
		fontSize: 15,
		fontWeight: 700,
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		color: theme.palette.primary.main,
		borderBottom: `1px solid ${theme.palette.primary.main}25`,
		cursor: 'move',
	},
	popup: {
		paddingTop: `12px !important`,
		maxHeight: `750px !important`,
		padding: '12px 20px !important',
	},
	actions: {
		padding: '10px 16px',
		borderTop: `1px solid ${theme.palette.primary.main}20`,
		gap: 6,
	},
	btnClose: {
		color: 'rgba(255,255,255,0.45)',
		border: '1px solid rgba(255,255,255,0.12)',
		'&:hover': {
			color: '#fff',
			borderColor: 'rgba(255,255,255,0.3)',
			background: 'rgba(255,255,255,0.06)',
		},
	},
	btnDelete: {
		color: theme.palette.error.light,
		border: `1px solid ${theme.palette.error.main}60`,
		'&:hover': {
			background: `${theme.palette.error.main}18`,
			borderColor: theme.palette.error.light,
		},
	},
	btnSubmit: {
		color: theme.palette.primary.contrastText,
		background: theme.palette.primary.main,
		fontWeight: 700,
		letterSpacing: '0.04em',
		'&:hover': {
			background: theme.palette.primary.dark,
		},
	},
	btnAccept: {
		color: theme.palette.primary.contrastText,
		background: theme.palette.primary.main,
		fontWeight: 700,
		'&:hover': {
			background: theme.palette.primary.dark,
		},
	},
}));

function PaperComponent(props) {
	return (
		<Draggable
			handle="#draggable-dialog-title"
			cancel={'[class*="MuiDialogContent-root"]'}
		>
			<Paper {...props} />
		</Draggable>
	);
}

export default ({
	open,
	title,
	maxWidth = 'md',
	submitLang = 'Save',
	acceptLang = 'OK',
	deleteLang = 'Delete',
	closeLang = 'Close',
	onClose = null,
	onSubmit = null,
	onAccept = null,
	onDelete = null,
	children,
}) => {
	const classes = useStyles();
	const mdtOpen = !useSelector((state) => state.app.hidden);

	return (
		<Dialog
			maxWidth={maxWidth}
			fullWidth
			PaperComponent={PaperComponent}
			scroll="paper"
			open={open && mdtOpen}
			onClose={onClose}
			className={classes.dialog}
		>
			{Boolean(onSubmit) ? (
				<form onSubmit={onSubmit}>
					<DialogTitle className={classes.title} id="draggable-dialog-title">
						{title}
					</DialogTitle>
					<DialogContent className={classes.popup}>
						{children}
					</DialogContent>
					<DialogActions className={classes.actions}>
						{Boolean(onDelete) && (
							<Button variant="outlined" className={classes.btnDelete} type="button" onClick={onDelete}>
								{deleteLang}
							</Button>
						)}
						<Button variant="outlined" className={classes.btnClose} type="button" onClick={onClose}>
							{closeLang}
						</Button>
						<Button variant="contained" className={classes.btnSubmit} type="submit">{submitLang}</Button>
					</DialogActions>
				</form>
			) : (
				<>
					<DialogTitle className={classes.title} id="draggable-dialog-title">
						{title}
					</DialogTitle>
					<DialogContent className={classes.popup}>
						{children}
					</DialogContent>
					<DialogActions className={classes.actions}>
						{Boolean(onDelete) && (
							<Button variant="outlined" className={classes.btnDelete} type="button" onClick={onDelete}>
								{deleteLang}
							</Button>
						)}
						<Button variant="outlined" className={classes.btnClose} type="button" onClick={onClose}>
							{closeLang}
						</Button>
						{Boolean(onAccept) && (
							<Button variant="contained" className={classes.btnAccept} type="button" onClick={onAccept}>
								{acceptLang}
							</Button>
						)}
					</DialogActions>
				</>
			)}
		</Dialog>
	);
};
