// TODO	Create a class for bodies that can control it's own
//		rendering and other things. This should be extended by
//		a planet class and a rocket class etc.
//
//		The units are currently in pixels, and the velocity is
//		pixels per frame.

function toRad(angle)
{
	return(angle * (Math.PI / 180));
}

function getAngle(a, b)
{
	var x = a[0] - b[0];
	var y = a[1] - b[1];

	// return(Math.atan2(y, x) * (180 / Math.PI));
	return(Math.atan2(y, x));
}

function getDistance(a, b)
{
	var x = a[0] - b[0];
	var y = a[1] - b[1];

	return(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
}

/* Rotate a point around the origin */
function rotatePoint(v, angle)
{
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	return([
		v[0] * c - v[1] * s,
		v[0] * s + v[1] * c
	]);
}

function addVector(a, b, scale)
{
	if (isNaN(scale)) {
		scale = 1;
	}
// console.log('scale', scale);

	return([
		a[0] + (b[0] * scale),
		a[1] + (b[1] * scale)
	]);
}

function getInputVector(body)
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

	if (axisX || axisY) {
		body.angle	= getAngle(		[ 0, 0 ], [ axisX, axisY ]);
		body.thrust	= getDistance(	[ 0, 0 ], [ axisX, axisY ]);
	} else {
		body.thrust	= 0;
	}

	return([ axisX, axisY ]);
}

function advanceBodies(bodies, elapsed, input)
{
	for (; elapsed > 16; elapsed -= 16) {
		/*
			Adjust the velocity of each body based on the gravitational
			pull of every other body.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			for (var x = 0, b; b = bodies[x]; x++) {
				/* A body does not effect itself */
				if (i == x) continue;

				var a = getAngle(b.position, body.position);
				var d = getDistance(body.position, b.position);
				var g = [ b.mass / Math.pow(d, 2), 0 ];

				var v = rotatePoint(g, a);

				if (i == 0 && input) {
					/*
						Add the input vector (ie controller, touchscreen,
						keyboard, whatever we happen to implement) to the
						velocity of the ship.

						The input vector scales from -1 to 1 in both axes, so
						scale that to a reasonable value (0.01 for now).
					*/
					v = addVector(v, getInputVector(body), 0.01);
				}

				body.velocity = addVector(body.velocity, v);
			}
		}

		/*
			Adjust the position of each body based on it's velocity.

			The velocity is scaled based on the elapsed time. Our base is about
			16 ms per frame.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			body.position = addVector(body.position, body.velocity);
		}

		/*
			Detect any collisions, and bounce the colliding objects off of each
			other.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			for (var x = 0, b; b = bodies[x]; x++) {
				/* Can't bounce off of yourself */
				if (i == x) continue;

				var d = getDistance(body.position, b.position);

				if (d < body.radius + b.radius) {
// TODO	Implement the bounce code...
					// console.log('bounce');
				}
			}
		}
	}

	return(elapsed);
}

// TODO	Only draw the flame if thrust is being applied
function drawRocket(ctx, frame, x, y, size, angle, flameSize)
{
	ctx.save();

	var scale = size / 20;

	ctx.translate(x, y);
	ctx.rotate(angle - toRad(90));
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

	if (flameSize > 0) {
		ctx.scale(flameSize, flameSize);

		switch(frame % 4) {
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

function drawPlanet(ctx, x, y, radius, color)
{
	ctx.save();
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
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
				{
					position:	[ 200,   0 ],
					velocity:	[   0,   4 ],
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.01
				},

				/* The planet, centered, not moving */
				{
					position:	[   0,   0 ],
					velocity:	[   0,   0 ],
					radius:		50,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.01
				}
			];
			break;

		case 1:
			bodies = [
				/* The ship */
				{
					position:	[  30,   0 ],
					velocity:	[   0,   0 ],
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.01
				},

				/* Two planets, orbiting each other */
				{
					position:	[   0, 150 ],
					velocity:	[-2.5,   0 ],
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.09
				},
				{
					position:	[   0,-150 ],
					velocity:	[ 2.5,   0 ],
					radius:		20,
					color:		'rgba(0, 0, 255, 1.0)',
					density:	0.09
				}
			];
			break;

		case 2:
			bodies = [
				/* The ship */
				{
					position:	[ 200,   0   ],
					velocity:	[   0,   0.8 ],
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.001
				},

				{
					position:	[   0,   0 ],
					velocity:	[   0,   0 ],
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.009
				},
				{
					position:	[    0,-150 ],
					velocity:	[ 0.85,   0 ],
					radius:		5,
					color:		'rgba(0, 0, 255, 1.0)',
					density:	0.003
				},
				{
					position:	[ 330,   50 ],
					velocity:	[   0,  0.7 ],
					radius:		6,
					color:		'rgba(0, 255, 0, 1.0)',
					density:	0.003
				}
			];
			break;
	}

	/*
		Calculate the mass of each body (assuming for now that they are
		all perfect spheres).
	*/
	for (var i = 0, body; body = bodies[i]; i++) {
		body.volume = (4 / 3) * Math.PI * Math.pow(body.radius, 3);
		body.mass	= body.volume * body.density;
	}

	return(bodies);
}

window.addEventListener('load', function()
{
	var bodies		= loadLevel(1);
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var center		= [ 0, 0 ];
	var w			= -1;
	var h			= -1;
	var X			= -1;
	var Y			= -1;

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
			bodies = loadLevel(event.keyCode - 48);
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

	var lasttime	= NaN;
	var frame		= 0;
	var render = function render(time)
	{
		requestAnimationFrame(render);

		if (isNaN(lasttime)) {
			lasttime = time;
			return;
		}

		frame++;

		if (w != window.innerWidth || h != window.innerHeight) {
			// TODO	Scale the game to fit on the screen...

			w = window.innerWidth;
			h = window.innerHeight;

			X = w / 2;
			Y = h / 2;

			canvas.setAttribute('width',  w);
			canvas.setAttribute('height', h);
		}

		/*
			It would be nice to translate, but it doesn't work on webOS. Instead
			all positions need to be adjusted relative to the center of the
			screen manually.
		*/
		// ctx.translate(x, y);
		ctx.clearRect(0, 0, w, h);

		/*
			Apply gravitational pull and velocities to all bodies

			This call will always act on 16ms time segments. This happens to be
			rougly the delay you get in most browsers between frames.

			If there is a remainder then account for that so it can be included
			in the time for the next frame.
		*/
		lasttime = time - advanceBodies(bodies, time - lasttime, true);

		/*
			Save the current position and velocity of each body before
			calculating the trajectories.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			body.save = {
				position:	[ body.position[0], body.position[1] ],
				velocity:	[ body.velocity[0], body.velocity[1] ]
			};
		}

		/* Calculate a trajectory for each body */
		for (var i = 0, body; body = bodies[i]; i++) {
			body.trajectory = [];
			body.trajectory.push([ body.position[0], body.position[1] ]);
		}
		for (var x = 0; x < 50; x++) {
			advanceBodies(bodies, 64, false);

			for (var i = 0, body; body = bodies[i]; i++) {
				body.trajectory.push([ body.position[0], body.position[1] ]);
			}
		}

		/* Restore the original position and velocity for each body */
		for (var i = 0, body; body = bodies[i]; i++) {
			body.position = body.save.position;
			body.velocity = body.save.velocity;

			delete body.save;
		}

		/* Render the trajectories, and the bodies */
		ctx.save();
		ctx.lineCap = 'round';

		for (var i = 0, body; body = bodies[i]; i++) {
			for (var x = body.trajectory.length - 2; x >= 0; x--) {
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(128, 128, 128, ' +
									((body.trajectory.length - x) * 0.01) + ')';

				ctx.moveTo(X + body.trajectory[x    ][0], Y + body.trajectory[x    ][1]);
				ctx.lineTo(X + body.trajectory[x + 1][0], Y + body.trajectory[x + 1][1]);
				ctx.stroke();
			}

			delete body.trajectory;

			if (i == 0) {
				/*
					For now there is always a single ship, and it is the first
					body in the list.
				*/
				drawRocket(ctx, frame,
					X + body.position[0], Y + body.position[1],
					body.radius, body.angle, body.thrust);
			} else {
				drawPlanet(ctx, X + body.position[0], Y + body.position[1],
					body.radius, body.color);
			}
		}
		ctx.restore();
	};
	requestAnimationFrame(render);
});

/* pollyfill for requestAnimationFrame */
(function() {
    var lastTime	= 0;
    var vendors		= ['webkit', 'moz'];

    for (var x = 0, vendor; (vendor = vendors[x]) && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame =
				window[vendor + 'RequestAnimationFrame'];

        window.cancelAnimationFrame =
				window[vendor + 'CancelAnimationFrame'] ||
				window[vendor + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime	= new Date().getTime();
            var timeToCall	= Math.max(0, 16 - (currTime - lastTime));
            var id			= window.setTimeout(function()
				{
					callback(currTime + timeToCall);
				}, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
	}

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	}
}());

