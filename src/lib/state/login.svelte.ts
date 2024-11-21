class OpenState {
	open = $state(false);
	alwaysClose = $state(false);
	shouldAllowCloseOnSignIn = $state(true);
	toggleOpen() {
		if (this.alwaysClose) {
			return;
		}

		this.open = !this.open;
	}
	setOpen(s: boolean) {
		if (this.alwaysClose) {
			return;
		}

		this.open = s;
	}
}

export const AuthDialog = new OpenState();
