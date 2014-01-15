function Body(opts)
{
	opts = opts || {};

	this.position	= opts.position	|| new V(0, 0);
	this.velocity	= opts.velocity	|| new V(0, 0);
	this.angle		= opts.angle	|| 0;

	this.radius		= opts.radius	|| 5;
	this.density	= opts.density	|| 0.01;

	this.color		= opts.color	|| 'red';
	this.renderCB	= opts.renderCB;

	/* Calculate the mass (assuming it is a perfect sphere for now) */
	this.volume		= (4 / 3) * Math.PI * Math.pow(this.radius, 3);
	this.mass		= this.volume * this.density;

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

		/* Reset the pre-calculated trajectory as well */
		this.trajectory	= [];
	}
};

// TODO	Add an option to display the velocity vector

Body.prototype.render = function render(ctx, showBody, showTrajectory, showVelocity)
{
	if (showTrajectory) {
		ctx.save();

		ctx.lineCap = 'round';

		var p = this;
		for (var i = this.trajectory.length - 1, n; n = this.trajectory[i]; i--) {
			ctx.strokeStyle = 'rgba(128, 128, 128, ' +
								((this.trajectory.length - i) * 0.01) + ')';

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
		ctx.fillStyle = this.color;

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius,
				0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	if (showVelocity) {
		var v = new V(this.position);
		var s = 7;

		v.tx(this.velocity);

		ctx.save();

		ctx.lineCap = 'round';
		ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';

		// TODO	End this line before it gets into the indicator?
		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(v.x, v.y);
		ctx.stroke();

		/* Draw the velocity indicator circle */
		ctx.beginPath();
		ctx.arc(v.x, v.y, s, 0, Math.PI * 2, false);
		ctx.stroke();

		/* Draw the little ticks on the sides */
		ctx.beginPath();

		ctx.moveTo(v.x - s, v.y);
		ctx.lineTo(v.x - (s + 3), v.y);
		ctx.moveTo(v.x + s, v.y);
		ctx.lineTo(v.x + (s + 3), v.y);

		ctx.moveTo(v.x, v.y - s);
		ctx.lineTo(v.x, v.y - (s + 3));

		ctx.stroke();


		ctx.restore();
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
			}

			this.trajectory.splice(o, this.trajectory.length - o);
			this.trajectory[o] = {
				velocity:	vel,
				position:	pos.add(vel)
			};
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
		}

		/* All values prior to this one are no longer need */
		this.trajectory.splice(0, offset);
	}
};

