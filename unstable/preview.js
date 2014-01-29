function LevelPreview(options)
{
	/* Use this.options to access saved user data */
	this.options	= options;
}

LevelPreview.prototype.getMenuItem = function getMenuItem(div, cb, level, num, locked, playground)
{
	var a = document.createElement('a');

	a.className = 'preview';

	level.index = num;

	if (!locked) {
		a.addEventListener('click', function(e)
		{
			cb(num, level);
			return e.preventDefault() && false;
		});
	}

	if (level.name) {
		a.appendChild(document.createTextNode(level.name));
	} else {
		a.appendChild(document.createTextNode('Level ' + (num + 1)));
	}

	var img = document.createElement('img');

	img.src = this.getImage(level, num, 250, 250, 0.3, locked).toDataURL();

	a.appendChild(document.createElement('br'));
	a.appendChild(img);

	if (playground && num >= 0) {
		a.appendChild(document.createElement('br'));

		/* Add a 'Edit' button */
		var b = document.createElement('a');

		b.addEventListener('click', function(e)
		{
			cb(-1, level);
			e.stopPropagation();
			return e.preventDefault() && false;
		});

		b.appendChild(document.createTextNode('Edit'));
		a.appendChild(b);


		a.appendChild(document.createTextNode('  |  '));

		/* Add a 'Delete' button */
		var b = document.createElement('a');

		b.addEventListener('click', function(e)
		{
			this.options.set('levelUser-' + num, null);

			div.removeChild(a);
			e.stopPropagation();
			return e.preventDefault() && false;
		}.bind(this));

		b.appendChild(document.createTextNode('Delete'));
		a.appendChild(b);
	}

	return(a);
};

LevelPreview.prototype.getMenu = function getMenu(div, playground, cb)
{
	var currentLevel	= this.options.get('currentLevel');
	var a;

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	if (!playground) {
		for (var i = 0, level; level = UnstableLevels[i]; i++) {
			if ((a = this.getMenuItem(div, cb, level, i, i > currentLevel ? true : false))) {
				div.appendChild(a);
			}
		}
	} else {
		/* Insert a fake item to create a new level */
		if ((a = this.getMenuItem(div, cb, {
			name:			'New level',
			userCreated:	true,
			bodies: [
				/* A Sun */
				{
					position:	new V(0, 0),
					velocity:	new V(0, 0),
					radius:		50,
					sun:		true
				}
			]
		}, -1, false, true))) {
			div.appendChild(a);
		}

		var nextID = this.options.get('nextPlaygroundID');
		for (var i = 0; i < nextID;i ++) {
			var data;

			if (!(data = this.options.get('levelUser-' + i))) {
				/* This level is no longer there */
				continue;
			}

			if ((a = this.getMenuItem(div, cb, data, i, false, playground))) {
				div.appendChild(a);
			}
		}
	}
};

LevelPreview.prototype.getImage = function getImage(level, num, width, height, scale, locked)
{
	var solarsys	= new SolarSystem({
		showVelocity:	false,
		paused:			true,
		trajectory:		3000
	});
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');

	canvas.setAttribute('width',  width);
	canvas.setAttribute('height', height);

	/* Load a level */
	solarsys.setBodies(level.bodies);

	var bodies	= solarsys.getBodies();

	for (var i = 0, b; b = bodies[i]; i++) {
		if (locked) {
			/* Dim the preview if this level is locked */
			b.setColor('#666');
		} else {
			/* Match the colors used in the game */
			if (!b.color) {
				b.setColor(num + i);
			}
		}
	}
	solarsys.setBodies(bodies);

	makeCanvasZoomable(canvas, ctx);

	ctx.translate(width / 2, height / 2);
	ctx.scale(scale, scale);

	/* Advance enough to ensure that we have trajectory path's calculated */
	solarsys.advance(0);
	solarsys.advance(16);

	/* Render the bodies */
	solarsys.render(ctx);

	return(canvas);
};


