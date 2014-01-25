function MenuBackdrop(opts)
{
	opts = opts || {};

	this.debug = opts.debug || false;

	this.running = false;
}

MenuBackdrop.prototype.show = function showMenuBackdrop()
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

MenuBackdrop.prototype.hide = function hideMenuBackdrop()
{
	this.running = false;
};

