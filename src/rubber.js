function collide(a, b)
{
	var delta		= a.position.subtract(b.position);
	var distance	= delta.length();

	if (distance > a.radius + b.radius) {
		// TODO	This method of detecting a collision has a problem... If a body
		//		is moving fast enough to go right past the object in a 16ms
		//		slice then it just goes past it...
		//
		//		Really we should check to see if the lines cross, but that will
		//		require taking into account the radius of both objects. Not
		//		terribly difficult.

		/* No collision */
		return(false);
	}

	return(true);
}

/* Read user input to determine the thrust vector for the rocket */
function getRocketThrust(body)
{
	var axisX	= 0;
	var axisY	= 0;

	/* Is there a gamepad plugged in? */
	if (navigator.webkitGetGamepads) {
		var gamepads = navigator.webkitGetGamepads();
		var gamepad;

		for (var i = 0; i < gamepads.length; i++) {
			if (!(gamepad = gamepads[i])) {
				/* This gamepad doesn't appear to exist */
				continue;
			}

			if (!gamepad.axes || !gamepad.axes[0] || !gamepad.axes[1]) {
				/* This gamepad doesn't have an analog stick */
				continue;
			}

			if (!gamepad.axes[0] && !gamepad.axes[1]) {
				/* Nothing is being pushed on this gamepad's analog stick */
				continue;
			}

			/* Looks like we found a match */
			break;
		}

		if (gamepad) {
			axisX = gamepad.axes[0] || 0;
			axisY = gamepad.axes[1] || 0;
		}
	}

	if (window.buttons && !axisX && !axisY) {
		/*
			We didn't get anything from a gamepad, so check to see if the
			keyboard is being used...
		*/
		if (window.buttons.left)		axisX--;
		if (window.buttons.up)			axisY--;
		if (window.buttons.right)		axisX++;
		if (window.buttons.down)		axisY++;
	}

	// TODO	Read mouse and/or touch input

	if (!axisX && !axisY) {
		return(null);
	}

	var v = new V(axisX, axisY);

	if (axisX || axisY) {
		var o = new V(0, 0);

		body.angle	= o.angle(v);
		body.thrust	= o.distance(v);
	} else {
		body.thrust	= 0;
	}

	return(v);
}

function renderRocket(ctx, rocket)
{
	if (isNaN(rocket.frame)) {
		rocket.frame = 1;
	} else {
		rocket.frame++;
	}

	ctx.save();

	var scale = rocket.radius / 20;

	ctx.translate(rocket.position.x, rocket.position.y);
	ctx.rotate(rocket.angle - toRad(90));
	ctx.scale(scale || 1, scale || 1);

	ctx.strokeStyle	= "white";
	ctx.fillStyle	= "silver";

	ctx.beginPath();

	ctx.arc( 10, -10, 20, toRad(130), toRad(240));
	ctx.arc(-10, -10, 20, toRad(300), toRad(50));

	ctx.lineTo( 5, 10);
	ctx.lineTo(-5, 10);

	ctx.arc(10, -10, 20, toRad(130), toRad(130));

	ctx.stroke();
	ctx.fill();

	if (rocket.thrust > 0) {
		ctx.scale(rocket.thrust, rocket.thrust);

		switch(rocket.frame % 4) {
			case 0:
				ctx.strokeStyle	= "yellow";
				ctx.fillStyle	= "orange";
				break;

			case 2:
				ctx.strokeStyle	= "orange";
				ctx.fillStyle	= "red";
				break;

			default:
				ctx.strokeStyle	= "white";
				ctx.fillStyle	= "yellow";

				ctx.translate(0, 5.5);
				ctx.scale(0.5, 0.5);
				break;
		}

		ctx.beginPath();
		ctx.arc( 5, 15, 10, toRad(120), toRad(200));
		ctx.arc(-5, 15, 10, toRad(340), toRad(60));
		ctx.stroke();
		ctx.fill();
	}

	ctx.restore();
}

/* Return a list of bodies for the specified level */
function loadLevel(level)
{
	var bodies;

	switch (level) {
		default:
		case 0:
			bodies = [
				/* The ship */
				new Body({
					position:	new V(200, 0),
					velocity:	new V(0, 4),
					radius:		5
				}),

				/* The planet, centered, not moving */
				new Body({
					radius:		50,
					color:		'rgba(255, 0, 0, 1.0)'
				})
			];
			break;

		case 1:
			bodies = [
				/* The ship */
				new Body({
					position:	new V(30, 0),
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)'
				}),

				/* Two planets, orbiting each other */
				new Body({
					position:	new V(0, 150),
					velocity:	new V(-2.5, 0),
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.09
				}),
				new Body({
					position:	new V(0, -150),
					velocity:	new V(2.5, 0),
					radius:		20,
					color:		'rgba(0, 0, 255, 1.0)',
					density:	0.09
				})
			];
			break;

		case 2:
			bodies = [
				/* The ship */
				new Body({
					position:	new V(200, 0),
					velocity:	new V(0, 0.8),
					radius:		5,
					density:	0.001
				}),

				new Body({
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.009
				}),
				new Body({
					position:	new V(0, -150),
					velocity:	new V(0.85, 0),
					radius:		5,
					color:		'rgba(0, 0, 255, 1.0)',
					density:	0.003
				}),
				new Body({
					position:	new V(330, 50),
					velocity:	new V(0, 0.7),
					radius:		6,
					color:		'rgba(0, 255, 0, 1.0)',
					density:	0.003
				})
			];
			break;
	}

	/* For this game the first body is always the ship */
	bodies[0].renderCB = renderRocket;

	return(bodies);
}

window.addEventListener('load', function()
{
	var solarsys	= new SolarSystem({
		trajectory:		5 * 1000
	});
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;

	solarsys.setBodies(loadLevel(1));

	window.buttons = {};

	window.addEventListener('keydown', function(event)
	{
		switch (event.keyCode) {
			case 37:	window.buttons.left		= true; break;
			case 38:	window.buttons.up		= true; break;
			case 39:	window.buttons.right	= true; break;
			case 40:	window.buttons.down		= true; break;
		}

		/* Allow loading a level by number (for now) */
		if (event.keyCode >= 48 && event.keyCode < 58) {
			solarsys.setBodies(loadLevel(event.keyCode - 48));
		}
	});

	window.addEventListener('keyup', function(event)
	{
		switch (event.keyCode) {
			case 37:	delete window.buttons.left;		break;
			case 38:	delete window.buttons.up;		break;
			case 39:	delete window.buttons.right;	break;
			case 40:	delete window.buttons.down;		break;
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

	var render = function render(time)
	{
		var thrust;
		var rocket;

		requestAnimationFrame(render);
		resizeCanvas();

		/* Clear the canvas */
		var a = ctx.transformedPoint(0, 0);
		var b = ctx.transformedPoint(canvas.width, canvas.height);
		ctx.clearRect(a.x, a.y, b.x - a.x, b.y - a.y);

		ctx.save();

		/* Is there any thrust to apply to the rocket? */
		if ((rocket = solarsys.bodies[0]) && (thrust = getRocketThrust(rocket))) {
			rocket.velocity.tx(thrust.multiply(0.01));
			solarsys.resetTrajectories();
		}

		if (solarsys.advance(time)) {
			solarsys.render(ctx);
		}
		ctx.restore();
	};
	requestAnimationFrame(render);
});


