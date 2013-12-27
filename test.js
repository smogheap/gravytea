// TODO	Create a class for bodies that can control it's own
//		rendering and other things. This should be extended by
//		a planet class and a rocket class etc.
//
//		The units are currently in pixels, and the velocity is
//		pixels per frame.

var getAngle = function getAngle(a, b)
{
	var x = a[0] - b[0];
	var y = a[1] - b[1];

	// return(Math.atan2(y, x) * (180 / Math.PI));
	return(Math.atan2(y, x));
};

var getDistance = function getDistance(a, b)
{
	var x = a[0] - b[0];
	var y = a[1] - b[1];

	return(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
};

/* Rotate a point around the origin */
var rotatePoint = function rotatePoint(v, angle)
{
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	return([
		v[0] * c - v[1] * s,
		v[0] * s + v[1] * c
	]);
};

var addVector = function addVector(a, b, scale)
{
	if (isNaN(scale)) {
		scale = 1;
	}
// console.log('scale', scale);

	return([
		a[0] + (b[0] * scale),
		a[1] + (b[1] * scale)
	]);
};

window.addEventListener('load', function()
{
	var bodies		= [
		/* The planet, centered, not moving */
		{
			position:	[   0,   0 ],
			velocity:	[   0,   0 ],
			radius:		50,
			color:		'rgba(255, 0, 0, 1.0)',
			density:	0.01
		},

		/* The ship */
		{
			position:	[ 200,   0 ],
			velocity:	[   0,   4 ],
			radius:		3,
			color:		'rgba(255, 255, 255, 1.0)',
			density:	0.01
		}
	];
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');
	var w			= window.innerWidth;
	var h			= window.innerHeight;
	var center		= [ 0, 0 ];

	document.body.appendChild(canvas);

	canvas.setAttribute('width',  w);
	canvas.setAttribute('height', h);

	w = Math.floor(w / 2);
	h = Math.floor(h / 2);

	ctx.translate(w, h);

	/*
		Calculate the mass of each body (assuming for now that they are
		all perfect spheres.
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
				body.velocity = addVector(body.velocity, v);
			}
		}

		/*
			Adjust the position of each body based on it's velocity.

			The velocity is scaled based on the elapsed time. Our base is about
			16 ms per frame.
		*/
		for (var i = 0, body; body = bodies[i]; i++) {
			body.position = addVector(body.position, body.velocity,
								elapsed / 16);
		}

		/* Render each body */
		for (var i = 0, body; body = bodies[i]; i++) {
			ctx.save();

			ctx.fillStyle = body.color;

			ctx.beginPath();
			ctx.arc(body.position[0], body.position[1],
					body.radius, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	};
	requestAnimationFrame(render);
});

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

