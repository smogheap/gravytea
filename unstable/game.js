// TODO	Ignore keyboard input while a popup is up

// TODO	Show a help dialog
//
//		This should be a large area of text that floats above the game (with a
//		transparent background) that describes how the game works in detail.
//
//		It should include pictures of things like the velocity node, as examples
//		for the user.
//
//		In the level editor this can show the extra keys as well. This should
//		use a regular san-serif font, not the handwriting font.

// TODO	Show a 60's batman style "Kaplow!" image at the location of a collision
//		and show a dialog with funny text.
//
//				You where doing well until everyone died
//				Think of the pixel children!
//				Hey, that planet was where I kept all my stuff!
//				Oh no, the planet's kerploding!
//				It's as if millions of voices cried out in terror and where suddenly silenced
//				I guess they don't need to worry about global warming any more
//				No one liked that planet anyway
//				Sucks to be you, you left your keys on that planet

// TODO	Implement body grouping?!?
//
//		The idea is to somehow allow the user to select a group of planets and
//		edit their layout and velocities relative to each other without the
//		influence of any other bodies.
//
//		Once the user is happy with that grouping he/she can then return to the
//		main level.

function UnstableGame(opts)
{
	opts = opts || {};

	this.running = false;

	this.solarsys	= new SolarSystem({
		showVelocity:	true,
		paused:			true,
		trajectory:		3 * 1000
	});

	this.speed = 1.0;
	// this.speed = 0.2;
}

UnstableGame.prototype.handleEvent = function handleEvent(event)
{
	switch (event.type) {
		case 'mousedown':
			if (!this.nextClickAction) {
				return(true);
			}

			var issun	= false;
			var action	= this.nextClickAction;

			this.solarsys.options.showVelocity = true;
			delete this.nextClickAction;

			switch (action) {
				case 'Add Sun':
					issun = true;
					/* fallthrough */

				case 'Add Planet':
					var bodies = this.solarsys.getBodies();

					bodies.push({
						position:	new V(this.ctx.getMouse()),
						velocity:	new V(0, 0),
						radius:		issun ? 50 : 15,
						density:	issun ? 0.09 : 0.01,
						sun:		issun
					});

					this.solarsys.setBodies(bodies);
					break;

				case 'Remove':
					var bodies	= this.solarsys.getBodies();
					var mouse	= this.ctx.getMouse();

					for (var i = 0, b; b = bodies[i]; i++) {
						if (b.inside(this.ctx, mouse)) {
							bodies.splice(i, 1);
							break;
						}
					}

					this.solarsys.setBodies(bodies);
					break;

				case 'Edit':
					var bodies	= this.solarsys.getBodies();
					var mouse	= this.ctx.getMouse();

					for (var i = 0, b; b = bodies[i]; i++) {
						if (b.inside(this.ctx, mouse)) {
							this.edittingBody = b;
							break;
						}
					}
					break;
			}

			this.loadLevelButtons();
			break;

		case 'DOMMouseScroll':
		case 'mousewheel':
			var delta = event.wheelDelta ? event.wheelDelta / 40 : event.detail ? -event.detail : 0;

			if (this.level < 0) {
				var bodies	= this.solarsys.getBodies();
				var mouse	= this.ctx.getMouse();

				for (var i = 0, b; b = bodies[i]; i++) {
					if (b.inside(this.ctx, mouse)) {
						b.setRadius(b.radius + delta);

						this.solarsys.setBodies(bodies);
						this.ctx.setZoomable(-1);
						break;
					}
				}
			}

			return event.preventDefault() && false;

		case 'keydown':
			if (this.popupdiv) {
				return(true);
			}

			switch (event.keyCode) {
				case 32: /* space	*/
					this.go();
					return event.preventDefault() && false;

				case 13: /* Enter */
					var bodies = this.solarsys.getBodies();

					alert(JSON.stringify(bodies));
					return event.preventDefault() && false;

				case 187: /* plus sign */
					if (this.level < 0) {
						var bodies = this.solarsys.getBodies();

						bodies.push({
							position:	new V(this.ctx.getMouse()),
							velocity:	new V(0, 0),
							radius:		15
						});

						this.solarsys.setBodies(bodies);
					}
					return event.preventDefault() && false;

				case 189: /* minus sign */
					if (this.level < 0) {
						var bodies	= this.solarsys.getBodies();
						var mouse	= this.ctx.getMouse();

						for (var i = 0, b; b = bodies[i]; i++) {
							if (b.inside(this.ctx, mouse)) {
								bodies.splice(i, 1);
								break;
							}
						}

						this.solarsys.setBodies(bodies);
					}
					return event.preventDefault() && false;

				case 33: /* Page Up */
					this.ctx.zoom(1, true);
					break;
				case 34: /* Page Down */
					this.ctx.zoom(-1, true);
					break;

				default:
					console.log(event.keyCode);
					break;
			}
			break;

		case 'mousemove':
			if (!this.solarsys.options.paused) {
				/* Only allow selecting an object when the game isn't going */
				return(true);
			}

			var mouse	= this.ctx.getMouse();

			for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
				delete b.selected;
				delete b.velocity.selected;
			}

			for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
				if (!b.velocity.locked &&
					b.inside(this.ctx, mouse, true, 3)
				) {
					b.velocity.selected = true;
					return(true);
				}
			}

			for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
				if (!b.position.locked &&
					b.inside(this.ctx, mouse, false, 7)
				) {
					b.selected = true;
					return(true);
				}
			}

			break;
	}

	return true;
};

UnstableGame.prototype.popup = function popup(message, actions, cb, className)
{
	var scrim	= document.createElement('div');
	var popup	= document.createElement('div');

	scrim.className = 'scrim';
	popup.className = 'popup';
	if(className) {
		popup.className += ' ' + className;
	}

	document.body.appendChild(scrim);
	var ignoreEvent = function(event)
	{
		return event.preventDefault() && false;
	};

	scrim.addEventListener('click',		ignoreEvent);
	scrim.addEventListener('mousedown',	ignoreEvent);
	scrim.addEventListener('mouseup',	ignoreEvent);

	var p = document.createElement('p');
	p.appendChild(document.createTextNode(message));
	popup.appendChild(p);
	popup.appendChild(document.createElement('br'));

	document.body.appendChild(popup);

	this.popupdiv = popup;

	if (!actions || !actions.length) {
		actions = 'Okay';
	}

	for (var i = 0; i < actions.length; i++) {
		var a = document.createElement('a');

		a.href = '#';
		a.appendChild(document.createTextNode(actions[i]));

		if (i > 0) {
			popup.appendChild(document.createTextNode('  |  '));
		}

		(function(action) {
			a.addEventListener('click', function(e)
			{
				document.body.removeChild(scrim);
				document.body.removeChild(popup);

				delete this.popupdiv;
				cb(action);
			}.bind(this));
		}.bind(this))(actions[i]);

		popup.appendChild(a);
	}
};

// TODO	Do not allow selecting a level that the player hasn't unlocked
UnstableGame.prototype.loadLevelMenu = function loadLevelMenu(div, cb)
{
	var titles	= [
		'Get moving',
		'Getting up to speed',
		'Let\'s have a race',
		'On your own',
		'A bit of a challenge'
	];

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	for (var i = 0, title; title = titles[i]; i++) {
		var a = document.createElement('a');
		var t = document.createTextNode(title);

		(function(level) {
			a.href = '#';
			a.addEventListener('click', function(e)
			{
				cb(level);

				return e.preventDefault() && false;
			});
		})(i + 1);

		a.appendChild(t);
		div.appendChild(a);

		div.appendChild(document.createElement('br'));
	}
};

UnstableGame.prototype.loadLevelButtons = function loadLevelButtons()
{
	var div = document.getElementById('gamebuttons');

	var addbtn = function(name, cb) {
		var a = document.createElement('a');

		a.appendChild(document.createTextNode(name));
		a.href = '#';
		a.addEventListener('click', function(e) {
			cb();
			return e.preventDefault() && false;
		}.bind(this));
		div.appendChild(a);
	};

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	if (this.edittingBody) {
		var b = this.edittingBody;

		div.appendChild(document.createTextNode('Size: '));

		addbtn('\u2191', function() {
			b.setRadius(b.radius + 1);
		}.bind(this));

		addbtn('\u2193', function() {
			b.setRadius(b.radius - 1);
		}.bind(this));


		div.appendChild(document.createTextNode('  |  Goal: '));

		addbtn('\u2191', function() {
			b.goal++;
		}.bind(this));

		addbtn('\u2193', function() {
			if (b.goal > 0) b.goal--;
		}.bind(this));

		div.appendChild(document.createTextNode('  |  '));
		addbtn('Done', function() {
			this.solarsys.options.showVelocity = true;

			delete this.edittingBody;
			this.loadLevelButtons();
		}.bind(this));

		return;
	}

	if (this.nextClickAction) {
		var msg;

		switch (this.nextClickAction) {
			case 'Add Sun':
				msg = 'Select position for new sun';
				break;

			case 'Add Planet':
				msg = 'Select position for new planet';
				break;

			case 'Remove':
				msg = 'Select a planet or sun to remove';
				this.solarsys.options.showVelocity = false;
				break;

			case 'Edit':
				msg = 'Select a planet or sun to edit';
				this.solarsys.options.showVelocity = false;
				break;
		}

		div.appendChild(document.createTextNode(msg));
		return;
	}


	/* These buttons are only used for the editor */
	if (this.level < 0 && this.solarsys.options.paused) {
		var actions = [
			'Add Sun',
			'Add Planet',
			'Remove',
			'Edit'
		];

		for (var i = 0, action; action = actions[i]; i++) {
			(function(action, index) {
				addbtn(action, function() {
					this.nextClickAction = action;
					this.loadLevelButtons();
				}.bind(this));
			}.bind(this))(action, i);

			div.appendChild(document.createTextNode('  |  '));
		}
	}

	if (this.solarsys.options.paused) {
		addbtn('> Play',	this.go.bind(this));
	} else {
		addbtn('<< Rewind',	this.go.bind(this));
	}
};

/* Return a list of bodies for the specified level */
UnstableGame.prototype.loadLevel = function loadLevel(level)
{
	var bodies;
	var hintDiv;
	var hint	= [];

	/* Make sure the planets aren't moving when the new level is loaded */
	this.stop();

	/*
		When creating a body the position or velocity may be 'locked' by passing
		a 3rd argument of true. For example, new V(0, 0, true)

		This means the user will not be able to edit that vector.
	*/
	this.level = level;
	switch (level) {
		case -1:
			/*
				Level editor mode, extra keystrokes are enabled allowing adding
				or removing of bodies and allowing changing the size of bodies.
			*/
/*
			hint = [
				'Press + to create a planet under the mouse',
				'Press - to remove the planet under the mouse',
				'Scroll up/down to resize the planet under the mouse',
				'Press enter to dump level data'
			];
*/
			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0),
					velocity:	new V(0, 0),
					radius:		50,
					sun:		true
				}
			];

			break;

		default:
		case 1:
			hint = [
				'That planet looks like it is going to crash into the sun!',
				'That could be bad.',
				'Maybe you should move it a bit further away...'
			];

			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					sun:		true,
					density:	0.09
				},

				/* A planet */
				{
					position:	new V(140, 0),
					velocity:	new V(0, 7, true),
					radius:		15,

					goal:		3
				}
			];
			break;

		case 2:
			hint = [
				'Oh look, another planet about to crash into the sun!',
				'This time try making it go a bit faster.',
				'Drag the velocity indicator to change the speed of the planet.'
			];

			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					sun:		true,
					density:	0.09
				},

				/* A planet */
				{
					position:	new V(140, 0, true),
					velocity:	new V(0, 7),
					radius:		15,

					goal:		3
				}
			];
			break;

		case 3:
			hint = [
				'These planets are identical, except for their position. The',
				'closer a planet is to the sun the faster it needs to go to',
				'get a stable orbit.'
			];

			bodies = [
				/* A Sun */
				{
					position:	new V(-250, 0, true),
					velocity:	new V(0, 0, true),
					radius:		70,
					sun:		true,
					density:	0.09
				},

				{
					position:	new V(-50, 0, true),
					velocity:	new V(0, 7),
					radius:		15,

					goal:		5
				},

				{
					position:	new V(50, 0, true),
					velocity:	new V(0, 7),
					radius:		15,

					goal:		4
				},

				{
					position:	new V(150, 0, true),
					velocity:	new V(0, 7),
					radius:		15,

					goal:		3
				},

				{
					position:	new V(250, 0, true),
					velocity:	new V(0, 7),
					radius:		15,

					goal:		2
				}
			];
			break;

		case 4:
			hint = [
				'Now you are on your own.',
				'Good luck!'
			];

			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					sun:		true,
					density:	0.15
				},

				/* A bit larger rocky planet */
				{
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		25,

					goal:		9
				},

				/* Another rocky planet */
				{
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15,

					goal:		7
				}
			];
			break;

		case 5:
			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					sun:		true,
					density:	0.15
				},

				{
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		35,

					goal:		20
				},

				{
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15,

					goal:		5
				},

				{
					position:	new V(-350, -300),
					velocity:	new V(2, 2),
					radius:		20,

					goal:		4
				}
			];
			break;

		// TODO	Add more levels
	}

	/*
		The velocities of the bodies are scaled down to account for showing them
		as larger than they are. This should allow finer control.
	*/
	for (var i = 0, b; b = bodies[i]; i++) {
		b.velocityScale = 0.5;
	}

	if ((hintDiv = document.getElementById('hint'))) {
		hintDiv.innerHTML = hint.join('<br/>');
	}


	/* Assign a randomish color to any body that doesn't have one */
	for (var i = 0, b; b = bodies[i]; i++) {
		if (!b.color) {
			b.color = Math.pow(level, i);
		}
	}

	this.solarsys.setBodies(bodies);
	this.loadLevelButtons();
};

/* Let the solarsystem the user has built/fixed run */
UnstableGame.prototype.go = function go()
{
	if (!this.solarsys.options.paused) {
		this.stop();
		return;
	}

	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		delete b.selected;
		delete b.velocity.selected;
	}

	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		/* Save the state as the user had created it */
		b.save();
	}

	this.solarsys.options.paused		= false;
	this.solarsys.options.showVelocity	= false;

	this.loadLevelButtons();
};

UnstableGame.prototype.stop = function stop()
{
	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		/* Restore the state the user had */
		b.restore();
	}

	/* Reset the canvas */
	if (this.ctx) {
		this.ctx.setTransform(1, 0, 0, 1,
			window.innerWidth  / 2,
			window.innerHeight / 2);
	}

	this.solarsys.options.paused		= true;
	this.solarsys.options.showVelocity	= true;

	this.loadLevelButtons();
};

UnstableGame.prototype.show = function showUnstableGame()
{
	var fresh	= false;

	this.running = true;

	if (!(this.canvas)) {
		fresh = true;

		this.canvas	= document.createElement('canvas');
		this.ctx	= this.canvas.getContext('2d');

		document.body.appendChild(this.canvas);
	}

	var canvas	= this.canvas;
	var ctx		= this.ctx;
	var w		= -1;
	var h		= -1;

	if (isNaN(this.level)) {
		this.loadLevel(1);
	}

	canvas.addEventListener('DOMMouseScroll',	this, false);
	canvas.addEventListener('mousedown',		this, false);
	canvas.addEventListener('mousewheel',		this, false);
	canvas.addEventListener('mousemove',		this, false);
	window.addEventListener('keydown',			this, false);

	var resizeCanvas = function()
	{
		if (w != window.innerWidth || h != window.innerHeight) {
			w = window.innerWidth;
			h = window.innerHeight;

			canvas.setAttribute('width',  w);
			canvas.setAttribute('height', h);

			/* Restore the initial saved state, and save it again */
			ctx.restore();
			ctx.save();
			ctx.translate(w / 2, h / 2);
		}
	};

	if (fresh) {
		ctx.save();
		makeBodiesDraggable(canvas, ctx, this.solarsys);
		makeCanvasZoomable(canvas, ctx);
		resizeCanvas();
	}

	var render = function render(time)
	{
		if (!this.running) {
			if (this.canvas) {
				document.body.removeChild(this.canvas);
			}

			delete this.ctx;
			delete this.canvas;
			return;
		}

		requestAnimationFrame(render.bind(this));
		resizeCanvas();

		/* Clear the canvas */
		var a = ctx.transformedPoint(0, 0);
		var b = ctx.transformedPoint(w, h);
		ctx.clearRect(a.x, a.y, b.x - a.x, b.y - a.y);

		/* Advance the bodies to the current time */
		var before = this.solarsys.getCenter();
		if (this.solarsys.advance(time * this.speed)) {
			/* Adjust the position of the canvas to keep the suns fixed */
			var after = this.solarsys.getCenter();
			ctx.translate(-(after.x - before.x), -(after.y - before.y));

			/* Render the bodies */
			ctx.save();
			this.solarsys.render(ctx);
			ctx.restore();
		}

		/* Check for end of level events... */
		if (this.solarsys.options.paused) {
			return;
		}

		/* Did anything crash? */
		for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
			if (b.collision) {
				this.solarsys.options.paused = true;

				this.popup("BOOM! You crashed!", [ "Retry", "Reset" ], function(action) {
					switch (action) {
						case "Reset":
							this.hide();
							this.loadLevel(this.level);
							this.show();
							break;

						default:
							this.stop();
							break;
					}
				}.bind(this), "fail");
				return;
			}
		}

		if (this.level < 0) {
			return;
		}

		/* Has the user completed the level? */
		for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
			if (b.completed < b.goal) {
				return;
			}
		}

		this.solarsys.options.paused = true;
		this.popup("Success!", [ "Next Level", "Replay" ], function(action) {
			var l;

			switch (action) {
				default:
				case "Next Level":
					l = this.level + 1;
					break;

				case "Replay":
					l = this.level;
					break;
			}

			this.hide();
			this.loadLevel(l);
			this.show();
		}.bind(this), "success");
	};
	requestAnimationFrame(render.bind(this));
};

UnstableGame.prototype.hide = function hideUnstableGame(level)
{
	if (this.running) {
		this.canvas.removeEventListener('DOMMouseScroll',	this, false);
		this.canvas.removeEventListener('mousedown',		this, false);
		this.canvas.removeEventListener('mousewheel',		this, false);
		this.canvas.removeEventListener('mousemove',		this, false);
		window.removeEventListener('keydown',				this, false);

		this.running = false;
	}
};

