function LevelPreview(options)
{
	/* Use this.options to access saved user data */
	this.options	= options;
}

// TODO	Do not allow selecting a level that the player hasn't unlocked
LevelPreview.prototype.getMenu = function getMenu(div, cb)
{
	var currentLevel	= this.options.get('currentLevel');

	/* Clear it out (rather violently) */
	div.innerHTML = '';

	for (var i = 0, level; level = UnstableLevels[i]; i++) {
		var a = document.createElement('a');

		if (i <= currentLevel) {
			(function(level) {
				a.addEventListener('click', function(e)
				{
					cb(level);

					return e.preventDefault() && false;
				});
			})(i);
		}

		if (level.name) {
			a.appendChild(document.createTextNode(level.name));
		} else {
			a.appendChild(document.createTextNode('Level ' + (i + 1)));
		}

		var img = document.createElement('img');

		img.src = this.get(i, 250, 150, 0.3, i > currentLevel).toDataURL();

		a.appendChild(document.createElement('br'));
		a.appendChild(img);
		div.appendChild(a);
	}
};

LevelPreview.prototype.get = function get(level, width, height, scale, locked)
{
	var solarsys	= new SolarSystem({
		showVelocity:	false,
		paused:			true,
		trajectory:		300
	});
	var canvas		= document.createElement('canvas');
	var ctx			= canvas.getContext('2d');

	canvas.setAttribute('width',  width);
	canvas.setAttribute('height', height);

	/* Load a level */
	solarsys.setBodies(UnstableLevels[level].bodies);

	/* Dim the preview if this level is locked */
	if (locked) {
		var bodies	= solarsys.getBodies();

		for (var i = 0, b; b = bodies[i]; i++) {
			b.setColor('#666');
		}
		solarsys.setBodies(bodies);
	}

	ctx.translate(width / 2, height / 2);
	ctx.scale(scale, scale);

	/* Render the bodies */
	solarsys.render(ctx);

	return(canvas);
};


