// TODO	Create a class for bodies that can control it's own
//		rendering and other things. This should be extended by
//		a planet class and a rocket class etc.
//
//		The units are currently in pixels, and the velocity is
//		pixels per frame.

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

function getInputVector()
{
	var axisX	= 0;
	var axisY	= 0;

	/* Is there a gamepad plugged in? */
	if (navigator.webkitGetGamepads) {
		var gamepads = navigator.webkitGetGamepads();
		var gamepad;

		if (!(gamepad = gamepads[0])) {
			return([ 0, 0 ]);
		}

		axisX = gamepad.axes[0] || 0;
		axisY = gamepad.axes[1] || 0;
	}

	// TODO	Read keyboard input

	// TODO	Read mouse and/or touch input

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
					v = addVector(v, getInputVector(), 0.01);
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
	}

	return(elapsed);
}

window.addEventListener('load', function()
{
	var bodies		= [ ];
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var w			= window.innerWidth;
	var h			= window.innerHeight;
	var center		= [ 0, 0 ];
	var level		= 1;

	switch (level) {
		case 0:
			bodies = [
				/* The ship */
				{
					position:	[ 200,   0 ],
					velocity:	[   0,   4 ],
					radius:		3,
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
					radius:		3,
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
	}


	document.body.appendChild(canvas);

	canvas.setAttribute('width',  w);
	canvas.setAttribute('height', h);

	w = Math.floor(w / 2);
	h = Math.floor(h / 2);

	ctx.translate(w, h);

	/*
		Calculate the mass of each body (assuming for now that they are
		all perfect spheres).
	*/
	for (var i = 0, body; body = bodies[i]; i++) {
		body.volume = (4 / 3) * Math.PI * Math.pow(body.radius, 3);
		body.mass	= body.volume * body.density;
	}

	var lasttime = NaN;
	var render = function render(time)
	{
		requestAnimationFrame(render);

		if (isNaN(lasttime)) {
			lasttime = time;
			return;
		}

		var elapsed = time - lasttime;
		lasttime = time;
// console.log('elapsed', elapsed);

		ctx.clearRect(-w, -h, 2 * w, 2 * h);

		/*
			Apply gravitational pull and velocities to all bodies

			This call will always act on 16ms time segments. This happens to be
			rougly the delay you get in most browsers between frames.

			If there is a remainder then account for that so it can be included
			in the time for the next frame.
		*/
		lasttime -= advanceBodies(bodies, elapsed, true);

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

				ctx.moveTo(body.trajectory[x    ][0], body.trajectory[x    ][1]);
				ctx.lineTo(body.trajectory[x + 1][0], body.trajectory[x + 1][1]);
				ctx.stroke();
			}

			delete body.trajectory;

			ctx.fillStyle = body.color;

			ctx.beginPath();
			ctx.arc(body.position[0], body.position[1],
					body.radius, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
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

