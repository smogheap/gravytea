function UnstableGameOptions()
{
	this.defaults = {
		fullscreen:		false,
foo: 1
	};

	// TODO	Add options for mapping inputs with keyboard and/or gamepads
	// TODO	Allow reading options from cli args when running in xulrunner

	/* Determine if fullscreen is supported */
	var f = document.getElementById('fullscreen');

	this.addFullscreenOption();
};

UnstableGameOptions.prototype.addFullscreenOption = function addFullscreenOption()
{
	if ('boolean' === typeof window.fullScreen	||
		document.body.requestFullScreen			||
		document.body.msRequestFullScreen		||
		document.body.mozRequestFullScreen		||
		document.body.webkitRequestFullScreen
	) {
		var div = document.createElement('div');
		var a	= document.createElement('a');

		a.addEventListener('click', function() {
			this.toggleFullscreen();
		}.bind(this));

		a.appendChild(document.createTextNode('Toggle Fullscreen'));
		div.appendChild(a);

		document.getElementById('options').appendChild(div);
	}

	if (this.get('fullscreen')) {
		/*
			This won't work in most browsers, but attempt it anyway. It will
			work in xulrunner.
		*/
		this.setFullscreen(true);
	}
};

UnstableGameOptions.prototype.toggleFullscreen = function toggleFullscreen()
{
	if (!document.fullscreenElement			&&
		!document.mozFullScreenElement		&&
		!document.webkitFullscreenElement	&&
		!document.msFullscreenElement		&&
		!window.fullScreen
	) {
		this.setFullscreen(true);
		this.set('fullscreen', true);
	} else {
		this.setFullscreen(false);
		this.set('fullscreen', false);
	}
};

UnstableGameOptions.prototype.setFullscreen = function setFullscreen(enabled, delay)
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
			if ('boolean' === typeof window.fullScreen) {
				window.fullScreen = true;
			}
		}, delay || 1);
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
			if ('boolean' === typeof window.fullScreen) {
				window.fullScreen = false;
			}
		}, delay || 1);
	}
};

UnstableGameOptions.prototype.ready = function ready(cb)
{
	if (typeof(chrome) !== "undefined" && chrome.storage) {
		/* Load all local and remote settings before continuing */
		chrome.storage.local.get(null, function(items) {
			this.local = items;

			chrome.storage.sync.get(null, function(items) {
				this.sync = items;

				cb();
			}.bind(this));
		}.bind(this));
	} else {
		/* Other storage mechanisms are already ready */
		cb();
	}
};

UnstableGameOptions.prototype.getStorage = function getStorage(name)
{
	if (this.storage) {
		return(this.storage);
	}

	try {
		/*
			Attempt to provide an alternate location for the storage when
			running in xulrunner
		*/
		var url	= "http://minego.net";
		var ios	= Components.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService);
		var ssm	= Components.classes["@mozilla.org/scriptsecuritymanager;1"]
					.getService(Components.interfaces.nsIScriptSecurityManager);
		var dsm	= Components.classes["@mozilla.org/dom/storagemanager;1"]
					.getService(Components.interfaces.nsIDOMStorageManager);

		var uri	= ios.newURI(url, "", null);
		var principal = ssm.getCodebasePrincipal(uri);
		var storage = dsm.getLocalStorageForPrincipal(principal, "");

		this.storage = storage;
	} catch (e) {
		this.storage = window.localStorage;
	}

	return(this.storage);
};

UnstableGameOptions.prototype.get = function get(name)
{
	var key		= name;
	var result	= null;
	var json	= null;

	if (typeof(chrome) !== "undefined" && chrome.storage) {
		/* Chrome storage is synced at load time */
		if ('undefined' != typeof(this.local[key])) {
			result = this.local[key];
		} else if ('undefined' != typeof(this.sync[key])) {
			result = this.sync[key];
		}
	} else {
		try {
			json = this.getStorage().getItem(name);
		} catch (e) {
			json = null;
		};
	}

	if (!result) {
		try {
			if (json) {
				result = JSON.parse(json);
			} else {
				result = null;
			}
		} catch(e) {
			result = null;
		}
	}

	if (result == null) {
		result = this.defaults[key];
	}

	return(result);
};

UnstableGameOptions.prototype.set = function set(name, value)
{
	var restore;

	if (typeof(chrome) !== "undefined" && chrome.storage) {
		var data = {};

		data[name] = value;

		if ('undefined' != typeof(this.defaults[name])) {
			chrome.storage.sync.set(data);
			this.sync[name] = value;
		} else {
			chrome.storage.local.set(data);
			this.local[name] = value;
		}
	} else {
		try {
			this.getStorage().setItem(name, JSON.stringify(value));
		} catch (e) {
		}
	}
};


