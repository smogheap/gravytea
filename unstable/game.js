// TODO	Show a button bar
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

// TODO	Allow a level editing mode where people can insert or remove bodies and
//		can change their size. Then allow dumping to JSON to be inserted into
//		the game as a new level.


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
		case -1:
			/*
				Level editor mode, extra keystrokes are enabled allowing adding
				or removing of bodies and allowing changing the size of bodies.
			*/
			hint = [
				'- Strike plus to add a random planet',
				'- Hover over a planet and strike minus to remove it',
				'- Hover over a planet and scroll up or down to adjust it\'s size',
				'- Strike enter to dump the level data'
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

	if (hintDiv) {
		hintDiv.innerHTML = hint.join('<br/>');
	}


	/* Assign a randomish color to any body that doesn't have one */
	for (var i = 0, b; b = bodies[i]; i++) {
		if (!b.color) {
			b.color = Math.pow(level, i);
		}
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

			case 13: /* Enter */
				var bodies = solarsys.getBodies();

				alert(JSON.stringify(bodies));
				break;

			case 187: /* plus sign */
				if (level < 0) {
					var bodies = solarsys.getBodies();

					bodies.push({
						position:	new V(ctx.getMouse()),
						velocity:	new V(0, 0),
						radius:		15
					});

					solarsys.setBodies(bodies);
				}
				break;

			case 189: /* minus sign */
				if (level < 0) {
					var bodies	= solarsys.getBodies();
					var mouse	= ctx.getMouse();

					for (var i = 0, b; b = bodies[i]; i++) {
						if (b.inside(ctx, mouse)) {
							bodies.splice(i, 1);
							break;
						}
					}

					solarsys.setBodies(bodies);
				}
				break;

			default:
				console.log(event.keyCode);
				break;
		}
	});

	function handleScroll(e)
	{
		var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;

		if (level < 0) {
			var bodies	= solarsys.getBodies();
			var mouse	= ctx.getMouse();

			for (var i = 0, b; b = bodies[i]; i++) {
				if (b.inside(ctx, mouse)) {
					b.radius += delta;

					if (b.radius < 1) {
						b.radius = 1;
					}

					solarsys.setBodies(bodies);
					ctx.setZoomable(-1);
					break;
				}
			}
		}

		return e.preventDefault() && false;
	};

	canvas.addEventListener('DOMMouseScroll',	handleScroll, false);
	canvas.addEventListener('mousewheel',		handleScroll, false);

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


