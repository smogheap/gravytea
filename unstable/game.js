// TODO	Implement body grouping?!?
//
//		The idea is to somehow allow the user to select a group of planets and
//		edit their layout and velocities relative to each other without the
//		influence of any other bodies.
//
//		Once the user is happy with that grouping he/she can then return to the
//		main level.

// TODO	Add support for time based levels (must be stable for at least x sec)

function UnstableGame(options, menu)
{
	/* Use this.menu to interact with the UI */
	this.menu		= menu;

	/* Use this.options to access saved user data */
	this.options	= options;

	this.running	= false;
	this.panTo		= null;
	this.keyboard	= { x: 0, y: 0 };

	this.solarsys	= new SolarSystem({
		paused:						true,
		showUI:						true,
		showVelocity:				true,
		showTrajectoryCollisions:	true,
		trajectory:					3000,
		textures:					true
	});

	this.speed = 1.0;
	// this.speed = 0.2;


	this.failureText = [
		"You were doing well... until everyone died.",
		"Think of the pixel children!",
		"Hey, that planet was where I kept all my stuff!",
		"Oh no, the planet's kerploding!",
		"It's as if millions of voices cried out in terror and were suddenly silenced.",
		"I guess they don't need to worry about global warming any more.",
		"No one liked that planet anyway.",
		"Sucks to be you, you left your keys on that planet.",
		"You may want to try that again.",
		"Ouch!",
		"Perhaps you subconsciously wanted to destroy everything.",
		"Everybody's dead, Dave.",
		"Oops.",
		"I dreamt that you screwed up.  ...Oh, wait.",
		"Well that's just great.  Those aliens owed me five bucks.",
		"They deserved it.",
		"What?  Your planet blew up?  Oh, boo hoo.",
		"Some men just want to watch the worlds burn.",
		"They're united!  They're one!  ...With death.",
		"Fatality!",
		"You win again, gravity!",
		"Revenge!",
		"You are the destroyer of worlds.",
		"Well this is a fine mess you've gotten us into.",
		"Good.  That planet was full of teenagers.",
		"I bet they didn't see that coming!",
		"Surprise!  Dead.",
		"Why don't you pick on planets your own size?",
		"Game Over.",
		"Behold the power of G's.",
		"And they were such attractive celestial bodies, too.",
		"Too bad!",
		"That planet just cut me off!",
		"What comes around goes around (and bangs into stuff)."
	];
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

		if (this.propertiesDialog) {
			this.menu.hideDialog();
			delete this.propertiesDialog;
		}
	}

	this.selectedBody = body;

	if (this.selectedBody) {
		this.selectedBody.selected = true;

		if (this.level < 0) {
			/*
				Show a dialog allowing the user to edit the properties of this
				body.

				The first callback is hit when a value is changed by the dialog
				and the second to close the dialog.
			*/
			this.propertiesDialog = this.selectedBody.getPropertiesDialog(
				function() {
					/*
						Reset the bodies to ensure that correct textures are
						changed for anything that changed it's type.

						This will also call resetTrajectories();
					*/
					this.solarsys.setBodies(this.solarsys.getBodies());
				}.bind(this),
				function(deleted) {
					var was = this.selectedBody;

					this.selectBody(null);

					if (!deleted) {
						return;
					}

					this.menu.askUser('Are you sure?', [ 'Yes', 'No' ], function(action) {
						if (action != 'Yes') return;

						var bodies	= this.solarsys.getBodies();

						for (var i = 0, b; b = bodies[i]; i++) {
							if (b == was) {
								bodies.splice(i, 1);
								break;
							}
						}

						this.solarsys.setBodies(bodies);
					}.bind(this));
				}.bind(this));

			this.menu.showDialog(this.propertiesDialog, false, 'bodyProperties');
		}
	}
};

UnstableGame.prototype.handleEvent = function handleEvent(event)
{
	switch (event.type) {
		case 'click':
			if (!this.nextClickAction) {
				if (this.level < 0) {
					var b = this.findBody();

					if (b) this.selectBody(b);
				}

				return(true);
			}

			var issun	= false;
			var action	= this.nextClickAction;

			this.solarsys.options.showVelocity = true;
			delete this.nextClickAction;
			this.canvas.classList.remove('mouse-crosshair');

			switch (action) {
				case 'Add Body':
					var bodies = this.solarsys.getBodies();

					bodies.push({
						position:	new V(this.ctx.getMouse()),
						velocity:	new V(0, 0),
						color:		this.playgroundID + bodies.length,
						goal:		3
					});

					this.solarsys.setBodies(bodies);
					this.selectBody(this.solarsys.bodies[this.solarsys.bodies.length - 1]);
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
			if (this.menu.checkScrim()) {
				switch (event.keyCode) {
					case 32: /* space	*/
						/* Do the default action for the dialog */
						this.menu.hideDialog(true);
						break;
				}
				return(true);
			}

			switch (event.keyCode) {
				case 9:  /* tab - Select the next body */
					var bodies = this.solarsys.getBodies();
					var i, b, x;

					if (!event.shiftKey) {
						i = 0;
						x = 1;
					} else {
						i = bodies.length - 1;
						x = -1;
					}

					if (!this.selectedBody) {
						delete this.panTo;
					}

					for (; b = bodies[i]; i += x) {
						if (!this.panTo) {
							this.panTo = b;
							break;
						}

						if (b == this.selectedBody) {
							delete this.panTo;
						}
					}

					this.selectBody(this.panTo);

					if (!this.panTo) {
						this.panTo = { x: 0, y: 0 };
					}
					return event.preventDefault() && false;
			}

			if (this.propertiesDialog) {
				return(true);
			}

			switch (event.keyCode) {
				case 113: /* F2 - Toggle UI elements */
					if (this.solarsys.options.showVelocity) {
						this.solarsys.options.showVelocity				= false;
						this.solarsys.options.showUI					= false;
						this.solarsys.options.showTrajectoryCollisions	= false;
						this.solarsys.options.trajectory				= 0;

						document.body.classList.add('hideui');
					} else {
						this.solarsys.options.showVelocity				= true;
						this.solarsys.options.showUI					= true;
						this.solarsys.options.showTrajectoryCollisions	= true;
						this.solarsys.options.trajectory				= 3000;

						document.body.classList.remove('hideui');
					}
					return event.preventDefault() && false;

				case 32: /* space	*/
					this.go();
					return event.preventDefault() && false;

				case 13: /* Enter */
					var bodies = this.solarsys.getBodies();

					console.log(JSON.stringify(bodies));
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


				case 37: /* left	*/ this.keyboard.x--; this.keyboard.shift = event.shiftKey; break;
				case 38: /* up		*/ this.keyboard.y--; this.keyboard.shift = event.shiftKey; break;
				case 39: /* right	*/ this.keyboard.x++; this.keyboard.shift = event.shiftKey; break;
				case 40: /* down	*/ this.keyboard.y++; this.keyboard.shift = event.shiftKey; break;

				default:
					console.log(event.keyCode);
					break;
			}
			break;

		case 'keyup':
			if (this.menu.checkScrim()) {
				return(true);
			}

			switch (event.keyCode) {
				case 37: /* left	*/ this.keyboard.x = 0; break;
				case 38: /* up		*/ this.keyboard.y = 0; break;
				case 39: /* right	*/ this.keyboard.x = 0; break;
				case 40: /* down	*/ this.keyboard.y = 0; break;
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

/*
	If a user created level is being tested, this will return the user to the
	editor.
*/
UnstableGame.prototype.returnToEditor = function returnToEditor()
{
	if (!this.testing) {
		return(false);
	}

	this.loadLevel(-1, {
		name:			this.levelData.realname,
		bodies:			this.levelData.bodies,
		index:			this.levelData.index,
		testing:		false,
		userCreated:	true
	});

	return(true);
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

	if (this.nextClickAction) {
		var msg;

		switch (this.nextClickAction) {
			case 'Add Body':
				msg = 'Select a position for new body';
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
			'Add Body',
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

		addbtn('Options', function() {
			if (this.propertiesDialog) {
				this.menu.hideDialog();
				delete this.propertiesDialog;
			}

			this.propertiesDialog = this.solarsys.getPropertiesDialog(function() {
				this.menu.hideDialog();
				delete this.propertiesDialog;

				this.showHint(this.solarsys.name, null);
			}.bind(this));
			this.menu.showDialog(this.propertiesDialog, false, 'levelProperties');
		}.bind(this));
		div.appendChild(document.createTextNode('  |  '));

		addbtn('Save', function() {
			this.options.set('nextPlaygroundID', this.playgroundID + 1);

			this.options.set('levelUser-' + this.playgroundID, {
				name:			this.solarsys.name,
				bodies:			this.solarsys.getBodies(),
				userCreated:	true
			});

			this.menu.askUser('Saved', [ 'Okay' ], function(action) { });
		}.bind(this));
		div.appendChild(document.createTextNode('  |  '));

		addbtn('Try it', function() {
			this.loadLevel(this.playgroundID, {
				name:			'Testing: ' + this.solarsys.name,
				realname:		this.solarsys.name,
				index:			this.playgroundID,
				bodies:			this.solarsys.getBodies(),
				testing:		true,
				userCreated:	true
			});
		}.bind(this));
	} else {
		if (this.testing) {
			/* Return to the editor after testing a user created level */
			addbtn('Back', this.returnToEditor.bind(this));
			div.appendChild(document.createTextNode('  |  '));
		}

		if (this.solarsys.options.paused) {
			addbtn('> Play',	this.go.bind(this));
		} else {
			addbtn('<< Rewind',	this.go.bind(this));
		}

		div.appendChild(document.createTextNode('  |  '));
		addbtn('Reset', function() {
			this.menu.askUser('Are you sure?', [ 'Yes', 'No' ], function(action) {
				if (action != 'Yes') return;

				this.reset();
			}.bind(this));
		}.bind(this));
	}
};

UnstableGame.prototype.showHint = function showHint(title, hint)
{
	var titleDiv;

	if ((titleDiv = document.getElementById('title'))) {
		titleDiv.innerHTML = '';

		if (title) {
			var h = document.createElement('h3');

			h.appendChild(document.createTextNode(title));
			titleDiv.appendChild(h);
		}
	}

	if (hint && hint.length > 0) {
		var hintDiv = document.createElement('div');
		var h		= document.createElement('div');
		var i		= 0;
		var a;

		h.appendChild(document.createTextNode(hint[i]));
		hintDiv.appendChild(h);
		hintDiv.appendChild(document.createElement('br'));

		a = document.createElement('a');
		a.appendChild(document.createTextNode('Close'));
		a.addEventListener('click', function() {
			this.menu.hideDialog();
		}.bind(this));
		hintDiv.appendChild(a);

		hintDiv.appendChild(document.createTextNode('  |  '));

		a = document.createElement('a');
		a.appendChild(document.createTextNode('More'));
		a.addEventListener('click', function() {
			i++;
			if (!hint[i]) {
				i = 0;
			}
			h.innerHTML = '';
			h.appendChild(document.createTextNode(hint[i]));

			a.innerHTML = '';
			if (!hint[i + 1]) {
				a.appendChild(document.createTextNode('Repeat hints'));
			} else {
				a.appendChild(document.createTextNode('More'));
			}
		}.bind(this));
		hintDiv.appendChild(a);

		this.menu.showDialog(hintDiv, false, 'hint');
	}
};

UnstableGame.prototype.OLDshowHint = function OLDshowHint(title, hint)
{
	var hintDiv;

	if ((hintDiv = document.getElementById('hint'))) {
		hintDiv.innerHTML = '';

		if (title) {
			var h = document.createElement('h3');

			h.appendChild(document.createTextNode(title));
			hintDiv.appendChild(h);
		}

		if (hint) {
			for (var i = 0, h; h = hint[i]; i++) {
				hintDiv.appendChild(document.createTextNode(h));
				hintDiv.appendChild(document.createElement('br'));
			}
		}
	}
};

/* Return a list of bodies for the specified level */
UnstableGame.prototype.loadLevel = function loadLevel(num, levelData, hint)
{
	var bodies	= [];
	var title	= null;

	/* Hide any dialogs that may still be open */
	this.menu.hideDialog();

	/* Reset a few things */
	delete this.panTo;
	delete this.propertiesDialog;
	delete this.levelData;
	delete this.playgroundID;
	delete this.userCreated;
	delete this.selectedBody;
	delete this.nextClickAction;
	delete this.testing;

	delete this.solarsys.name;
	document.body.classList.remove('hideui');

	/* Make sure the planets aren't moving when the new level is loaded */
	this.stop();

	/* If num is < 0 then we will be in editor mode */
	this.level = num;

	if (levelData && levelData.userCreated) {
		this.levelData	= levelData;

		bodies			= levelData.bodies;
		title			= levelData.name;

		if (num < 0) {
			/* Save it in the same spot */
			this.playgroundID = levelData.index;
		}

		this.testing = levelData.testing;
	} else {
		if (UnstableLevels[num]) {
			bodies	= UnstableLevels[num].bodies;
			title	= UnstableLevels[num].name;

			if (!hint) {
				hint = UnstableLevels[num].hint;
			}
		}
	}

	if (this.level < 0) {
		/* Ensure there is a playground ID for this level */
		if (isNaN(this.playgroundID) || this.playgroundID < 0) {
			this.playgroundID = this.options.get('nextPlaygroundID');
			title = null;
		}

		/* Use the playground ID for generating the colors */
		num = this.playgroundID;
		this.userCreated = true;
	}

	this.showHint(title, hint);

	var newbodies = [];
	for (var i = 0, b; b = bodies[i]; i++) {
		newbodies.push(new Body(b));
	}

	this.solarsys.name	= title || (new Date()).toLocaleString();
	this.solarsys.id	= num;
	this.solarsys.setBodies(newbodies);
	this.loadLevelButtons();
};

/* Let the solarsystem the user has built/fixed run */
UnstableGame.prototype.go = function go()
{
	this.goTime			= Date.now();
	this.frames			= {
		total:		0,
		rendered:	0
	};

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

	delete this.panTo;

	/* Reset the canvas */
	if (this.ctx && this.ctx.center) {
		this.ctx.center();
	}

	this.solarsys.options.paused		= true;
	this.solarsys.options.showVelocity	= true;

	/* Renable displaying the selected body */
	this.selectBody(this.selectedBody);
	this.loadLevelButtons();
};

UnstableGame.prototype.pan = function pan(x, y, shift)
{
	if (this.selectedBody && this.solarsys.options.paused) {
		delete this.panTo;

		if (!shift) {
			if (!this.selectedBody.position.locked || this.level < 0) {
				this.selectedBody.position.tx({ x: x * 2, y: y * 2} );
				this.solarsys.resetTrajectories();
			}
		} else {
			if (!this.selectedBody.velocity.locked || this.level < 0) {
				this.selectedBody.velocity.tx({ x: x / 4, y: y / 4} );
				this.solarsys.resetTrajectories();
			}
		}
	} else {
		this.ctx.translate(-(x * 3), -(y * 3));
	}
};

/* Pause the game and display either a success or failure dialog */
UnstableGame.prototype.endLevel = function endLevel(success)
{
	this.solarsys.options.paused = true;

	if (this.goTime) {
		console.log('Level runtime was: ',
			(Date.now() - this.goTime) / 1000);
	}

	console.log('Rendered ' + this.frames.rendered + ' out of ' + this.frames.total + ' frames');

	if (!success) {
		var options = [ 'Retry', 'Reset' ];

		if (this.testing) {
			options.push('Back to editor');
		}

		var x = Math.floor(Math.random() * this.failureText.length);

		this.menu.askUser(this.failureText[x], options, function(action) {
			switch (action) {
				case "Reset":
					this.reset();
					break;

				case "Retry":
				default:
					this.stop();
					break;

				case "Back to editor":
					this.returnToEditor();
					return;
			}
		}.bind(this), "fail", this.solarsys);
	} else {
		var options = [ 'Replay' ];

		if (!this.userCreated && !this.testing) {
			options.unshift('Next Level');
		}

		if (this.testing) {
			options.push('Back to editor');
		}

		this.menu.askUser("Success!", options, function(action) {
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

				case "Back to editor":
					this.returnToEditor();
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
		}.bind(this), "success", this.solarsys);
	}
};

/*
	Attempt to determine if the level has ended or not.

	This checks the current state to see if the goal has been completed, and to
	see if there have been any collisions or other failures.

	If the level has ended then this will display the appropriate dialog.
*/
UnstableGame.prototype.checkForEnd = function checkForEnd()
{
	if (this.solarsys.options.paused) {
		/* The game is paused */
		return(false);
	}

	/* Did anything crash? */
	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		if (b.collision) {
			this.panTo = new V(b.collision.position);
			this.panTo.y -= 100;

			this.endLevel(false);
			return(true);
		}
	}

	if (this.level < 0) {
		/* We are in the editor, which means a level can not be completed */
		return(false);
	}

	/* Has the user completed the level? */
	var havegoal = false;
	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		if (b.completed < b.goal) {
			/* The user has not completed the level */
			return(false);
		}

		if (b.goal) {
			havegoal = true;
		}
	}

	/* This level does not appear to have a goal; oh well */
	if (!havegoal) {
		return(false);
	}

	this.endLevel(true);
	return(true);
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
	window.addEventListener('keyup',			this, false);

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
		makeCanvasZoomable(canvas, ctx, function() {
			this.selectBody(null);
			delete this.panTo;
		}.bind(this));
		resizeCanvas();

		/*
			Setup the navigation buttons

			The html for the navigation buttons is already setup. Just grab the
			anchors and assign click actions to them.
		*/
		var nav = document.getElementById('navigation');

		if (nav) {
			var btns	= nav.getElementsByTagName('area');
			var that	= this;

			for (var i = 0, b; b = btns[i]; i++) {
				(function(action) {
					b.addEventListener('click', function() {
						switch(action) {
							case 'center':
								ctx.center();
								if (!that.solarsys.options.paused) {
									var center = that.solarsys.getCenter();

									ctx.translate(-center.x, -center.y);
								}
								break;

							case 'left':	ctx.translate( 10,   0);	break;
							case 'right':	ctx.translate(-10,   0);	break;
							case 'up':		ctx.translate(  0,  10);	break;
							case 'down':	ctx.translate(  0, -10);	break;

							case 'zoomin':	ctx.zoomIn();				break;
							case 'zoomout': ctx.zoomOut();				break;
						}
					});
				})(b.alt);

				/* Attempt to show the correct mouse cursor */
				b.addEventListener('mouseover', function() {
					document.body.classList.add('mouse-pointer');
				});
				b.addEventListener('mouseout', function() {
					document.body.classList.remove('mouse-pointer');
				});
			}
		}
	}

	var render = function render(time)
	{
		var before;
		var draw;
		var p;

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

		if (isNaN(this.lasttime)) {
			this.lasttime = time;
			return;
		}

		var period	= Body.prototype.period;
		var elapsed = time - this.lasttime;
		var frames	= 0;

		while ((time - this.lasttime) > period) {
			frames++;

			/* Apply any keyboard input */
			if (this.keyboard.x || this.keyboard.y) {
				this.pan(this.keyboard.x, this.keyboard.y, this.keyboard.shift);
			}

			/*
				Advance the bodies for this period (16ms)
			*/
			before = this.solarsys.getCenter();

			this.lasttime += period;
			this.solarsys.advance(this.lasttime);

			if ((p = this.panTo)) {
				/* Move towards the selected body */
				var center = ctx.transformedPoint(w / 2, h / 2);

				/* this.panTo can be either a body or a position */
				if (p.position) {
					p = p.position;
				}

				ctx.translate(
					-((p.x - center.x) / 2),
					-((p.y - center.y) / 2));
			} else {
				/* Adjust the position of the canvas to keep the suns fixed */
				var after = this.solarsys.getCenter();
				ctx.translate(-(after.x - before.x), -(after.y - before.y));
			}

			if (this.checkForEnd()) {
				break;
			}
		}

		if (frames && this.frames) {
			this.frames.total += frames;
			this.frames.rendered++;
		}

		/* Clear the canvas */
		var a = ctx.transformedPoint(0, 0);
		var b = ctx.transformedPoint(w, h);
		ctx.clearRect(a.x, a.y, b.x - a.x, b.y - a.y);

		/* Render the bodies */
		ctx.save();
		this.solarsys.render(ctx);
		ctx.restore();
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
		window.removeEventListener('keyup',					this, false);

		this.running = false;
	}
};

UnstableGame.prototype.reset = function reset()
{
	this.hide();
	this.loadLevel(this.level, this.levelData);
	this.show();
};

