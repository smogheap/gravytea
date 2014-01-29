function UnstableGameOptions()
{
	this.defaults = {
		/* The highest level that the user has unlocked */
		currentLevel:		0,

		/* The next ID to use when saving playground levels */
		nextPlaygroundID:	0,

		fullscreen:			false
	};
};

UnstableGameOptions.prototype.setup = function setup(menu)
{
	this.menu = menu;

	// TODO	Add options for mapping inputs with keyboard and/or gamepads
	// TODO	Allow reading options from cli args when running in xulrunner

	/* Determine if fullscreen is supported */
	var f = document.getElementById('fullscreen');

	this.addFullscreenOption();
	document.getElementById('options').appendChild(document.createElement('br'));

	/* Add option to reset progress */
	var div = document.createElement('div');
	var a	= document.createElement('a');

	a.addEventListener('click', function() {
		menu.askUser('Are you sure?', [ 'Yes', 'No' ], function(action) {
			if (action != 'Yes') return;

			this.set('currentLevel', 0);
		}.bind(this));
	}.bind(this));

	a.appendChild(document.createTextNode('Reset Progress'));
	div.appendChild(a);

	document.getElementById('options').appendChild(div);

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

UnstableGameOptions.prototype.getStorage = function getStorage()
{
	if (this.storage) {
		return(this.storage);
	}

	var testStorage = function(storage, name) {
		if (!storage) {
			return(null);
		}

		var date = new Date().toString();

		try {
			storage.setItem('test', date);
			if (date != storage.getItem('test')) {
				return(null);
			}
		} catch (e) {
			return(null);
		}

		if (storage && name) {
			try {
				dump('Using storage: ' + name + '\n');
			} catch (e) {
				console.log('Using storage: ' + name);
			}
		}

		return(storage);
	};

	if (window.globalStorage) {
		this.storage = this.storage || testStorage(globalStorage['minego.net'],
							'minego.net global storage');
		this.storage = this.storage || testStorage(globalStorage[location.hostname],
							'global storage for location');
	}

	/*
		Any attempt to access window.localStorage causes problems in xulrunner
		so this try block is needed.
	*/
	try {
		this.storage = this.storage || testStorage(window.localStorage, 'local storage');
	} catch (e) {
		this.storage = null;
	}

	if (!this.storage) {
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

			this.storage = testStorage(storage, 'xulrunner work around');
		} catch (e) {
		}
	}

	if (!this.storage) {
		try {
			dump('Could not find working storage\n');
		} catch (e) {
			console.log('Could not find working storage');
		}
	}
	return(this.storage);
};

UnstableGameOptions.prototype.get = function get(name)
{
	var key		= name;
	var result	= null;
	var json	= null;

	if (name == 'currentLevel' && window.location.hash == '#cheater') {
		return(99999);
	}

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

	if (name == 'currentLevel' && window.location.hash == '#cheater') {
		/* Don't save the current level if in cheater mode */
		return;
	}

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


