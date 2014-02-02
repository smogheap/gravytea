function Body(opts)
{
	opts = opts || {};

	this.completed	= 0;
	this.renderCB	= opts.renderCB;

	this.angle		= opts.a || opts.angle	|| 0;
	this.position	= new V(opts.p || opts.position);
	this.velocity	= new V(opts.v || opts.velocity);

	this.setType(opts.t || opts.type || null);

	if (opts.color == 'sun' || opts.sun) {
		/* Handle older levels */
		this.setType('sun');
	}

	/*
		Calling setType will override the goal. This is good when changing the
		type but on a newly created body do exactly what was specified.
	*/
	this.goal		= opts.g || opts.goal || 0;

	this.setDensity(opts.d || opts.density);
	this.setRadius(opts.r || opts.radius);

	this.setColor(opts.color);

	/*
		Indicator scale

		The indicator is shown asa 4 times it's actual value to make it more
		obvious.

		This value should match the dragScale value set in drag-bodies.js
	*/
	this.indicatorScale	= 8.0;

	this.trajectory		= [];
	this.stats			= { };

	/*
		The main index has a list of images to use for collisions. Grab them
		here so that we can easily render one when there is a collision.
	*/
	this.images = {
		crash:		[],
		smallcrash:	[]
	};

	var t;

	if ((t = document.getElementById('textures'))) {
		var images = t.getElementsByTagName('img');

		for (var i = 0, img; img = images[i]; i++) {
			if (this.images[img.className]) {
				this.images[img.className].push(img);
			}
		}
	}
};

Body.prototype.period = 16;

/*
	Attempt to make the JSON as compact as possible to allow easier sharing of
	level data.
*/
Body.prototype.toJSON = function toJSON()
{
	var j = {
		p: this.position.toJSON(),
		v: this.velocity.toJSON()
	};

	if (this.angle) {
		j.a = this.angle;
	}

	j.r = this.radius;
	j.d = this.density;

	switch (this.type) {
		default:
		case 'planet':		j.t = 'p'; break;
		case 'sun':			j.t = 's'; break;
		case 'blackhole':	j.t = 'b'; break;
	}

	j.g = this.goal;

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

	/* Try to use a different crash texture each time */
	delete this.crashImage;
};

Body.prototype.setColor = function setColor(color)
{
	this.color = color || '#888';

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

Body.prototype.setType = function setType(value)
{
	this.type = value || this.type || 'planet';

	switch (this.type) {
		case 's':
		case 'sun':
			this.type = 'sun';

			this.setRadius(50);
			this.setDensity(0.09);
			this.goal = 0;
			break;

		case 'b':
		case 'blackhole':
			this.type = 'blackhole';

			this.setRadius(25);
			this.setDensity(1.5);
			this.goal = 0;
			break;

		default:
		case 'p':
		case 'planet':
			this.type = 'planet';

			this.setRadius(15);
			this.setDensity(0.01);
			this.goal = 3;
			break;
	}

	delete this.texture;
};

Body.prototype.setRadius = function setRadius(radius)
{
	this.radius		= radius || this.radius || 5;

	if (this.radius < 1) {
		this.radius = 1;
	}

	/* Calculate the mass (assuming it is a perfect sphere for now) */
	this.volume		= (4 / 3) * Math.PI * Math.pow(this.radius, 3);
	this.mass		= this.volume * this.density;
};

Body.prototype.setDensity = function setDensity(density)
{
	this.density = density || this.density || 0.01;

	/* Update the volume and the mass */
	this.setRadius(this.radius);
};

Body.prototype.render = function render(ctx, showBody, showTrajectory, showVelocity, showUI, predictCollisions)
{
	var touch = ('ontouchstart' in window);
	var scale;

	try {
		scale = ctx.getScale();
	} catch (e) {
		scale = 1;
	}

	/* Update any properties being displayed */
	this.updateProperties();

	if (showTrajectory || predictCollisions) {
		ctx.save();
		ctx.lineCap		= 'round';
		ctx.lineWidth	= 1 * scale;

		var n = this;

		if (showTrajectory) {
			var i = 0;
			var s = Math.ceil(this.trajectory.length / 10);

			for (var x = 0; n && x < 10; x++) {
				ctx.beginPath();

				ctx.moveTo(n.position.x, n.position.y);
				for (var c = 0; c < s && (n = this.trajectory[i++]); c++) {
					ctx.lineTo(n.position.x, n.position.y);

					if (n.collision) {
						n = null;
						break;
					}
				}

				ctx.strokeStyle = 'rgba(' + this.rgb + ', ' + (1 - (x / 10)) + ')';
				ctx.stroke();
			}
		}

		if (predictCollisions && !showTrajectory) {
			for (var i = 0; n = this.trajectory[i]; i++) {
				if (n.collision) {
					/*
						A trajectory collision can be anywhere from 32-64 in
						size depending on how far out it will occur.
					*/
					if (this.index > n.collision.index &&
						this.images.smallcrash.length > 0
					) {
						var alpha	= 1.0 - ((i + 1) / this.trajectory.length);
						var size	= 32 + (32 * alpha);
						var w		= null;

						for (var c = 0; c < n.collision.trajectory.length; c++) {
							if (n.collision.trajectory[c].collision) {
								w = n.collision.trajectory[c];
								break;
							}
						}

						if (!n.crashImage) {
							var x = Math.floor(Math.random() * this.images.smallcrash.length);

							n.crashImage	= this.images.smallcrash[x];
							n.crashSize		= 0;
						}

						if (n.crashSize < size) {
							n.crashSize += (size - n.crashSize) / 5;
						}

						ctx.globalAlpha = alpha;
						ctx.drawImage(n.crashImage,
							((n.position.x + w.position.x) / 2) - (n.crashSize / 2),
							((n.position.y + w.position.y) / 2) - (n.crashSize / 2),
							n.crashSize, n.crashSize);
					}

					break;
				}
			}
		}
		ctx.restore();
	}

	if (showVelocity && !this.velocity.locked && (!touch || this.selected)) {
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

	// TODO	Render the circle of color, the texture and the pizza crust (goal)
	//		all to a seperate canvas that is cached.
	//
	//		If the goal changes then re-render the goal on top of this cached
	//		image.
	//
	//		Render just this one image each frame.
	if (showBody) {
		if (this.renderCB) {
			/* There is an overridden render function for this body */
			this.renderCB(ctx, this);
			return;
		}

		switch (this.type) {
			case 'sun':
			case 'blackhole':
				/* Render a halo/glow effect */
				ctx.save();

				var g = ctx.createRadialGradient(
							this.position.x, this.position.y, this.radius,
							this.position.x, this.position.y, this.radius * 1.5);

				if (this.type == 'sun') {
					g.addColorStop(0, 'rgba(' + this.rgb + ', 0.3)');
				} else {
					g.addColorStop(0, 'rgba(' + this.rgb + ', 0.2)');
				}
				g.addColorStop(1, 'rgba(' + this.rgb + ', 0.0)');

				ctx.fillStyle = g;

				ctx.beginPath();
				ctx.arc(this.position.x, this.position.y, this.radius * 1.6,
						0, Math.PI * 2, false);
				ctx.closePath();
				ctx.fill();

				ctx.restore();
				break;

			default:
				break;
		}

		/* Render the base coloured circle for the planet */
		ctx.save();

		switch (this.type) {
			case 'blackhole':
				ctx.fillStyle = '#000';
				break;

			case 'sun':
				if (!this.texture) {
					ctx.fillStyle = '#fff';
				} else {
					ctx.fillStyle = this.color || '#fff';
				}
				break;

			default:
				ctx.fillStyle = this.color || '#888';
				break;
		}

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius,
				0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();

		if (this.texture) {
			/* Render a texture on the body */
			ctx.drawImage(this.texture,
				this.position.x - this.radius - 0.5, this.position.y - this.radius - 0.5,
				(this.radius * 2) + 1, (this.radius * 2) + 1);
		}

		if (showUI) {
			if (this.selected) {
				if (!touch || this.position.locked) {
					/* Highlight the body with a simple ring */
					ctx.save();

					ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
					ctx.lineCap		= 'butt';
					ctx.lineWidth	= 4;

					ctx.beginPath();
					ctx.arc(this.position.x, this.position.y, this.radius,
							0, Math.PI * 2, false);
					ctx.closePath();
					ctx.stroke();

					ctx.restore();
				} else {
					/* Highlight the body with a large draggable area */
					var r = Math.max(this.radius + 5, scale * 50);

					ctx.save();

					var g = ctx.createRadialGradient(
								this.position.x, this.position.y, r,
								this.position.x, this.position.y, this.radius);

					g.addColorStop(0.0, 'rgba(255, 255, 255, 0.7)');
					g.addColorStop(0.1, 'rgba(255, 255, 255, 0.3)');
					g.addColorStop(1.0, 'rgba(255, 255, 255, 0.1)');

					ctx.fillStyle = g;

					ctx.beginPath();
					ctx.arc(this.position.x, this.position.y, r,
							0, Math.PI * 2, false);
					ctx.closePath();
					ctx.fill();

					ctx.restore();
				}
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

		if (this.images.crash.length > 0 &&
			this.collision && this.collision.index < this.index
		) {
			/*
				If 2 bodies have collided we only want to draw the image for it
				once. Draw it on the one with the higher index.
			*/
			if (!this.crashImage) {
				var x = Math.floor(Math.random() * this.images.crash.length);

				this.crashImage = this.images.crash[x];
				this.crashSize	= 0;
			}

			if (this.crashSize < 128) {
				this.crashSize += (128 - this.crashSize) / 5;
			}

			ctx.drawImage(this.crashImage,
				((this.position.x + this.collision.position.x) / 2) - (this.crashSize / 2),
				((this.position.y + this.collision.position.y) / 2) - (this.crashSize / 2),
				this.crashSize, this.crashSize);
		}
	}

	if (showVelocity && !this.velocity.locked && (!touch || this.selected)) {
		/*
			Show a velocity indicator node

			This point should be shown relative to the position of the body, and
			should be a constant size regardless of current zoom level.

			This is a bit tricky. Get 2 points with ctx.transformedPoint at a
			known distance and use the resulting distance to determine the
			current scale level.
		*/
		var s;
		var w;
		var v = new V(this.position);

		ctx.save();

		if (!touch) {
			s = scale * 7;
			w = 1;
		} else {
			s = scale * 30;
			w = 3;
		}

		v.tx(this.velocity.multiply(this.indicatorScale));

		ctx.lineWidth	= w * scale;
		ctx.lineCap		= 'round';
		ctx.strokeStyle	= 'rgba(255, 255, 255, 1.0)';

		/* Draw the velocity indicator circle */
		for (var i = 0; i < 2; i++) {
			switch (i) {
				case 0:
					ctx.lineWidth	= w * scale * 3;
					ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
					break;

				case 1:
					ctx.lineWidth	= w * scale;
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

	Type can be:
		'default'		Is the point inside the area of this body

		'drag'			Is the point within a UI control to be used for dragging
						this body?

		'velocity'		Is the point within a UI control to be used for changing
						the body's velocity?
*/
Body.prototype.inside = function inside(ctx, point, type, padding)
{
	var center	= new V(this.position);
	var radius	= this.radius;
	var scale	= ctx.getScale();
	var touch = ('ontouchstart' in window);

	switch (type) {
		default:
		case 'default':
			break;

		case 'drag':
			if (touch) {
				if (!this.selected) {
					/*
						On a touch screen the body must be selected before it
						can be moved on screen.
					*/
					return(false);
				}

				radius = Math.max(scale * 50, radius);
			}

			break;

		case 'velocity':
			if (touch) {
				if (!this.selected) {
					/*
						On a touch screen the body must be selected before the
						velocity vector can be moved.
					*/
					return(false);
				}
				radius = scale * 30;
			} else {
				radius = scale * 7;
			}

			center.tx(this.velocity.multiply(this.indicatorScale));
			break;
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
			var col		= null;
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
					col = b;
				}
			}

			this.trajectory.splice(o, this.trajectory.length - o);
			this.trajectory[o] = {
				velocity:	vel,
				position:	pos.add(vel),
				effect:		effect
			};

			if (col) {
				this.trajectory[o].collision = col;
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
				this.collision = p.collision;
			}
		}

		/*
			All values prior to this one are no longer need

			If any of those where a collision then consider this a collision as
			well.
		*/
		if (!this.collision) {
			for (var i = 0; i < offset; i++) {
				if (this.trajectory[i] && this.trajectory[i].collision) {
					this.collision = this.trajectory[i].collision;
					break;
				}
			}
		}
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

/* Return an Dom element that contains modifyable properties for this body */
Body.prototype.getPropertiesDialog = function getPropertiesDialog(changecb, closecb)
{
	var that		= this;
	var txt			= function(value) {
		return(document.createTextNode(value));
	};
	var lbl			= function(value, type) {
		var l = document.createElement(type || 'label');

		l.className = 'label';
		l.appendChild(document.createTextNode(value));
		return(l);
	};
	var opt			= function(select, label, selected) {
		var o = document.createElement('option');

		o.selected = selected;
		o.appendChild(document.createTextNode(label));
		select.appendChild(o);
	};
	var wrap		= function(elements, className) {
		var p = document.createElement('p');

		if (className) {
			p.className = className;
		}

		for (var i = 0, e; e = elements[i]; i++) {
			p.appendChild(e);
		}
		return(p);
	};
	var content		= document.createElement('div');
	var e;
	var i;


	/* Add a close button */
	e = document.createElement('a');

	e.appendChild(document.createTextNode('x'));
	e.className = 'value';
	content.appendChild(wrap([ lbl('Body Properties', 'h3'), e ], 'closebtn'));
	e.addEventListener('click', function(e) {
		closecb(false);

		delete that.propertyCBs;
	});


	/* Allow selecting the body type */
	e			= document.createElement('select');
	e.className	= 'value';
	e.addEventListener('change', function() {
		that.setType(this.value);
		changecb();
	});
	opt(e, 'sun',			this.type == 'sun');
	opt(e, 'planet',		this.type == 'planet');
	opt(e, 'blackhole',		this.type == 'blackhole');
	content.appendChild(wrap([ lbl('type:'), e ]));

	this.propertyCBs = [];

	var vectors = [ 'position', 'velocity' ];
	for (var i = 0; i < vectors.length; i++) {
		(function(v) {
			var e		= document.createElement('input');
			e.type		= 'text';
			e.className	= 'value';

			e.addEventListener('change', function() {
				var parts = this.value.split(',');

				if (parts.length == 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
					that[v] = new V(parseInt(parts[0]), parseInt(parts[1]));

					changecb();
				}
				this.value = '' + that[v].x + ',' + that[v].y;
			});

			var l = document.createElement('img');
			l.style.width = '16px';
			l.src = '../images/' + (that[v].locked ? '' : 'un') + 'locked.png';

			l.addEventListener('click', function() {
				that[v].locked = !that[v].locked;

				l.src = '../images/' + (that[v].locked ? '' : 'un') + 'locked.png';
				changecb();
			});

			content.appendChild(wrap([ lbl(v + ':'), e, l ]));

			that.propertyCBs.push(function() {
				if (e != document.activeElement) {
					e.value = '' + that[v].x + ',' + that[v].y;
				}
			});
		})(vectors[i]);
	}

	var properties = [ 'radius', 'goal', 'density' ];
	for (var i = 0; i < properties.length; i++) {
		(function(v) {
			var e		= document.createElement('input');
			e.type		= 'text';
			e.className	= 'value';

			e.addEventListener('change', function() {
				if (!isNaN(this.value)) {
					var value = this.value * 1;

					if (v == 'density') {
						value = value / 100;
					}

					if (that.getProperty(v) !== value) {
						that.setProperty(v, value);
						changecb();
					}
				}
			});

			content.appendChild(wrap([ lbl(v + ':'), e ]));

			that.propertyCBs.push(function() {
				if (e != document.activeElement) {
					if (v == 'density') {
						e.value = that.getProperty(v) * 100;
					} else {
						e.value = that.getProperty(v);
					}
				}
			});
		})(properties[i]);
	}

	/* Delete Button */
	e			= document.createElement('input');
	e.type		= 'button';
	e.value		= 'Delete';
	e.addEventListener('click', function() {
		closecb(true);
	});
	content.appendChild(wrap([ e ]));

	/* Close Button */
	e			= document.createElement('input');
	e.type		= 'button';
	e.value		= 'Close';
	e.addEventListener('click', function() {
		closecb(false);
	});
	content.appendChild(wrap([ e ]));

	return(content);
};

Body.prototype.updateProperties = function updateProperties()
{
	if (this.propertyCBs) {
		for (var i = 0; i < this.propertyCBs.length; i++) {
			this.propertyCBs[i]();
		}
	}
};

Body.prototype.setProperty = function setProperty(name, value)
{
	var funcname = 'set' + name.charAt(0).toUpperCase() + name.slice(1);

	if (this[funcname]) {
		this[funcname](value);
	} else {
		this[name] = value;
	}
};

Body.prototype.getProperty = function setProperty(name)
{
	var funcname = 'get' + name.charAt(0).toUpperCase() + name.slice(1);

	if (this[funcname]) {
		return(this[funcname]());
	} else {
		return(this[name]);
	}
};

