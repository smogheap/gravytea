/*
	Return a list of bodies for the specified solar system

	Here we are treating each solar system as a set of levels. Each planet is a
	level.

	Use very low density bodies to allow for slow movement, which makes the menu
	much more usable.
*/
function loadSolarSystem(level)
{
	var bodies;

	switch (level) {
		default:
		case 0:
			bodies = [
				/* A Sun */
				{
					position:	[ -250, 0, true ],
					velocity:	[ 0, 0, true ],
					radius:		70,
					type:		'sun',
					density:	0.0009
				},

				{
					position:	[ 50, 0, true ],
					velocity:	[ 0, 1.9 ],
					radius:		15,
					density:	0.0009
				},

				{
					position:	[ 250, 0, true ],
					velocity:	[ 0, 1.5 ],
					radius:		15,
					density:	0.0009
				}
			];
			break;

		case 1:
			bodies = [
				/* A Sun */
				{
					position:	[ -250, 0, true ],
					velocity:	[ 0, 0, true ],
					radius:		70,
					type:		'sun',
					density:	0.09
				},

				{
					position:	[ 50, 0, true ],
					velocity:	[ 0, 19 ],
					radius:		15,

					goal:		4
				},

				{
					position:	[ 250, 0, true ],
					velocity:	[ 0, 15 ],
					radius:		15,

					goal:		2
				}
			];
			break;

		// TODO Add additional solar systems
	}

	return(bodies);
}

window.addEventListener('load', function()
{
	var selected;
	var selectedIndex;
	var solarsys	= new SolarSystem({
		editable:			true,
		paused:				true,
		textures:			true,
		trackOrbits:		true,
		trajectory:			3000
	});
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;

	ctx.imageSmoothingEnabled				= false;
	ctx.mozImageSmoothingEnabled			= false;
	ctx.webkitImageSmoothingEnabled			= false;

	solarsys.setBodies(loadSolarSystem(0));

	function setSelected(index)
	{
		var center		= ctx.transformedPoint(w / 2, h / 2);
		var bodies		= solarsys.getBodies();

		index = index % bodies.length;
		while (index < 0) {
			index += bodies.length;
		}

		var sel			= bodies[index % bodies.length];
		var p			= sel.position;

		/*
			Set the current camera distance. Now that this body is selected the
			camera will track with this body, decreasing this distance until
			it is directly on the object.
		*/
		var distance	= { x: (p.x - center.x), y: (p.y - center.y) };

		sel.lastpos		= { x: sel.position.x, y: sel.position.y };
		sel.steps		= 30;
		sel.stepsize	= { x: distance.x / sel.steps, y: distance.y / sel.steps };

		selected = sel;
		return(sel);
	}

	// TODO Allow selecting planets using the mouse
	window.addEventListener('keyup', function(event)
	{
		switch (event.keyCode) {
			case 37: /* left	*/ setSelected(--selectedIndex); break;
			case 38: /* up		*/ setSelected(++selectedIndex); break;
			case 39: /* right	*/ setSelected(++selectedIndex); break;
			case 40: /* down	*/ setSelected(--selectedIndex); break;

			case 32: /* space	*/
				solarsys.options.paused = !solarsys.options.paused;
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
	makeCanvasZoomable(canvas, ctx);
	resizeCanvas();

	/* If zooming isn't enabled then just return the original point */
	if (!ctx.transformedPoint) {
		ctx.transformedPoint = function(x, y) {
			return({ x: x, y: y });
		};
	}

	/* Default to the first planet */
	setSelected(selectedIndex = 1);

	// TODO Display a rocket orbiting the selected planet, and do a proper
	//		transfer to the next one when the selection is changed.
	var render = function render(time)
	{
		requestAnimationFrame(render);
		resizeCanvas();

		solarsys.advance(time);

		/* Center on the selected body/level */
		if (selected) {
			/* Move towards the selected body */
			let x = selected.lastpos.x - selected.position.x;
			let y = selected.lastpos.y - selected.position.y;

			if (selected.steps-- > 0) {
				x -= selected.stepsize.x;
				y -= selected.stepsize.y;
			}

			ctx.translate(x, y);
			selected.lastpos = { x: selected.position.x, y: selected.position.y };
		}

		/* Clear the canvas */
		var a = ctx.transformedPoint(0, 0);
		var b = ctx.transformedPoint(w, h);
		ctx.clearRect(a.x, a.y, b.x - a.x, b.y - a.y);

		ctx.save();
		solarsys.render(ctx);
		ctx.restore();
	};
	requestAnimationFrame(render);
});


