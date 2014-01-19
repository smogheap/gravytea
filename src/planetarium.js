// TODO	Create some sort of UI... hints about how to play, a level select screen
//		etc...

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

/* Return a list of bodies for the specified level */
function loadLevel(level)
{
	var bodies;

	switch (level) {
		default:
		case 0:
			bodies = [
				/* A Sun */
				new Body({
					position:	new V(0, 0),
					radius:		50,
					color:		'#ffff00',
					density:	0.09
				}),

				/* A planet */
				new Body({
					position:	new V(240, 0),
					velocity:	new V(0, 15),
					radius:		15,
					color:		'#5f9ea0'
				})
			];
			break;


		case 1:
			bodies = [
				/* A Sun */
				new Body({
					position:	new V(-150, 0),
					radius:		50,
					color:		'#ffff00'
				}),

				/* A small rocky planet */
				new Body({
					position:	new V(-50, 0),
					radius:		10,
					color:		'#556b2f'
				}),

				/* A bit larger rocky planet */
				new Body({
					position:	new V(50, 0),
					radius:		25,
					color:		'#5f9ea0'
				}),

				/* Another rocky planet */
				new Body({
					position:	new V(150, 0),
					radius:		15,
					color:		'#ff0000'
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
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;

	solarsys.setBodies(loadLevel(1));

	window.addEventListener('keydown', function(event)
	{
		/* Allow loading a level by number (for now) */
		if (event.keyCode >= 48 && event.keyCode < 58) {
			solarsys.setBodies(loadLevel(event.keyCode - 48));
		}

		switch (event.keyCode) {
			case 32: /* space	*/
				runLevel(solarsys);

				break;
		}
	});

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

		/* Render a fixed view of the world... */
		ctx.save();
		solarsys.render(ctx, time, true);
		ctx.restore();
	};
	requestAnimationFrame(render);
});


