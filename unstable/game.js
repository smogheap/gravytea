// TODO	Update the buttons on the button bar based on current status
//
//		 > Play    |  Reset  |  Help
//		<< Rewind  |  Reset  |  Help

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

// TODO	Detect collisions and fail a level when that happens. Perhaps show some
//		icon as well indicating a crash. The level doesn't really need to fail,
//		it just needs to pause. If the goal hasn't been completed by that point
//		then it won't continue.

// TODO	Implement goals. The first being an orbit count down set for each body.
//
//		For each body keep track of the total angle of change relative to every
//		other body, using the largest to calculate the angle of change.
//
//		This is a bit complicated though... If you have a sun, a planet and a
//		small moon then the planet's relationship to the sun is the important
//		one to count.
//
//		There may be cases with 2 similar sized bodies orbiting each other
//		though...
//
//		Perhaps set a limit on the size ratio.... A body can not be considered
//		to be orbitting another body if it is significantly smaller than it is.
//
//		Only count the angle of change for bodies that are at least 90% of the
//		size of the body.

// TODO	Move the level along with the sun so that the sun stays centered (or if
//		it isn't centered then it stays in the same relative position to the
//		center...)

function UnstableGame(opts)
{
	opts = opts || {};

	this.running = false;

	this.solarsys	= new SolarSystem({
		showVelocity:	true,
		paused:			true,
		trajectory:		3 * 1000
	});
}

UnstableGame.prototype.handleEvent = function handleEvent(e)
{
	switch (event.type) {
		case 'DOMMouseScroll':
		case 'mousewheel':
			var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

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

			return e.preventDefault() && false;

		case 'keydown':
			switch (event.keyCode) {
				case 32: /* space	*/
					this.go();
					return e.preventDefault() && false;

				case 13: /* Enter */
					var bodies = this.solarsys.getBodies();

					alert(JSON.stringify(bodies));
					return e.preventDefault() && false;

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
					return e.preventDefault() && false;

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
					return e.preventDefault() && false;

				default:
					console.log(event.keyCode);
					break;
			}
			break;
	}

	return true;
};

// TODO	Do not allow selecting a level that the player hasn't unlocked
UnstableGame.prototype.loadLevelMenu = function loadLevelMenu(div, cb)
{
	var titles	= [
		'Get moving',
		'Getting up to speed',
		'On your own',
		'A bit of a challenge'
	];

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	for (var i = 0, title; title = titles[i]; i++) {
		var a = document.createElement('a');

		(function(level) {
			a.href = '#';
			a.addEventListener('click', function(e)
			{
				cb(level);

				return e.preventDefault() && false;
			});
		})(i + 1);

		a.innerText = title;
		div.appendChild(a);

		div.appendChild(document.createElement('br'));
	}

	// TODO	We may or may not want to hide this in release versions
	div.appendChild(document.createElement('br'));

	var a = document.createElement('a');

	a.href = '#';
	a.addEventListener('click', function(e)
	{
		cb(-1);

		return e.preventDefault() && false;
	});

	a.innerText = 'Level Editor';
	div.appendChild(a);
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
			hint = [
				'Press + to create a planet under the mouse',
				'Press - to remove the planet under the mouse',
				'Scroll up/down to resize the planet under the mouse',
				'Press enter to dump level data'
			];
			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'sun',
					density:	0.09
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
					color:		'sun',
					density:	0.09
				},

				/* A planet */
				{
					position:	new V(140, 0),
					velocity:	new V(0, 7, true),
					radius:		15
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
					color:		'sun',
					density:	0.09
				},

				/* A planet */
				{
					position:	new V(140, 0, true),
					velocity:	new V(0, 7),
					radius:		15
				}
			];
			break;

		case 3:
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
					color:		'sun',
					density:	0.15
				},

				/* A bit larger rocky planet */
				{
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		25
				},

				/* Another rocky planet */
				{
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15
				}
			];
			break;

		case 4:
			bodies = [
				/* A Sun */
				{
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'sun',
					density:	0.15
				},

				{
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		35
				},

				{
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15
				},

				{
					position:	new V(-350, -300),
					velocity:	new V(2, 2),
					radius:		20
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
};

// TODO	Add a button to run to make it easier
/* Let the solarsystem the user has built/fixed run */
UnstableGame.prototype.go = function go()
{
	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		if (this.solarsys.options.paused) {
			/* Save the state as the user had created it */
			b.save();
		} else {
			/* Restore the state the user had */
			b.restore();
		}
	}

	this.solarsys.options.paused		= !this.solarsys.options.paused;
	this.solarsys.options.showVelocity	= !this.solarsys.options.showVelocity;
};

UnstableGame.prototype.stop = function stop()
{
	for (var i = 0, b; b = this.solarsys.bodies[i]; i++) {
		/* Restore the state the user had */
		b.restore();
	}

	this.solarsys.options.paused		= true;
	this.solarsys.options.showVelocity	= true;
};

UnstableGame.prototype.show = function showUnstableGame()
{
	this.running = true;

	if (!(this.canvas)) {
		this.canvas	= document.createElement('canvas');
		this.ctx	= this.canvas.getContext('2d');

		document.body.appendChild(this.canvas);
	}

	var canvas	= this.canvas;
	var ctx		= this.ctx;
	var center	= [ 0, 0 ];
	var w		= -1;
	var h		= -1;

	if (isNaN(this.level)) {
		this.loadLevel(1);
	}

	canvas.addEventListener('DOMMouseScroll',	this, false);
	canvas.addEventListener('mousewheel',		this, false);
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

	ctx.save();
	makeBodiesDraggable(canvas, ctx, this.solarsys);
	makeCanvasZoomable(canvas, ctx);
	resizeCanvas();

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
// console.log(a.x, a.y, b.x, b.y);
		ctx.clearRect(a.x, a.y, b.x - a.x, b.y - a.y);

		// TODO	When the user hits the "Run" button allow the planets to advance
		// TODO	Allow the user to drag bodies around

		/* Render the solar system */
		ctx.save();
		this.solarsys.render(ctx, time, true);
		ctx.restore();
	};
	requestAnimationFrame(render.bind(this));
};

UnstableGame.prototype.hide = function hideUnstableGame(level)
{
	if (this.running) {
		this.canvas.removeEventListener('DOMMouseScroll',	this, false);
		this.canvas.removeEventListener('mousewheel',		this, false);
		window.removeEventListener('keydown',				this, false);

		this.running = false;
	}
};

