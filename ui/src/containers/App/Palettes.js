const TealPrimary = {
	main: '#00c9b1',
	light: '#4ddece',
	dark: '#008c7c',
	contrastText: '#0a0a0a',
};

export const GetDeptPalette = (workplace, theme) => {
	return StandardPalette(theme);
};

export const LSPDPalette = (theme) => StandardPalette(theme);
export const LSCSOPalette = (theme) => StandardPalette(theme);
export const DOJPalette = (theme) => StandardPalette(theme);
export const MedicalPalette = (theme) => StandardPalette(theme);

export const StandardPalette = (theme) => {
	return {
		primary: TealPrimary,
		secondary: {
			main: '#141414',
			light: '#1c1c1c',
			dark: '#0f0f0f',
			contrastText: '#ffffff',
		},
		error: {
			main: '#6e1616',
			light: '#a13434',
			dark: '#430b0b',
		},
		success: {
			main: '#52984a',
			light: '#60eb50',
			dark: '#244a20',
		},
		warning: {
			main: '#f09348',
			light: '#f2b583',
			dark: '#b05d1a',
		},
		info: {
			main: '#247ba5',
			light: '#247ba5',
			dark: '#175878',
		},
		text: {
			main: theme === 'dark' ? '#ffffff' : '#2e2e2e',
			alt: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#858585',
			info: theme === 'dark' ? '#919191' : '#919191',
			light: '#ffffff',
			dark: '#000000',
		},
		alt: {
			green: '#008442',
			greenDark: '#064224',
		},
		border: {
			main: theme === 'dark' ? '#e0e0e008' : '#e0e0e008',
			light: '#ffffff',
			dark: '#26292d',
			input:
				theme === 'dark'
					? 'rgba(255, 255, 255, 0.23)'
					: 'rgba(0, 0, 0, 0.23)',
			divider:
				theme === 'dark'
					? 'rgba(255, 255, 255, 0.12)'
					: 'rgba(0, 0, 0, 0.12)',
		},
		mode: theme,
	};
};
