function UnstableGameOptions()
{
	// TODO	Read this from saved settings (and possibly command line args)
	this.fullscreen		= false;

	// TODO	Add options for mapping inputs with keyboard and/or
	//		gamepads

	/* Determine if fullscreen is supported */
	var f = document.getElementById('fullscreen');

	if (this.supportsFullscreen()) {
		f.disabled	= false;
		f.checked	= this.fullscreen;

		this.setFullscreen(this.fullscreen);

		f.addEventListener('change', function() {
			this.fullscreen = f.checked;
			this.setFullscreen(this.fullscreen);
		}.bind(this));
	} else {
		f.disabled = true;
	}
};

/* Does this browser allow fullscreen? */
UnstableGameOptions.prototype.supportsFullscreen = function supportsFullscreen()
{
	if (document.body.requestFullScreen		||
		document.body.msRequestFullScreen	||
		document.body.mozRequestFullScreen	||
		document.body.webkitRequestFullScreen
	) {
		return(true);
	} else {
		return(false);
	}
};

UnstableGameOptions.prototype.setFullscreen = function setFullscreen(enabled)
{
	if (enabled) {
		setTimeout(function() {
			if (document.body.requestFullscreen) {
				document.body.requestFullscreen();
			} else if (document.body.msRequestFullscreen) {
				document.body.msRequestFullscreen();
			} else if (document.body.mozRequestFullScreen) {
				document.body.mozRequestFullScreen();
			} else if (document.body.webkitRequestFullscreen) {
				document.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}

			/* This is required when running in xulrunner */
			window.fullScreen = true;
		}, 1);
	} else {
		setTimeout(function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}

			/* This is required when running in xulrunner */
			window.fullScreen = false;
		}, 1);
	}
};

UnstableGameOptions.prototype.ready = function ready(cb)
{
	// TODO	Call the cb when prefs are loaded (maybe from chrome service...)

	cb();
};
