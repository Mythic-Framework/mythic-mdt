import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { useMediaQuery, Drawer } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

import NavLinksEl from './NavLinks';

const useStyles = makeStyles((theme) => ({
	mobileNav: {
		width: '100%',
		maxWidth: 260,
		backgroundColor: theme.palette.secondary.dark,
		borderRight: `1px solid ${theme.palette.primary.main}30`,
	},
}));

export default ({ links }) => {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = !useMediaQuery(theme.breakpoints.up('lg'));
	const job = useSelector(state => state.app.govJob);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!isMobile) {
			setMobileOpen(false);
		}
	}, [isMobile]);

	const usable = job?.Id === 'police';

	const [open, setOpen] = useState(false);
	const onClick = (e) => {
		e.preventDefault();
		if (e.currentTarget.name === open) {
			setOpen(false);
		} else {
			setOpen(e.currentTarget.name);
		}
	};

	const handleMenuClose = () => {
		if (!usable) return;
		setMobileOpen(false);
	};

	const [compress, setCompress] = useState(false);

	return (
		<>
			{!isMobile ? (
				<NavLinksEl
					links={links}
					onClick={onClick}
					handleMenuClose={handleMenuClose}
					open={open}
					compress={compress}
				/>
			) : null}

			<Drawer
				PaperProps={{ className: classes.mobileNav }}
				anchor="left"
				open={mobileOpen && isMobile}
				onClose={() => setMobileOpen(false)}
			>
				<NavLinksEl
					links={links}
					onClick={onClick}
					handleMenuClose={handleMenuClose}
					open={open}
					compress={false}
				/>
			</Drawer>
		</>
	);
};
