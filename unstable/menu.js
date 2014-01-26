function UnstableGameMenu(opts)
{
	opts = opts || {};

	this.debug = opts.debug || false;

	this.running = false;

	/* Initialize the various objects needed to show the game and the menus */
	this.levelPreview	= new LevelPreview();
	this.game			= new UnstableGame();

	this.showMenu(window.location.hash.substring(1));
	this.showSection('beta');

	var menu;
	var that = this;

	/* Create the main menu */
	if ((menu = document.getElementById('mainmenu'))) {
		menu.innerHTML = '';

		this.playbtn = this.addMenuItem(menu, 'Play',
				function(a) { that.loadLevel();				});
		this.addMenuItem(menu, 'Choose a Level',
				function() { that.showSection('level');		});
		this.addMenuItem(menu, 'Playground',
				function() { that.loadLevel(-1);			});
		this.addMenuItem(menu, 'Options',
				function() { that.showSection('options');	});
		this.addMenuItem(menu, 'About',
				function() { that.showSection('about');		});
		if (false)
		this.addMenuItem(menu, 'Help',
				function() { that.showSection('help');		});
	}

	/* Fill out the static game menu */
	if ((menu = document.getElementById('gamemenu'))) {
		menu.innerHTML = '';

		this.addMenuItem(menu, 'Menu',
				function() { that.showMenu();				});
	}
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

UnstableGameMenu.prototype.showSection = function showSection(name)
{
	var sections	= document.getElementsByClassName('content');
	var section		= document.getElementById(name);

	for (var i = 0, s; s = sections[i]; i++) {
		s.style.display = 'none';
	}

	if (section) {
		section.style.display = 'block';
	}
};

UnstableGameMenu.prototype.loadLevel = function loadLevel(level)
{
	var btn;

	if ((btn = document.getElementById('playbtn'))) {
		btn.innerHTML = '';
		btn.appendChild(document.createTextNode('Resume'));
	}

	document.getElementById('menu').style.display = 'none';
	document.getElementById('game').style.display = 'block';

	this.hide();

	if (!isNaN(level)) {
		/* Resume the level that is already running, or start the first level */
		this.game.loadLevel(level);
	}

	/* Replace the name of the button */
	if (this.playbtn) {
		this.playbtn.innerHTML = '';
		this.playbtn.appendChild(document.createTextNode('Resume'));

		delete this.playbtn;
	}

	this.game.show();
};

/* Hide the game and show the menu again */
UnstableGameMenu.prototype.showMenu = function showMenu(section)
{
	document.getElementById('menu').style.display = 'block';
	document.getElementById('game').style.display = 'none';

	// this.showSection(section);

	/* Update the level list based on the player's progress */
	this.levelPreview.getMenu(document.getElementById('level'), this.loadLevel.bind(this));

	this.game.hide();
	this.show();
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
			position:	new V(0, 0),
			radius:		50,
			density:	0.09,
			color:		'#666'
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
	]);

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


/*
	Packaged chrome apps can not run inline javascript in the html document
	so we need to initialize here instead of in the html.
*/
window.addEventListener('load', function() {
	var options	= new UnstableGameOptions();

	options.ready(function() {
		(new UnstableGameMenu());
	});
}, false);

