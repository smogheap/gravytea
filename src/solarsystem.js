function SolarSystem(opts)
{
	this.options	= opts || {};

	this.bodies		= [];

	/*
		The main index has a list of texture images for bodies. Grab them here
		so that we can easily apply them to bodies when rendering.
	*/
	this.textures = {
		sun:		[],
		planet:		[],
		blackhole:	[]
	};

	var t;

	if (this.options.textures && (t = document.getElementById('textures'))) {
		var images = t.getElementsByTagName('img');

		for (var i = 0, img; img = images[i]; i++) {
			if (this.textures[img.className]) {
				this.textures[img.className].push(img);
			}
		}
	}
};

SolarSystem.prototype.resetTrajectories = function resetTrajectories()
{
	for (var i = 0, b; b = this.bodies[i]; i++) {
		b.trajectory = [];
	}
};

/*
	Color pallete to use for planets

	Generated at http://tools.medialab.sciences-po.fr/iwanthue/index.php
	with	Hue: 0-250, Chroma: 0.5-3, Lightness: 0.5-1.5
*/
SolarSystem.prototype.colors = {
	list: [
		"#747236", "#4E89D5", "#E04421", "#6CE240", "#66DFCC", "#7CCDD7",
		"#567C90", "#D28D5E", "#A9DE9C", "#549075", "#4A9F2D", "#E4A337",
		"#D9E27A", "#6EDD75", "#89B5D9", "#BE5535", "#45843E", "#A1CB47",
		"#DC7629", "#92A554", "#5BD89E", "#B9A540", "#996828"
	],
	planet:		"00011111111111011110101",
	sun:		"11111001111000101101110",
	blackhole:	"00011111100010011110001"
};

SolarSystem.prototype.setBodies = function setBodies(bodies, preserveColor)
{
	this.bodies = [];

	WRand.setSeed(this.id);

	this.textures.used = 0;

	for (var i = 0, b; b = bodies[i]; i++) {
		if (!(b instanceof Body)) {
			this.bodies[i] = new Body(b);
		} else {
			this.bodies[i] = b;
		}
		b = this.bodies[i];
		b.index = i;

		/* Try to ensure we get a random crash each time */
		delete b.crashtexture;

		if (!b.texture) {
			/* Attempt to assign a texture to each body */
			var textures;
			var tries	= 0;
			var x		= WRand();

			if (!(textures = this.textures[b.type || 'planet']) || !textures.length) {
				continue;
			}

			for (;; x++, tries++) {
				x	= x % textures.length;
				bit	= (1 << x);

				if (!(this.textures.used & bit)) {
					this.textures.used |= bit;
					b.texture = textures[x];
					break;
				}

				if (tries > textures.length) {
					/* We have too many, start over */
					tries = 0;
					this.textures.used = 0;
				}
			}
		}
	}

	var strToBits = function(str) {
		if (typeof str != 'string') {
			/* Already done? */
			return(str);
		}

		var value = 0;

		for (var i = 0; i < str.length; i++) {
			if (str.charAt(i) != '0') {
				value |= 1 << i;
			}
		}

		return(value);
	};

	/*
		Convert the strings to a bitfield, the string is just for ease of
		editting and viewing in source.
	*/
	this.colors.planet		= strToBits(this.colors.planet);
	this.colors.sun			= strToBits(this.colors.sun	);
	this.colors.blackhole	= strToBits(this.colors.blackhole);
	this.colors.used		= 0;

	if (!preserveColor) {
		/*
			Set a color for each body

			There are a few rules to go by here:
				1) Do not reuse the same color for multiple planets
				2) Do not apply a color that is blacklisted for that type
				3) The colors should be consistent if the level is reloaded by
				basing them on this.id
		*/
		WRand.setSeed(this.id);

		for (var i = 0, b; b = this.bodies[i]; i++) {
			var tries	= 0;
			var x		= WRand();
			var bit;

			for (;; x++, tries++) {
				x	= x % this.colors.list.length;
				bit	= (1 << x);

				if ( (this.colors[this.type || 'planet'] & bit) &&
					!(this.colors.used & bit)
				) {
					b.setColor(this.colors.list[x]);
					this.colors.used |= bit;
					break;
				}

				if (tries > this.colors.list.length) {
					/* We have too many, start over */
					tries = 0;
					this.colors.used = 0;
				}
			}
		}
	}

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

	/* Keep track of how far each body has rotated around every other body */
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.updateStats(this.bodies);
	}

	/* Move each body to the next calculated position */
	for (var i = 0, body; body = this.bodies[i]; i++) {
		body.advance(this.bodies, elapsed);
	}

	/* Return the unused portion of the time */
	return(elapsed - (Math.floor(elapsed / Body.prototype.period) * Body.prototype.period));
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
		body.render(ctx, true, false, this.options.showVelocity, this.options.showUI);
	}
};

/*
	Return the average position of all suns

	If there are no bodies marked as a sun then return the average position of
	all bodies.
*/
// TODO	Should the positions be weighted by the relative mass of each sun?
SolarSystem.prototype.getCenter = function getCenter()
{
	var x		= 0;
	var y		= 0;
	var count	= 0;
	var all		= true;

	for (var i = 0, b; b = this.bodies[i]; i++) {
		switch (b.type) {
			case 'sun':
			case 'blackhole':
				all = false;
				break;

			default:
				break;
		}
	}

	for (var i = 0, b; b = this.bodies[i]; i++) {
		switch (b.type) {
			default:
				if (all) {
					/* fallthrough */
				} else {
					continue;
				}

			case 'sun':
			case 'blackhole':
				x += b.position.x;
				y += b.position.y;

				count++;
				break;
		}
	}

	if (!count) {
		return(new V(0, 0));
	}

	x = x / count;
	y = y / count;

	return(new V(x, y));
};

/* Return an Dom element that contains modifyable properties for this body */
SolarSystem.prototype.getPropertiesDialog = function getPropertiesDialog(closecb)
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
	content.appendChild(wrap([ lbl('Level Properties', 'h3'), e ], 'closebtn'));
	e.addEventListener('click', function(e) {
		closecb(false);

		delete that.propertyCBs;
	});

	// TODO Name
	var e		= document.createElement('input');
	e.type		= 'text';
	e.className	= 'value';
	e.value		= this.name || '';

	e.addEventListener('change', function() {
		that.name = e.value;
	});

	content.appendChild(wrap([ lbl('Name:'), e ]));

	// TODO	Min time to complete


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


