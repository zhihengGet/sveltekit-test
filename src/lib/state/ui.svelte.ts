export const uiControl = $state({
	header: { open: true, style: '' }
});
export const headerControl = $state({
	open: false, //reader open
	//brows
	openTopHeader: true, // main page header
	//mobile
	openBottomHeader: true, // main page footer
	style: '',
	toggle() {
		headerControl.openTopHeader = false;
		headerControl.openBottomHeader = false;
	}
});
