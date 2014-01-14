function toRad(angle)
{
	return(angle * (Math.PI / 180));
}

function V(x, y) {
	switch (typeof(x)) {
		case 'number':
			this.x = x;
			this.y = y;

			break;

		case 'object':
			this.x = x.x;
			this.y = x.y;
			break;
	}

}

V.prototype.tx = function(v)
{
	switch (typeof(v)) {
		case 'number':	this.x += v;	this.y += v;	break;
		case 'object':	this.x += v.x;	this.y += v.y;	break;
	}
};

V.prototype.multiply = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x * v,	this.y * v	));
		case 'object':	return(new V(this.x * v.x,	this.y * v.y));
		default:		return(null);
	}
};

V.prototype.divide = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x / v,	this.y / v	));
		case 'object':	return(new V(this.x / v.x,	this.y / v.y));
		default:		return(null);
	}
};

V.prototype.add = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x + v,	this.y + v	));
		case 'object':	return(new V(this.x + v.x,	this.y + v.y));
		default:		return(null);
	}
};

V.prototype.subtract = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x - v,	this.y - v	));
		case 'object':	return(new V(this.x - v.x,	this.y - v.y));
		default:		return(null);
	}
};

V.prototype.dot = function(v)
{
	return(this.x * v.x + this.y * v.y);
};

V.prototype.length = function()
{
	return(Math.sqrt((this.x * this.x) + (this.y * this.y)));
};

V.prototype.distance = function(v)
{
	return(this.subtract(v).length());
};

V.prototype.angle = function(v)
{
	var d = this.subtract(v);

	// return(Math.atan2(d.y, d.x) * (180 / Math.PI));
	return(Math.atan2(d.y, d.x));
};

V.prototype.normal = function()
{
	var s = 1 / this.length();

	return(new V(this.x * s, this.y * s));
};

V.prototype.rotate = function(angle)
{
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	return(new V(
		this.x * c - this.y * s,
		this.x * s + this.y * c
	));
};

function collide(a, b)
{
	var delta		= a.position.subtract(b.position);
	var distance	= delta.length();

	if (distance > a.radius + b.radius) {
		// TODO	This method of detecting a collision has a problem... If a body
		//		is moving fast enough to go right past the object in a 16ms
		//		slice then it just goes past it...

		/* No collision */
		return(false);
	}

	return(true);
}

function uggbounce(a, b)
{
	var delta		= a.position.subtract(b.position);
	var distance	= delta.length();
	var massSum		= a.mass + b.mass;

	if (distance > a.radius + b.radius) {
		/* No collision */
		return(null);
	}

	/* Calculate the normal and the tangential */
	var dNormal		= (new V(delta)).normal();
	var dTan		= new V(dNormal.y, -dNormal.x);
	var mT			= dNormal.multiply(a.radius + b.radius - distance);

	a.position.tx(mT.multiply(b.mass / massSum));
	b.position.tx(mT.multiply(-a.mass / massSum));

	/* Coefficient of restitution */
	if (isNaN(a.elasticity)) {
		a.elasticity = 1.0;
	}
	if (isNaN(b.elasticity)) {
		b.elasticity = 1.0;
	}
	var cr			= Math.min(a.elasticity, b.elasticity);
	var v1			= dNormal.multiply(a.velocity.dot(dNormal)).length();
	var v2			= dNormal.multiply(b.velocity.dot(dNormal)).length();

	/*
		Store a new velocity that can be applied after all bounces have been
		calculated. If they are applied before hand then the calculations will
		not be wrong.
	*/
	a.bvelocity = dTan.multiply(a.velocity.dot(dTan));
	a.bvelocity.tx(dNormal.multiply((cr * b.mass * (v2 - v1) + a.mass * v1 + b.mass * v2) / massSum));

	b.bvelocity = dTan.multiply(b.velocity.dot(dTan));
	b.bvelocity.tx(dNormal.multiply((cr * a.mass * (v1 - v2) + b.mass * v2 + a.mass * v1) / massSum));

	return(true);
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

function advanceBodies(bodies, elapsed, simulation)
{
	for (; elapsed >= 16; elapsed -= 16) {
		/*
			Adjust the velocity of each body based on the gravitational
			pull of every other body.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			for (var x = 0, b; b = bodies[x]; x++) {
				/* A body does not effect itself */
				if (i == x) continue;

				var a = b.position.angle(body.position);
				var d = b.position.distance(body.position);
				var g = new V(b.mass / Math.pow(d, 2), 0);

				g = g.rotate(a);

				if (i == 0 && !simulation) {
					/*
						Add the input vector (ie controller, touchscreen,
						keyboard, whatever we happen to implement) to the
						velocity of the ship.

						The input vector scales from -1 to 1 in both axes, so
						scale that to a reasonable value (0.01 for now).
					*/
					g = g.add(getInputVector(body).multiply(0.01));
				}

				body.velocity.tx(g);
			}
		}

		/*
			Adjust the position of each body based on it's velocity.

			The velocity is scaled based on the elapsed time. Our base is about
			16 ms per frame.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			body.position = body.position.add(body.velocity);
		}

		if (!simulation) {
			for (var i = 0, body; body = bodies[i]; i++) {
				for (var x = 0, b; b = bodies[x]; x++) {
					/* Can't hit yourself */
					if (i == x) continue;

					collide(body, b);
				}
			}
		}
	}

	return(elapsed);
}

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
					position:	new V(200, 0),
					velocity:	new V(0, 4),
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.01
				},

				/* The planet, centered, not moving */
				{
					position:	new V(0, 0),
					velocity:	new V(0, 0),
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
					position:	new V(40, 0),
					velocity:	new V(0, 0),
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.01
				},

				/* Two planets, orbiting each other */
				{
					position:	new V(0, 150),
					velocity:	new V(-2.5, 0),
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.09
				},
				{
					position:	new V(0, -150),
					velocity:	new V(2.5, 0),
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
					position:	new V(200, 0),
					velocity:	new V(0, 0.8),
					radius:		5,
					color:		'rgba(255, 255, 255, 1.0)',
					density:	0.001
				},

				{
					position:	new V(0, 0),
					velocity:	new V(0, 0),
					radius:		20,
					color:		'rgba(255, 0, 0, 1.0)',
					density:	0.009
				},
				{
					position:	new V(0, -150),
					velocity:	new V(0.85, 0),
					radius:		5,
					color:		'rgba(0, 0, 255, 1.0)',
					density:	0.003
				},
				{
					position:	new V(330, 50),
					velocity:	new V(0, 0.7),
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
		lasttime = time - advanceBodies(bodies, time - lasttime, false);

		/*
			Save the current position and velocity of each body before
			calculating the trajectories.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			body.save = {
				position:	new V(body.position),
				velocity:	new V(body.velocity)
			};
		}

		/* Calculate a trajectory for each body */
		for (var i = 0, body; body = bodies[i]; i++) {
			body.trajectory = [];
			body.trajectory.push([ body.position.x, body.position.y ]);
		}
		for (var x = 0; x < 250; x++) {
			advanceBodies(bodies, 16, true);

			for (var i = 0, body; body = bodies[i]; i++) {
				body.trajectory.push([ body.position.x, body.position.y ]);
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
					X + body.position.x, Y + body.position.y,
					body.radius, body.angle, body.thrust);
			} else {
				drawPlanet(ctx, X + body.position.x, Y + body.position.y,
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

