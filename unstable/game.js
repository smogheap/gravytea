// TODO	Detect collisions and fail a level when that happens

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

// TODO	Allow a level editing mode where people can insert or remove bodies and
//		can change their size. Then allow dumping to JSON to be inserted into
//		the game as a new level.

// TODO	Show a button bar (run/retry | reset | exit)

/* Return a list of bodies for the specified level */
function loadLevel(level, hintDiv)
{
	var bodies;
	var hint	= [];

	/*
		When creating a body the position or velocity may be 'locked' by passing
		a 3rd argument of true. For example, new V(0, 0, true)

		This means the user will not be able to edit that vector.
	*/
	switch (level) {
		default:
		case 1:
			hint = [
				'That planet looks like it is going to crash into the sun!',
				'That could be bad.',
				'Maybe you should move it a bit further away...'
			];

			bodies = [
				/* A Sun */
				new Body({
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'#ffff00',
					density:	0.09
				}),

				/* A planet */
				new Body({
					position:	new V(140, 0),
					velocity:	new V(0, 7, true),
					radius:		15,
					color:		'#5f9ea0'
				})
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
				new Body({
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'#ffff00',
					density:	0.09
				}),

				/* A planet */
				new Body({
					position:	new V(140, 0, true),
					velocity:	new V(0, 7),
					radius:		15,
					color:		'#ff0000'
				})
			];
			break;

		case 3:
			hint = [
				'Now you are on your own.',
				'Good luck!'
			];

			bodies = [
				/* A Sun */
				new Body({
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'#ffff00',
					density:	0.15
				}),

				/* A bit larger rocky planet */
				new Body({
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		25,
					color:		'#5f9ea0'
				}),

				/* Another rocky planet */
				new Body({
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15,
					color:		'#ff0000'
				})
			];
			break;

		case 4:
			bodies = [
				/* A Sun */
				new Body({
					position:	new V(0, 0, true),
					velocity:	new V(0, 0, true),
					radius:		50,
					color:		'#ffff00',
					density:	0.15
				}),

				new Body({
					position:	new V(0, 220),
					velocity:	new V(-3, 0),
					radius:		35,
					color:		'#5f9ea0'
				}),

				new Body({
					position:	new V(300, 0),
					velocity:	new V(5, 5),
					radius:		15,
					color:		'#ff0000'
				}),

				new Body({
					position:	new V(-350, -300),
					velocity:	new V(2, 2),
					radius:		20,
					color:		'#bada55'
				})
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

	if (hintDiv) {
		hintDiv.innerHTML = hint.join('<br/>');
	}

	return(bodies);
}

// TODO	Add a button to run to make it easier
function runLevel(solarsys)
{
	for (var i = 0, b; b = solarsys.bodies[i]; i++) {
		if (solarsys.options.paused) {
			/* Save the state as the user had created it */
			b.save();
		} else {
			/* Restore the state the user had */
			b.restore();
		}
	}

	solarsys.options.paused			= !solarsys.options.paused;
	solarsys.options.showVelocity	= !solarsys.options.showVelocity;
};

window.addEventListener('load', function()
{
	var solarsys	= new SolarSystem({
		showVelocity:	true,
		paused:			true,
		trajectory:		3 * 1000
	});
	var canvas		= document.createElement('canvas');
	var hintDiv		= document.createElement('div');
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;
	var level		= 1;

	/* Allow specifying the level in the hash of the location */
	try {
		level = parseInt(window.location.hash.substring(1));
	} catch (e) {
		level = 1;
	}

	if (isNaN(level)) {
		level = 1;
	}

	solarsys.setBodies(loadLevel(level, hintDiv));

	window.addEventListener('keydown', function(event)
	{
		/* Allow loading a level by number (for now) */
		if (event.keyCode >= 48 && event.keyCode < 58) {
			level = event.keyCode - 48;

			solarsys.setBodies(loadLevel(level, hintDiv));
		}

		switch (event.keyCode) {
			case 32: /* space	*/
				runLevel(solarsys);

				break;
		}
	});

	hintDiv.className = 'hint';

	document.body.appendChild(hintDiv);
	document.body.appendChild(canvas);

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
	makeBodiesDraggable(canvas, ctx, solarsys);
	makeCanvasZoomable(canvas, ctx);
	resizeCanvas();

	var render = function render(time)
	{
		requestAnimationFrame(render);
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
		solarsys.render(ctx, time, true);
		ctx.restore();
	};
	requestAnimationFrame(render);
});


