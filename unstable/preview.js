function LevelPreview(options, menu)
{
	/* Use this.menu to interact with the UI */
	this.menu		= menu;

	/* Use this.options to access saved user data */
	this.options	= options;
}

LevelPreview.prototype.getMenuItem = function getMenuItem(div, cb, level, num, locked, playground)
{
	var a = document.createElement('a');

	a.className = 'preview';

	level.index = num;

	a.addEventListener('click', function(e)
	{
		if (!locked) {
			cb(num, level);
		} else {
			this.menu.askUser('Sorry, you haven\'t unlocked this level yet', [ 'Okay' ], function(action) { });
		}
		return e.preventDefault() && false;
	}.bind(this));

	if (level.name) {
		a.appendChild(document.createTextNode(level.name));
	} else {
		a.appendChild(document.createTextNode('Level ' + (num + 1)));
	}

	var img = document.createElement('img');

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

	div.appendChild(a);

	return({
		img:	img,
		level:	level,
		num:	num,
		locked:	locked
	});
};

LevelPreview.prototype.getMenu = function getMenu(div, playground, selectCB, doneCB)
{
	var currentLevel	= this.options.get('currentLevel');
	var levels			= [];
	var l;

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	if (!playground) {
		for (var i = 0, level; level = UnstableLevels[i]; i++) {
			levels.push(this.getMenuItem(div, selectCB, level, i, i > currentLevel ? true : false));
		}
	} else {
		/* Insert a fake item to create a new level */
		levels.push(this.getMenuItem(div, selectCB, {
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
		}, -1, false, true));

		var nextID = this.options.get('nextPlaygroundID');
		for (var i = 0; i < nextID;i ++) {
			var data;

			if (!(data = this.options.get('levelUser-' + i))) {
				/* This level is no longer there */
				continue;
			}

			levels.push(this.getMenuItem(div, selectCB, data, i, false, playground));
		}
	}

	var loadfunc = function() {
		var l;

		if ((l = levels.shift())) {
			l.img.src = this.getImage(l.level, l.num, 230, 230, 0.3, l.locked).toDataURL();

			setTimeout(loadfunc, 10);
		} else {
			if (doneCB) doneCB();
		}
	}.bind(this);

	loadfunc();
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
	solarsys.id = num;
	solarsys.setBodies(level.bodies);

	if (locked) {
		/* Dim the preview if this level is locked */
		var bodies = solarsys.getBodies();

		for (var i = 0, b; b = bodies[i]; i++) {
			b.setColor('#666');
		}
		solarsys.setBodies(bodies, true);
	}

	makeCanvasZoomable(canvas, ctx);

	ctx.cleanupZoomEvents();

	ctx.translate(width / 2, height / 2);
	ctx.scale(scale, scale);

	/* Advance enough to ensure that we have trajectory path's calculated */
	solarsys.advance(0);
	solarsys.advance(16);

	/* Render the bodies */
	solarsys.render(ctx);

	return(canvas);
};


