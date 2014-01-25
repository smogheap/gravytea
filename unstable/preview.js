function LevelPreview(opts)
{
	opts = opts || {};
}

// TODO	Do not allow selecting a level that the player hasn't unlocked
LevelPreview.prototype.getMenu = function getMenu(div, cb)
{
	/* Clear it out (rather violently) */
	div.innerHTML = '';

	for (var i = 0, level; level = UnstableLevels[i]; i++) {
		var a = document.createElement('a');

		(function(level) {
			a.addEventListener('click', function(e)
			{
				cb(level);

				return e.preventDefault() && false;
			});
		})(i);

		if (level.name) {
			a.appendChild(document.createTextNode(level.name));
		} else {
			a.appendChild(document.createTextNode('Level ' + (i + 1)));
		}

		var img = document.createElement('img');

		img.src = this.get(i, 250, 150, 0.3).toDataURL();

		a.appendChild(document.createElement('br'));
		a.appendChild(img);
		div.appendChild(a);
	}
};

LevelPreview.prototype.get = function get(level, width, height, scale)
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

	ctx.translate(width / 2, height / 2);
	ctx.scale(scale, scale);

	/* Render the bodies */
	solarsys.render(ctx);

	return(canvas);
};


