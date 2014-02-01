/*
	This wraps canvas functions with versions that will round coords before
	performing the requested action.

	The result can increase performance a great deal for some things, such as
	drawImage, especially on mobile devices.
*/
function setCanvasSmoothing(ctx, enabled)
{
	if (enabled) {
		enableCanvasSmoothing(ctx);
	} else {
		disableCanvasSmoothing(ctx);
	}
}

function disableCanvasSmoothing(ctx)
{
	ctx.noSmoothOrgs	= {};

	var rnd = function(args, index) {
		if (args[index]) {
			args[index] = Math.round(args[index]);
		}
	};

	var wrap = function(name, func) {
		if (!ctx.noSmoothOrgs[name]) {
			ctx.noSmoothOrgs[name] = ctx[name];
		}

		ctx[name] = func;
		ctx[name] = function() {
			switch (name) {
				case 'lineTo':
				case 'moveTo':
				case 'rect':
				case 'clearRect':
				case 'FillRect':
				case 'strokeRect':
					/* Round all arguments */
					for (var i = 0; i < arguments.length; i++) {
						rnd(arguments, i);
					}
					break;

				case 'fillText':
				case 'strokeText':
				case 'drawImage':
					/* Round all arguments, except the first (image or text) */
					for (var i = 1; i < arguments.length; i++) {
						rnd(arguments, i);
					}
					break;
			}

			ctx.noSmoothOrgs[name].apply(ctx, arguments);
		};
	};

	wrap('clearRect');
	wrap('drawImage');
	wrap('lineTo');
	wrap('moveTo');
	wrap('rect');
	wrap('FillRect');
	wrap('strokeRect');
	wrap('fillText');
	wrap('strokeText');

	return(ctx);
}

function enableCanvasSmoothing(ctx)
{
	if (!ctx.noSmoothOrgs) {
		return;
	}

	/* Restore the original functions */
	var names = Object.keys(ctx.noSmoothOrgs);

	for (var i = 0, n; n = names[i]; i++) {
		ctx[n] = ctx.noSmoothOrgs[n];
	}

	delete ctx.noSmoothOrgs;
};
