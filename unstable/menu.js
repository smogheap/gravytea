function UnstableGameMenu(options)
{
	/* Use this.options to access saved user data */
	this.options		= options;
	this.running		= false;

	/* Initialize the various objects needed to show the game and the menus */
	this.levelPreview	= new LevelPreview(options, this);
	this.game			= new UnstableGame(options, this);

	var div;
	var that = this;

	if (window.innerWidth <= 320 || window.innerHeight <= 320) {
		document.body.classList.add('small');
		this.small = true;

		this.showMenu();
	} else {
		this.small = false;
		this.showMenu('beta');
	}

	/* Create the main menu */
	if (!this.small && (div = document.getElementById('mainmenu'))) {
		div.innerHTML = '';

		this.playbtn = this.addMenuItem(div, 'Play',
				function(a) { that.loadLevel();				});
		this.addMenuItem(div, 'Choose a Level',
				function() { that.showSection('level');		});
		this.addMenuItem(div, 'Playground',
				function() { that.showSection('playground');});
		this.addMenuItem(div, 'Options',
				function() { that.showSection('options');	});
		this.addMenuItem(div, 'About',
				function() { that.showSection('about');		});
		if (false)
		this.addMenuItem(div, 'Help',
				function() { that.showSection('help');		});
	}

	/* Fill out the static game menu */
	if ((div = document.getElementById('gamemenu'))) {
		div.innerHTML = '';

		// TODO	Replace with icons
		this.addMenuItem(div, 'Menu',
				function() { that.showMenu();				});
	}

	/* Allow tapping on the logo to show the menu as well */
	if (this.small && (div = document.getElementById('menu')) &&
		(div = div.getElementsByClassName('title')[0])
	) {
		div.addEventListener('click', function() {
			this.showSection();
		}.bind(this));
	}

	/* Let the options class render the options page */
	this.options.setup(this);
}

UnstableGameMenu.prototype.addMenuItem = function addMenuItem(menudiv, name, cb)
{
	var a = document.createElement('a');

	a.appendChild(document.createTextNode(name));
	a.addEventListener('click', function(e) {
		cb(a);
		return e.preventDefault() && false;
	}.bind(this));

	if (menudiv.getElementsByTagName('a').length > 0) {
		/* Add a seperator */
		menudiv.appendChild(document.createTextNode('  |  '));
	}

	menudiv.appendChild(a);
	return(a);
};

UnstableGameMenu.prototype.showSection = function showSection(name, noMenu)
{
	var sections	= document.getElementsByClassName('content');
	var section		= document.getElementById(name);

	for (var i = 0, s; s = sections[i]; i++) {
		s.style.display = 'none';
	}

	if (section) {
		section.style.display = 'block';
		this.currentSection = name;
	} else {
		this.currentSection = null;
	}

	/*
		On small screens the main menu gets displayed as a dialog instead of on
		the top of the screen do to a lack of room.
	*/
	if (!noMenu && this.small) {
		var menu = document.getElementById('mainmenu');
		menu.innerHTML = '';

		if (this.currentSection) {
			// TODO	Perhaps this should be moved somewhere else on screen?
			this.addMenuItem(menu, '<< Back',
					function() { this.showSection(); }.bind(this));
			return;
		}

		this.askUser(null, [
			this.loadedLevel ? 'Resume' : 'Play',
			'Choose a Level',
			// 'Playground',
			'Options',
			'About',

			'Early Access Info'
		], function(action) {
			switch (action) {
				case 'Resume':
				case 'Play':				this.loadLevel();				break;
				case 'Choose a Level':		this.showSection('level');		break;
				case 'Playground':			this.showSection('playground');	break;
				case 'Options':				this.showSection('options');	break;
				case 'About':				this.showSection('about');		break;
				case 'Help':				this.showSection('help');		break;
				case 'Early Access Info':	this.showSection('beta');		break;
			}
		}.bind(this), 'mainmenu');
	}
};

UnstableGameMenu.prototype.loadLevel = function loadLevel(num, level, playground)
{
	var btn;

	document.getElementById('menu').style.display = 'none';
	document.getElementById('game').style.display = 'block';

	this.loadedLevel = true;

	this.hide();

	if (!isNaN(num)) {
		this.game.loadLevel(num, level);
	}

	/* Replace the name of the button */
	if (this.playbtn) {
		this.playbtn.innerHTML = '';
		this.playbtn.appendChild(document.createTextNode('Resume'));

		/* This only needs to be done once */
		delete this.playbtn;
	}

	this.game.show();
};

/* Hide the game and show the menu again */
UnstableGameMenu.prototype.showMenu = function showMenu(section)
{
	var was = section || this.currentSection;

	document.getElementById('menu').style.display = 'block';
	document.getElementById('game').style.display = 'none';

	this.hideDialog();

	this.game.hide();
	this.showSection('loading', true);

	var sections = 2;

	var readyfunc = function() {
		if (--sections === 0) {
			if (was != 'loading') {
				this.showSection(was);
			} else {
				this.showSection(null);
			}
			this.show();
		}
	};

	/* Update the level list based on the player's progress */
	this.levelPreview.getMenu(document.getElementById('level'), false,
			this.loadLevel.bind(this), readyfunc.bind(this));

	this.loadedLevels = true;

	this.levelPreview.getMenu(document.getElementById('playground'), true,
			this.loadLevel.bind(this), readyfunc.bind(this));
};

UnstableGameMenu.prototype.show = function show()
{
	this.running = true;

	var solarsys	= new SolarSystem({
		showVelocity:	false,
		paused:			this.debug,
		// trajectory:		this.debug ? 3 * 1000 : 1 * 1000
		trajectory:		300
	});
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;

	solarsys.setBodies([
		/* A Sun */
		new Body({
			type:		'sun',
			position:	new V(0, 0),
			radius:		50,
			density:	0.09,
			color:		'#ccc'
		}),

		new Body({
			position:	new V(-100, 100),
			velocity:	new V(12, 12),
			radius:		10,
			color:		'#666'
		}),

		new Body({
			position:	new V(240, 0),
			velocity:	new V(0, 15),
			radius:		15,
			color:		'#666'
		}),

		new Body({
			position:	new V(0, 400),
			velocity:	new V(11, 0),
			radius:		35,
			color:		'#666'
		}),

		new Body({
			position:	new V(0, 320),
			velocity:	new V(16, 0),
			radius:		2,
			color:		'#666'
		})
	], true);

	document.body.appendChild(canvas);

	var resizeCanvas = function()
	{
		if (w != window.innerWidth || h != window.innerHeight) {
			w = window.innerWidth;
			h = window.innerHeight;

			canvas.setAttribute('width',  w);
			canvas.setAttribute('height', h);
		}
	};

	ctx.save();
	resizeCanvas();

	var render = function render(time)
	{
		if (!this.running) {
			document.body.removeChild(canvas);
			return;
		}

		requestAnimationFrame(render.bind(this));
		resizeCanvas();

		ctx.save();

		/* Clear the canvas */
		ctx.clearRect(0, 0, w, h);

		/* Advance the bodies to the current time */
		if (solarsys.advance(time)) {
			var p = solarsys.bodies[0].getPosition();

			if (!this.debug) {
				/*
					Keep the sun in the bottom right corner of the screen so there
					is room for the menu top left.
				*/
				ctx.translate(w - p.x, h - p.y);
			} else {
				ctx.translate((w / 2) - p.x, (h / 2) - p.y);
			}

			/* Render the bodies */
			solarsys.render(ctx);
		}

		ctx.restore();
	};
	requestAnimationFrame(render.bind(this));
};

UnstableGameMenu.prototype.hide = function hide()
{
	this.running = false;
};

UnstableGameMenu.prototype.askUser = function askUser(message, actions, cb, className, modal, title, closeAction)
{
	var that	= this;
	var content	= document.createElement('div');
	var p		= document.createElement('p');
	var defcb	= null;

	if (title) {
		var d = document.createElement('p');

		d.appendChild(document.createTextNode(title));
		d.className = 'title';
		content.appendChild(d);
	}

	if (closeAction) {
		var a = document.createElement('a');

		a.className = 'close';
		a.appendChild(document.createTextNode(closeAction));

		a.addEventListener('click', function(e) {
			that.hideDialog();
			if (cb) {
				cb(closeAction);
			}
		});
		content.appendChild(a);
	}

	if (message) {
		p.appendChild(document.createTextNode(message));
		content.appendChild(p);
		content.appendChild(document.createElement('br'));
	}

	if (!actions || !actions.length) {
		actions = [ 'Okay' ];
	}

	for (var i = 0; i < actions.length; i++) {
		var a = document.createElement('a');

		a.appendChild(document.createTextNode(actions[i]));

		if (i > 0) {
			if (!this.small) {
				content.appendChild(document.createTextNode('  |  '));
			} else {
				content.appendChild(document.createElement('br'));
				content.appendChild(document.createElement('br'));
			}
		}

		(function(action) {
			var f;

			a.addEventListener('click', f = function(e)
			{
				that.hideDialog();

				if (cb) cb(action);
			});

			defcb = defcb || f;
		})(actions[i]);

		content.appendChild(a);
	}

	var cls = 'askuser';

	if (className) {
		cls += ' ' + className;
	}

	this.showDialog(content, arguments.length >= 5 ? modal : true, cls);

	/* Keep track of the first action, so it can be called in other ways */
	this.defaultDialogCB = defcb;
};

UnstableGameMenu.prototype.showDialog = function showDialog(content, modal, className)
{
	var scrim	= modal ? document.createElement('div') : null;
	var popup	= document.createElement('div');

	this.hideDialog();

	popup.className = 'popup';
	if (className) {
		popup.className += ' ' + className;
	}

	if (scrim) {
		var ignoreEvent = function(event)
		{
			return event.preventDefault() && false;
		};

		document.body.appendChild(scrim);

		scrim.className = 'scrim';

		scrim.addEventListener('click',		ignoreEvent);
		scrim.addEventListener('mousedown',	ignoreEvent);
		scrim.addEventListener('mouseup',	ignoreEvent);

		this.scrimShowing = true;
	} else {
		delete this.scrimShowing;
	}

	switch (typeof content) {
		case 'object':
			/* Assume it is a DOM element */
			popup.appendChild(content);
			break;

		case 'string':
			popup.appendChild(document.CreateTextNode(content));
			break;
	}

	this.closePopup = function() {
		if (scrim) {
			scrim.removeEventListener('click',		ignoreEvent);
			scrim.removeEventListener('mousedown',	ignoreEvent);
			scrim.removeEventListener('mouseup',	ignoreEvent);

			document.body.removeChild(scrim);
		}

		document.body.removeChild(popup);

		delete this.scrimShowing;
		delete this.closePopup;
	};

	document.body.appendChild(popup);
};

UnstableGameMenu.prototype.hideDialog = function hideDialog(doDefaultAction)
{
	if (doDefaultAction) {
		if (!this.defaultDialogCB) {
			return(false);
		}

		this.defaultDialogCB();
	}
	delete this.defaultDialogCB;

	if (this.closePopup) {
		this.closePopup();
	}
	return(true);
};

/* Return true if a modal popup is visible */
UnstableGameMenu.prototype.checkScrim = function checkScrim()
{
	return(this.scrimShowing || false);
};

/*
	Packaged chrome apps can not run inline javascript in the html document
	so we need to initialize here instead of in the html.
*/
window.addEventListener('load', function() {
	/* Prevent 300ms delay on click events on mobile devices */
	FastClick.attach(document.body);

	var options	= new UnstableGameOptions(this);

	options.ready(function() {
		(new UnstableGameMenu(options));
	});
}, false);
