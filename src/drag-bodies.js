/* Allow dragging bodies and their velocity vectors */
function makeBodiesDraggable(canvas, ctx, solarsys)
{
	var activeVector	= null;
	var lastPoint		= null;
	var dragScale		= 1.0;

	canvas.addEventListener('mousedown',function(e)
	{
		var point = ctx.transformedPoint(
			e.offsetX || (e.pageX - canvas.offsetLeft),
			e.offsetY || (e.pageY - canvas.offsetTop));

		activeVector = null;

		/* Did the user click on a velocity vector node? */
		for (var i = 0, b; b = solarsys.bodies[i]; i++) {
			if (!b.velocity.locked && b.inside(ctx, point, true)) {
				activeVector = b.velocity;

				/*
					The actual distance that the velocity vector is moved on
					screen is divided by this value to allow for finer control.

					This should match the indicatorScale value used in body.js
				*/
				dragScale = 4.0;
				break;
			}
		}

		if (!activeVector) {
			/* Did the user click on a body? */
			for (var i = 0, b; b = solarsys.bodies[i]; i++) {
				if (!b.position.locked && b.inside(ctx, point, false)) {
					activeVector = b.position;
					dragScale = 1.0;
					break;
				}
			}
		}

		if (!activeVector) {
			ctx.setDraggable(true);
			ctx.setZoomable(true);
			return;
		}

		ctx.setDraggable(false);
		ctx.setZoomable(false);

		lastPoint = point;
	}, false);

	canvas.addEventListener('mousemove',function(e)
	{
		if (!activeVector) {
			return;
		}

		var point = ctx.transformedPoint(
			e.offsetX || (e.pageX - canvas.offsetLeft),
			e.offsetY || (e.pageY - canvas.offsetTop));

		if (point.x != lastPoint.x || point.y != lastPoint.y) {
			activeVector.tx({
				x: (point.x - lastPoint.x) / dragScale,
				y: (point.y - lastPoint.y) / dragScale
			});

			lastPoint = point;
			solarsys.resetTrajectories();
		}
	}, false);

	canvas.addEventListener('mouseup',function(e)
	{
		if (!activeVector) {
			return;
		}

		ctx.setDraggable(true);
		ctx.setZoomable(true);

		activeVector = null;
	}, false);
}

