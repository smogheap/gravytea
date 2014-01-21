function Body(opts)
{
	opts = opts || {};

	this.angle		= opts.angle	|| 0;
	this.position	= opts.position	|| new V(0, 0);
	this.velocity	= opts.velocity	|| new V(0, 0);

	this.radius		= opts.radius	|| 5;
	this.density	= opts.density	|| 0.01;

	this.renderCB	= opts.renderCB;

	/* Calculate the mass (assuming it is a perfect sphere for now) */
	this.volume		= (4 / 3) * Math.PI * Math.pow(this.radius, 3);
	this.mass		= this.volume * this.density;

	this.setColor(opts.color);

	/*
		Indicator scale

		The indicator is shown asa 4 times it's actual value to make it more
		obvious.

		This value should match the dragScale value set in drag-bodies.js
	*/
	this.indicatorScale = 4;

	this.trajectory	= [];
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
Body.prototype.nextcolor = 0;

Body.prototype.setColor = function setColor(color)
{
	switch (typeof color) {
		case 'string':
			if (color == 'sun') {
				// this.color = '#DFCE3B';
				this.color = '#CAEC33';
			} else {
				this.color = color;
			}

			break;

		case 'number':
			color = Math.floor(color);

			this.color = this.colors[color % this.colors.length];
			break;

		default:
			var c = Body.prototype.nextcolor++;

			this.color = this.colors[c % this.colors.length];
			break;
	}
};

Body.prototype.render = function render(ctx, showBody, showTrajectory, showVelocity)
{
	if (showTrajectory) {
		ctx.save();

		ctx.lineCap = 'round';

		var p = this;
		var n;

		for (var i = 0; i < this.trajectory.length; i++) {
			n = this.trajectory[i];

			if (n.collision) {
				break;
			}

			ctx.strokeStyle = 'rgba(128, 128, 128, ' +
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
		var scale	= ctx.getScale();

		var s		= 7 * scale;
		var t		= 3 * scale;
		var v		= new V(this.position);

		v.tx(this.velocity.multiply(this.indicatorScale));

		ctx.save();

		ctx.lineWidth	= 1 * scale;
		ctx.lineCap		= 'round';
		ctx.strokeStyle	= 'rgba(255, 255, 255, 1.0)';

		// TODO	End this line before it gets into the indicator?

		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(v.x, v.y);
		ctx.stroke();

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
Body.prototype.inside = function checkPoint(ctx, point, vectorIndicator)
{
	var center	= new V(this.position);
	var radius	= this.radius;

	if (vectorIndicator) {
		/*
			The size of the velocity vector indicator node is constant
			regardless of the zoom level. This has to be accounted for here.
		*/
		var scale = ctx.getScale();

		radius = 7 * scale;
		center.tx(this.velocity.multiply(this.indicatorScale));
	}

	if (center.distance(point) <= radius) {
		return(true);
	}
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
	if (isNaN(elapsed)) {
		elapsed = 16;
	}

	if (elapsed < 16) {
		/* No time has elapsed; return the current value */
		return(this);
	}

	/*
		Calculate the slot that this result should be stored in within the
		trajectory array.
	*/
	var offset = Math.floor(elapsed / 16) - 1;

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
			var pos = this.getPosition(bodies, o * 16);
			var vel	= this.getVelocity(bodies, o * 16);
			var col	= false;

			for (var i = 0, b; b = bodies[i]; i++) {
				if (this === b) {
					/* A body does not effect itself */
					continue;
				}

				var bp	= b.getPosition(bodies, o * 16);
				var a	= bp.angle(pos);
				var d	= bp.distance(pos);
				var g	= new V(b.mass / Math.pow(d, 2), 0);

				vel.tx(g.rotate(a));

				if (b.radius + this.radius > d) {
					col = true;
				}
			}

			this.trajectory.splice(o, this.trajectory.length - o);
			this.trajectory[o] = {
				velocity:	vel,
				position:	pos.add(vel)
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
		elapsed = 16;
	}

	var offset = Math.floor(elapsed / 16);

	if (offset) {
		if ((p = this.predict(bodies, offset * 16))) {
			this.position	= p.position;
			this.velocity	= p.velocity;

			if (p.collision) {
				this.collision = true;
			}
		}

		/* All values prior to this one are no longer need */
		this.trajectory.splice(0, offset);
	}
};

