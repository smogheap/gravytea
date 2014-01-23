function SolarSystem(opts)
{
	this.options	= opts || {};

	this.bodies		= [];
};

SolarSystem.prototype.resetTrajectories = function resetTrajectories()
{
	for (var i = 0, b; b = this.bodies[i]; i++) {
		b.trajectory = [];
	}
};

SolarSystem.prototype.setBodies = function setBodies(bodies)
{
	for (var i = 0, b; b = bodies[i]; i++) {
		if (!(b instanceof Body)) {
			bodies[i] = new Body(b);
		}
	}

	this.bodies = bodies;
	this.resetTrajectories();
};

SolarSystem.prototype.getBodies = function getBodies()
{
	return(this.bodies);
};

SolarSystem.prototype.advanceBodies = function advanceBodies(elapsed)
{
	/*
		Calculate the next position for each body.

		This needs to be done before any bodies are advanced to the next
		position. Otherwise the calculations will not be correct.
	*/
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.predict(this.bodies, elapsed);
	}

	/* Move each body to the next calculated position */
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.advance(this.bodies, elapsed);
	}

	/* Keep track of how far each body has rotated around every other body */
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.updateStats(this.bodies);
	}

	/* Return the unused portion of the time */
	return(elapsed - (Math.floor(elapsed / 16) * 16));
};

SolarSystem.prototype.advance = function advance(time)
{
	if (isNaN(this.lasttime)) {
		this.lasttime	= time;
		return(false);
	}

	/*
		Calculate the trajectory for this body (using any valid pre-calculated
		data from previous frames).

		The trajectories option specifies how many ms of trajectory should be
		shown for each body.
	*/
	if (this.options.trajectory) {
		for (var i = 0, body; body = this.bodies[i]; i++) {
			body.predict(this.bodies, this.options.trajectory);
		}
	}

	/*
		Apply gravitational pull and velocities to all bodies

		This call will always act on 16ms time segments. This happens to be
		rougly the delay you get in most browsers between frames.

		If there is a remainder then account for that so it can be included
		in the time for the next frame.
	*/
	if (!this.options.paused) {
		this.lasttime = time - this.advanceBodies(time - this.lasttime, false);
	} else {
		this.lasttime = time;
	}

	return(true);
};

SolarSystem.prototype.render = function render(ctx)
{
	/* Render the trajectories below the bodies */
	if (this.options.trajectory) {
		for (var i = 0, body; body = this.bodies[i]; i++) {
			body.render(ctx, false, true);
		}
	}

	/* Render the bodies */
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.render(ctx, true, false, this.options.showVelocity);
	}
};

/* Return the average position of all suns */
// TODO	Should the positions be weighted by the relative mass of each sun?
SolarSystem.prototype.getCenter = function getCenter()
{
	var x		= 0;
	var y		= 0;
	var count	= 0;

	for (var i = 0, b; b = this.bodies[i]; i++) {
		if (!b.sun) {
			continue;
		}

		x += b.position.x;
		y += b.position.y;

		count++;
	}

	if (!count) {
		return(new V(0, 0));
	}

	x = x / count;
	y = y / count;

	return(new V(x, y));
};


