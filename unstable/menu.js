window.addEventListener('load', function()
{
	var debug		= false;

	var solarsys	= new SolarSystem({
		showVelocity:	false,
		paused:			debug,
		trajectory:		debug ? 3 * 1000 : 1 * 1000
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
			color:		'sun',
			density:	0.09
		}),

		new Body({
			position:	new V(-100, 100),
			velocity:	new V(12, 12),
			radius:		10
		}),

		new Body({
			position:	new V(240, 0),
			velocity:	new V(0, 15),
			radius:		15
		}),

		new Body({
			position:	new V(0, 400),
			velocity:	new V(11, 0),
			radius:		35
		}),


		new Body({
			position:	new V(0, 320),
			velocity:	new V(16, 0),
			radius:		2
		})
	]);

	window.addEventListener('keydown', function(event)
	{

	});

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
		requestAnimationFrame(render);
		resizeCanvas();

		ctx.save();

		/* Clear the canvas */
		ctx.clearRect(0, 0, w, h);

		var p = solarsys.bodies[0].getPosition();

		if (!debug) {
			/*
				Keep the sun in the bottom right corner of the screen so there
				is room for the menu top left.
			*/
			ctx.translate(w - p.x, h - p.y);
		} else {
			ctx.translate((w / 2) - p.x, (h / 2) - p.y);
		}

		/* Render a fixed view of the world... */
		solarsys.render(ctx, time, true);

		ctx.restore();

if (false) {
		/* Render the name of the game, and the menu */
		ctx.save();

		ctx.fillStyle		= '#ffffff';
		ctx.font			= '40pt vSHandprinted';
		ctx.textBaseline	= 'top';

		// TODO	Perhaps the menu should be done in html that is rendered on top
		//		of the canvas?

		// TODO	Decide on a final name... I kinda like "Unstable".
		// ctx.fillText('My Little Planetarium', 10, 10);
		ctx.fillText('Unstable', 10, 10);


		ctx.font			= '13pt vSHandprinted';

		ctx.fillText('Play',			30, 120);
		ctx.fillText('Choose Level',	30, 150);
		ctx.fillText('About',			30, 180);

		ctx.restore();
}
	};
	requestAnimationFrame(render);
});


