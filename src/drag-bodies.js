/* Allow dragging bodies and their velocity vectors */
function makeBodiesDraggable(canvas, ctx, solarsys)
{
	var activeVector	= null;
	var lastPoint		= null;
	var dragScale		= 1.0;


	var handleEvent = function handleEvent(event)
	{
		var touches;

		if ((touches = event.changedTouches)) {
			// console.log(touches);

			if (touches.length != 1) {
				return(true);
			}

			event.mouse = {
				x: touches[0].pageX - canvas.offsetLeft,
				y: touches[0].pageY - canvas.offsetTop
			};
		} else {
			event.mouse ={
				x: event.offsetX || (event.pageX - canvas.offsetLeft),
				y: event.offsetY || (event.pageY - canvas.offsetTop)
			};
		}

		switch (event.type) {
			case 'mousedown':
			case 'touchstart':
				var point = ctx.transformedPoint(event.mouse.x, event.mouse.y);

				activeVector = null;

				/* Did the user click on a velocity vector node? */
				for (var i = 0, b; b = solarsys.bodies[i]; i++) {
					if (!b.velocity.locked && b.inside(ctx, point, true, 3)) {
						activeVector = b.velocity;

						/*
							The actual distance that the velocity vector is moved on
							screen is divided by this value to allow for finer control.

							This should match the indicatorScale value used in body.js
						*/
						dragScale = 8.0;
						break;
					}
				}

				if (!activeVector) {
					/* Did the user click on a body? */
					for (var i = 0, b; b = solarsys.bodies[i]; i++) {
						if (!b.position.locked && b.inside(ctx, point, false, 7)) {
							activeVector = b.position;
							dragScale = 1.0;
							break;
						}
					}
				}

				if (!activeVector) {
					ctx.setDraggable(true);
					ctx.setZoomable(true);
					return(true);
				}

				ctx.setDraggable(false);
				ctx.setZoomable(false);

				lastPoint = point;
				break;

			case 'mousemove':
			case 'touchmove':
				if (!activeVector) {
					return(true);
				}

				var point = ctx.transformedPoint(event.mouse.x, event.mouse.y);

				if (!solarsys.options.paused) {
					return(true);
				}

				if (point.x != lastPoint.x || point.y != lastPoint.y) {
					activeVector.tx({
						x: (point.x - lastPoint.x) / dragScale,
						y: (point.y - lastPoint.y) / dragScale
					});

					lastPoint = point;
					solarsys.resetTrajectories();
				}
				break;

			case 'mouseup':
			case 'touchend':
				if (!activeVector) {
					return(true);
				}

				ctx.setDraggable(true);
				ctx.setZoomable(true);

				activeVector = null;
				return(true);
		}
		return(true);
	};

	canvas.addEventListener('touchstart',		handleEvent, false);
	canvas.addEventListener('touchend',			handleEvent, false);
	canvas.addEventListener('touchmove',		handleEvent, false);

	canvas.addEventListener('mousedown',		handleEvent, false);
	canvas.addEventListener('mouseup',			handleEvent, false);
	canvas.addEventListener('mousemove',		handleEvent, false);
}

