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

function UnstableGame(options)
{
	/* Use this.options to access saved user data */
	this.options	= options;
	this.running	= false;

	this.solarsys	= new SolarSystem({
		showVelocity:	true,
		paused:			true,
		trajectory:		3 * 1000
	});

	this.speed = 1.0;
	// this.speed = 0.2;
}

UnstableGame.prototype.findBody = function findBody(point)
{
	var bodies	= this.solarsys.getBodies();

	point		= point || this.ctx.getMouse();

	for (var i = 0, b; b = bodies[i]; i++) {
		if (b.inside(this.ctx, point)) {
			return(b);
		}
	}

	return(null);
};

UnstableGame.prototype.selectBody = function selectBody(body)
{
	if (this.selectedBody) {
		this.selectedBody.selected = false;
	}

	this.selectedBody = body;

	if (this.selectedBody) {
		this.selectedBody.selected = true;
	}
};

UnstableGame.prototype.handleEvent = function handleEvent(event)
{
	switch (event.type) {
		case 'click':
			if (!this.nextClickAction) {
				if (this.level < 0) {
					this.selectBody(this.findBody());
					this.loadLevelButtons();
				}

				return(true);
			}

			var issun	= false;
			var action	= this.nextClickAction;

			this.solarsys.options.showVelocity = true;
			delete this.nextClickAction;
			this.canvas.classList.remove('mouse-crosshair');

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
						sun:		issun,
						goal:		issun ? 0 : 3
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
					this.selectBody(this.findBody());
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
				delete b.velocity.selected;

				if (b !== this.selectedBody) {
					delete b.selected;
				}
			}

			for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
				if (!b.velocity.locked &&
					b.inside(this.ctx, mouse, true, 3)
				) {
					b.velocity.selected = true;
					this.canvas.classList.add('mouse-grab');
					return(true);
				}
			}

			for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
				if (!b.position.locked &&
					b.inside(this.ctx, mouse, false, 7)
				) {
					b.selected = true;
					this.canvas.classList.add('mouse-grab');
					return(true);
				}
			}
			this.canvas.classList.remove('mouse-grab');

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

UnstableGame.prototype.loadLevelButtons = function loadLevelButtons()
{
	var div = document.getElementById('gamebuttons');

	var addbtn = function(name, cb) {
		var a = document.createElement('a');

		a.appendChild(document.createTextNode(name));
		a.addEventListener('click', function(e) {
			cb();
			return e.preventDefault() && false;
		}.bind(this));
		div.appendChild(a);
	};

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	if (this.selectedBody) {
		var b = this.selectedBody;

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

			this.selectBody(null);
			this.loadLevelButtons();
		}.bind(this));

		return;
	}

	if (this.nextClickAction) {
		var msg;

		switch (this.nextClickAction) {
			case 'Add Sun':
				msg = 'Select a position for new sun';
				break;

			case 'Add Planet':
				msg = 'Select a position for new planet';
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

					this.canvas.classList.add('mouse-crosshair');
				}.bind(this));
			}.bind(this))(action, i);

			div.appendChild(document.createTextNode('  |  '));
		}

		addbtn('Save', function() {
			if (isNaN(this.playgroundID)) {
				this.playgroundID = this.options.get('nextPlaygroundID');

				this.options.set('nextPlaygroundID', this.playgroundID + 1);

				this.options.set('levelUser-' + this.playgroundID, {
					name:			(new Date()).toLocaleString(),
					bodies:			this.solarsys.getBodies(),
					userCreated:	true
				});

				this.popup('Saved', [ 'Okay' ], function(action) { });
			} else {
				this.popup('Could not save', [ 'Okay' ], function(action) { });
			}
		}.bind(this));
		div.appendChild(document.createTextNode('  |  '));
	}

	if (this.solarsys.options.paused) {
		addbtn('> Play',	this.go.bind(this));
	} else {
		addbtn('<< Rewind',	this.go.bind(this));
	}

	div.appendChild(document.createTextNode('  |  '));
	addbtn('Reset', this.reset.bind(this));
};

/* Return a list of bodies for the specified level */
UnstableGame.prototype.loadLevel = function loadLevel(num, levelData, hint)
{
	var bodies	= [];
	var title	= null;
	var hintDiv;

	/* Reset a few things */
	delete this.levelData;
	delete this.playgroundID;
	delete this.userCreated;

	/* Make sure the planets aren't moving when the new level is loaded */
	this.stop();

	/*
		When creating a body the position or velocity may be 'locked' by passing
		a 3rd argument of true. For example, new V(0, 0, true)

		This means the user will not be able to edit that vector.
	*/
	this.level = num;

	if (levelData) {
		this.levelData	= levelData;

		bodies	= levelData.bodies;
		title	= levelData.name;

		if (this.level < 0) {
			/* Save it in the same spot */
			this.playgroundID = level.index;
		}

		this.userCreated = levelData.userCreated;
	} else {
		if (UnstableLevels[num]) {
			bodies	= UnstableLevels[num].bodies;
			title	= UnstableLevels[num].name;

			if (!hint) {
				hint = UnstableLevels[num].hint;
			}
		}
	}

	if ((hintDiv = document.getElementById('hint'))) {
		hint = hint || [];

		if (title) {
			hint.unshift('<h3>' + title + '</h3>');
		}

		hintDiv.innerHTML = hint.join('<br/>');
	}


	/*
		Assign a number for the color of any body that doesn't have a color
		assigned already. The body class will apply a color from it's index
		based on this number.
	*/
	var newbodies = [];
	for (var i = 0, b; b = bodies[i]; i++) {
		if (!b.color) {
			b.color = Math.pow(num, i);
		}

		newbodies.push(new Body(b));
	}

	this.solarsys.setBodies(newbodies);
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
		var t;

		if (this.ctx.getTransform) {
			t = this.ctx.getTransform();
		} else {
			t = { a: 1, b: 0, c: 0, d: 1 };
		}

		this.ctx.setTransform(t.a, t.b, t.c, t.d,
			window.innerWidth  / 2,
			window.innerHeight / 2);
	}

	this.solarsys.options.paused		= true;
	this.solarsys.options.showVelocity	= true;

	/* Renable displaying the selected body */
	this.selectBody(this.selectedBody);
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
		this.loadLevel(this.options.get('currentLevel'));
	}

	canvas.addEventListener('DOMMouseScroll',	this, false);
	canvas.addEventListener('mousewheel',		this, false);
	canvas.addEventListener('click',			this, false);
	canvas.addEventListener('mousedown',		this, false);
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
							this.reset();
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
		var options = [ 'Replay' ];

		if (!this.userCreated) {
			options.unshift('Next Level');
		}

		this.popup("Success!", options, function(action) {
			var hint			= null;
			var currentLevel	= this.options.get('currentLevel');

			if (!this.userCreated && (this.level + 1 > currentLevel)) {
				/* Remember that the user is allowed to play the next level */
				this.options.set('currentLevel', this.level + 1);
			}

			switch (action) {
				default:
				case "Next Level":
					l = this.level + 1;
					break;

				case "Replay":
					this.reset();
					return;
			}

			this.hide();

			if (!UnstableLevels[l]) {
				l = -1;
				hint = [
					'You finished all the levels!',
					'Why don\'t you try to make your own now?'
				];
			}

			this.loadLevel(l, null, hint);
			this.show();
		}.bind(this), "success");
	};
	requestAnimationFrame(render.bind(this));
};

UnstableGame.prototype.hide = function hideUnstableGame(level)
{
	if (this.running) {
		this.canvas.removeEventListener('DOMMouseScroll',	this, false);
		this.canvas.removeEventListener('mousewheel',		this, false);
		this.canvas.removeEventListener('click',			this, false);
		this.canvas.removeEventListener('mousedown',		this, false);
		this.canvas.removeEventListener('mousemove',		this, false);
		window.removeEventListener('keydown',				this, false);

		this.running = false;
	}
};

UnstableGame.prototype.reset = function reset()
{
	this.hide();
	this.loadLevel(this.level, this.levelData);
	this.show();
};

