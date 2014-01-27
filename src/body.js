function Body(opts)
{
	opts = opts || {};

	this.angle		= opts.angle	|| 0;
	this.position	= new V(opts.position);
	this.velocity	= new V(opts.velocity);

	this.goal		= opts.goal		|| 0;
	this.completed	= 0;

	this.renderCB	= opts.renderCB;

	this.sun		= opts.sun || false;
	this.density	= opts.density	|| (this.sun ? 0.09 : 0.01);

	this.setRadius(opts.radius);

	if (this.sun) {
		this.setColor('sun');
	} else {
		this.setColor(opts.color);
	}

	/*
		Indicator scale

		The indicator is shown asa 4 times it's actual value to make it more
		obvious.

		This value should match the dragScale value set in drag-bodies.js
	*/
	this.indicatorScale = 8.0;

	this.trajectory	= [];

	this.stats = { };
};

Body.prototype.period = 16;

Body.prototype.toJSON = function toJSON()
{
	var j = {
		position:	this.position.toJSON(),
		velocity:	this.velocity.toJSON()
	};

	if (this.angle) {
		j.angle = this.angle;
	}

	if (this.radius != 5) {
		j.radius = this.radius;
	}
	if (this.density != 0.01) {
		j.density = this.density;
	}
	if (this.sun) {
		j.sun = true;
	} else if (this.orgColor) {
		j.color = this.orgColor;
	}

	j.goal = this.goal;

	return(j);
};

Body.prototype.save = function save()
{
	this.savedState = {
		position:		new V(this.position),
		velocity:		new V(this.velocity)
	};
};

Body.prototype.restore = function save(ctx, body, trajectory)
{
	if (this.savedState) {
		this.position	= new V(this.savedState.position);
		this.velocity	= new V(this.savedState.velocity);

		this.collision	= false;

		/* Reset the pre-calculated trajectory as well */
		this.trajectory	= [];

		/* Reset calculated stats as well */
		this.stats = { };
	}
};

/*
	Color pallete to use for planets

	Generated at http://tools.medialab.sciences-po.fr/iwanthue/index.php
	with	Hue: 0-250, Chroma: 0.5-3, Lightness: 0.5-1.5

	Yellows where removed (after one was taken to use for the sun)
*/
Body.prototype.colors = [
	"#747236", "#4E89D5", "#E04421", "#6CE240", "#66DFCC", "#7CCDD7",
	"#567C90", "#D28D5E", "#A9DE9C", "#549075", "#4A9F2D", "#E4A337",
	"#D9E27A", "#6EDD75", "#89B5D9", "#BE5535", "#45843E", "#A1CB47",
	"#DC7629", "#92A554", "#5BD89E", "#B9A540", "#996828"
];
Body.prototype.nextcolor = 1;

Body.prototype.setColor = function setColor(color)
{
	this.orgColor = color;

	switch (typeof color) {
		case 'number':
			color = Math.abs(Math.floor(color));

			this.color = this.colors[color % this.colors.length];
			break;

		case 'string':
			if (color == 'sun') {
				// this.color = '#DFCE3B';
				this.color = '#CAEC33';
				break;
			} else if (0 == color.indexOf('#')) {
				this.color = color;
				break;
			} else {
				/* Fallthrough - This color isn't supported */
				;
			}

		default:
			var c = Body.prototype.nextcolor++;

			this.color = this.colors[c % this.colors.length];
			break;
	}

	/*
		There are many spots where we need the color of this body, but with the
		opacity set differently. Generate the start of the rgba() string here
		so that we can easy add the opacity later.
	*/
	var c		= this.color;
	this.rgb	= '';

	switch (c.length) {
		case 4:
			this.rgb += parseInt('0x' + c.slice(1, 2) + c.slice(1, 2)) + ',';
			this.rgb += parseInt('0x' + c.slice(2, 3) + c.slice(2, 3)) + ',';
			this.rgb += parseInt('0x' + c.slice(3, 4) + c.slice(3, 4));
			break;

		case 7:
			this.rgb += parseInt('0x' + c.slice(1, 3)) + ',';
			this.rgb += parseInt('0x' + c.slice(3, 5)) + ',';
			this.rgb += parseInt('0x' + c.slice(5, 7));
	}
};

Body.prototype.setRadius = function setRadius(radius)
{
	this.radius		= radius || 5;

	if (this.radius < 1) {
		this.radius = 1;
	}

	/* Calculate the mass (assuming it is a perfect sphere for now) */
	this.volume		= (4 / 3) * Math.PI * Math.pow(this.radius, 3);
	this.mass		= this.volume * this.density;
};

Body.prototype.render = function render(ctx, showBody, showTrajectory, showVelocity)
{
	var scale;

	try {
		scale = ctx.getScale();
	} catch (e) {
		scale = 1;
	}

	if (showTrajectory) {
		ctx.save();

		ctx.lineCap		= 'round';
		ctx.lineWidth	= 1 * scale;

		var p = this;
		var n;

		for (var i = 0; i < this.trajectory.length; i++) {
			n = this.trajectory[i];

			if (n.collision) {
				break;
			}

			ctx.strokeStyle = 'rgba(' + this.rgb + ',' +
								((this.trajectory.length - (i + 1)) * 0.01) + ')';

			ctx.beginPath();
			ctx.moveTo(p.position.x, p.position.y);
			ctx.lineTo(n.position.x, n.position.y);
			ctx.stroke();

			/* Keep track of the previous position */
			p = n;
		}

		ctx.restore();
	}

	if (showVelocity && !this.velocity.locked) {
		/*
			Show the line to the velocity indicator node. This line needs to be
			under the body itself.
		*/
		var v		= new V(this.position);

		v.tx(this.velocity.multiply(this.indicatorScale));

		ctx.save();

		ctx.lineWidth	= 1 * scale;
		ctx.lineCap		= 'round';
		ctx.strokeStyle	= 'rgba(255, 255, 255, 0.7)';

		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(v.x, v.y);
		ctx.stroke();

		ctx.restore();
	}


	if (showBody) {
		if (this.renderCB) {
			/* There is an overridden render function for this body */
			this.renderCB(ctx, this);
			return;
		}

		/* Render as a generic simple planet, nothing fancy */
		ctx.save();
		ctx.fillStyle = this.color || 'red';

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius,
				0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();

		if (this.selected) {
			/* Highlight the body */
			ctx.save();
			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.radius,
					0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}

		if (this.goal) {
			/* Draw the goal on top of the planet */
			this.completed = this.getOrbitCount();

			ctx.save();

			/*
				Draw a line around the planet indicating how close to the goal
				the player is.
			*/
			var segmentSize	= (Math.PI * 2) / this.goal;

			ctx.lineCap		= 'butt';
			ctx.lineWidth	= 4;

			for (var i = 0; i < this.goal; i++) {
				if (i < this.completed) {
					ctx.strokeStyle = '#fff';
				} else {
					ctx.strokeStyle = '#666';
				}

				ctx.beginPath();

				if (this.goal > 1) {
					ctx.arc(this.position.x, this.position.y, this.radius + 5,
						(i       * segmentSize) + (segmentSize * 0.2) - toRad(90),
						((i + 1) * segmentSize) - (segmentSize * 0.2) - toRad(90), false);
				} else {
					ctx.arc(this.position.x, this.position.y, this.radius + 5,
						(i       * segmentSize) + (segmentSize * 0.01) - toRad(90),
						((i + 1) * segmentSize) - (segmentSize * 0.01) - toRad(90), false);
				}

				ctx.stroke();
			}

			ctx.restore();
		}
	}

	if (showVelocity && !this.velocity.locked) {
		/*
			Show a velocity indicator node

			This point should be shown relative to the position of the body, and
			should be a constant size regardless of current zoom level.

			This is a bit tricky. Get 2 points with ctx.transformedPoint at a
			known distance and use the resulting distance to determine the
			current scale level.
		*/
		var s		= 7 * scale;
		var v		= new V(this.position);

		v.tx(this.velocity.multiply(this.indicatorScale));

		ctx.save();

		ctx.lineWidth	= 1 * scale;
		ctx.lineCap		= 'round';
		ctx.strokeStyle	= 'rgba(255, 255, 255, 1.0)';

		/* Draw the velocity indicator circle */
		for (var i = 0; i < 2; i++) {
			switch (i) {
				case 0:
					ctx.lineWidth	= 3 * scale;
					ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
					break;

				case 1:
					ctx.lineWidth	= 1 * scale;
					ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
					break;
			}

			if (this.velocity.selected) {
				ctx.lineWidth += 2 * scale;
			}

			ctx.beginPath();
			ctx.arc(v.x, v.y, s, 0, Math.PI * 2, false);
			ctx.stroke();

			/* Draw the little ticks on the sides */
			ctx.beginPath();

			ctx.moveTo(v.x - s, v.y);
			ctx.lineTo(v.x - (s + s), v.y);
			ctx.moveTo(v.x + s, v.y);
			ctx.lineTo(v.x + (s + s), v.y);

			ctx.moveTo(v.x, v.y - s);
			ctx.lineTo(v.x, v.y - (s + s));

			ctx.stroke();
		}

		ctx.restore();
	}
};

/*
	Return true if the specified point is inside this body.

	If vectorIndicator is true then the check will be performed for the position
	the velocity vector indicator is displayed instead of the position of the
	body itself.
*/
Body.prototype.inside = function inside(ctx, point, vectorIndicator, padding)
{
	var center	= new V(this.position);
	var radius	= this.radius;
	var scale	= ctx.getScale();

	if (vectorIndicator) {

		radius = 7 * scale;
		center.tx(this.velocity.multiply(this.indicatorScale));
	}

	if (!isNaN(padding)) {
		radius += padding * scale;
	}

	if (center.distance(point) <= radius) {
		return(true);
	}

	return(false);
};

Body.prototype.getVelocity = function getVelocity(bodies, elapsed)
{
	var p;

	if (isNaN(elapsed) || elapsed == 0) {
		p = this;
	} else {
		p = this.predict(bodies, elapsed);
	}

	return(p ? (new V(p.velocity)) : null);
};

Body.prototype.getPosition = function getPosition(bodies, elapsed)
{
	var p;

	if (isNaN(elapsed) || elapsed == 0) {
		p = this;
	} else {
		p = this.predict(bodies, elapsed);
	}

	return(p ? (new V(p.position)) : null);
};

/*
	Predict the position and velocity of this body after 'elapsed' ms have
	passed. We calculate in 16ms chunks.
*/
Body.prototype.predict = function predict(bodies, elapsed)
{
	if (!this.stats.effect) {
		this.stats.effect = [];
	}

	if (isNaN(elapsed)) {
		elapsed = this.period;
	}

	if (elapsed < this.period) {
		/* No time has elapsed; return the current value */
		return(this);
	}

	/*
		Calculate the slot that this result should be stored in within the
		trajectory array.
	*/
	var offset = Math.floor(elapsed / this.period) - 1;

	if (!this.trajectory) {
		this.trajectory = [];
	}

	if (bodies) {
		/*
			Fill in all empty spots in the trajectory up to and including the
			one that was requested.
		*/
		for (var o = this.trajectory.length; o <= offset; o++) {
			/* Get the values prior to the ones we are trying to calculate */
			var pos		= this.getPosition(bodies, o * this.period);
			var vel		= this.getVelocity(bodies, o * this.period);
			var col		= false;
			var effect	= [];

			for (var i = 0, b; b = bodies[i]; i++) {
				if (this === b) {
					/* A body does not effect itself */
					continue;
				}

				var bp	= b.getPosition(bodies, o * this.period);
				var a	= bp.angle(pos);
				var d	= bp.distance(pos);
				var g	= new V(b.mass / Math.pow(d, 2), 0);

				/*
					Keep track of the gravitational effect for determining
					orbits later on.
				*/
				effect[i] = g.x;

				vel.tx(g.rotate(a));

				if (b.radius + this.radius > d) {
					col = true;
				}
			}

			this.trajectory.splice(o, this.trajectory.length - o);
			this.trajectory[o] = {
				velocity:	vel,
				position:	pos.add(vel),
				effect:		effect
			};

			if (col) {
				this.trajectory[o].collision = true;
			}
		}
	}

	return(this.trajectory[offset]);
};

Body.prototype.advance = function advance(bodies, elapsed)
{
	var p;

	if (isNaN(elapsed)) {
		elapsed = this.period;
	}

	var offset = Math.floor(elapsed / this.period);

	if (offset) {
		if ((p = this.predict(bodies, offset * this.period))) {
			this.position		= p.position;
			this.velocity		= p.velocity;
			this.stats.effect	= p.effect;

			if (p.collision) {
				this.collision = true;
			}
		}

		/* All values prior to this one are no longer need */
		this.trajectory.splice(0, offset);
	}
};

/*
	Keep track of the angle of change between the position of this body and all
	other bodies. This will be used to calculate the number of orbits that have
	been completed.
*/
Body.prototype.updateStats = function updateStats(bodies)
{
	if (!this.goal) {
		/* Only count the statistics if this body has a goal (for now) */
		return;
	}

	if (!this.stats.effect) {
		this.stats.effect = [];
	}

	if (!this.stats.angles) {
		this.stats.angles = {
			current:	[],
			change:		[],
			total:		[]
		};
	}

	for (var i = 0, b; b = bodies[i]; i++) {
		if (this === b) {
			continue;
		}

		/*
			Ignore bodies that are significantly smaller than this body, and
			bodies that are not currently having a significant gravitational
			effect on this body.
		*/
		if ((this.mass * 0.9) > b.mass ||
			isNaN(this.stats.effect[i]) ||
			this.stats.effect[i] < 0.01
		) {
			/* Ignore bodies that are significantly smaller than this body */
			delete this.stats.angles.total[i];
			delete this.stats.angles.current[i];
			continue;
		}

		var a = b.position.angle(this.position);

		if (isNaN(this.stats.angles.total[i])) {
			/* Our first value */
			this.stats.angles.total[i] = 0;
		} else {
			/*
				If the direction of change reverses then the stats need to be
				reset.

				We don't want to reset if the angle wrapps though. Assume that
				the smaller angle of change is the one that actually occured.
			*/
			var c = Math.min(
				Math.abs(a - this.stats.angles.current[i]),
				Math.abs(this.stats.angles.current[i] - a)
			);

			this.stats.angles.total[i] += c;
		}

		this.stats.angles.current[i] = a;
	}
};

/*
	Return the number of orbits that this body has completed.

	This is calculated by looking at the total relative angle of change to every
	other body, and taking the highest. Bodies that are significantly smaller
	than this body are excluded. (A moon orbiting a planet does not count as the
	planet orbiting the moon.)
*/
Body.prototype.getOrbitCount = function getOrbitCount()
{
	var highest	= 0;

	if (!this.goal) {
		/* Statas are currently only kept for bodies with a goal */
		return(0);
	}

	if (!this.stats.angles) {
		this.stats.angles = {
			current:	[],
			total:		[]
		};
	}

	for (var i = 0; i < this.stats.angles.total.length; i++) {
		if (Math.abs(this.stats.angles.total[i]) > highest) {
			highest = Math.abs(this.stats.angles.total[i]);
		}
	}

	if (highest > 0) {
		return(Math.floor(highest / (Math.PI * 4)));
	}

	return(0);
};

