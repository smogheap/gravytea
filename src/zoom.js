function makeCanvasZoomable(canvas, ctx, dragcb)
{
	var scaleFactor	= 1.1;
	var position = {
		x:			canvas.width  / 2,
		y:			canvas.height / 2
	};
	var dragStart	= null;
	var dragged		= false;
	var zoomed		= false;
	var dragEnabled	= true;
	var zoomEnabled	= true;
	var mousePos	= { x: 0, y: 0 };
	var oldDistance	= NaN;

	document.body.style.mozUserSelect		= 'none';
	document.body.style.webkitUserSelect	= 'none';
	document.body.style.userSelect			= 'none';

	var handleEvent = function handleEvent(event)
	{
		var toches;

		if ((touches = event.changedTouches)) {
			// console.log(touches);

			if (touches.length > 0) {
				event.mouse = {
					x: touches[0].pageX - canvas.offsetLeft,
					y: touches[0].pageY - canvas.offsetTop
				};
			}

			/* Use the average position */
			var center = { x: 0, y: 0 };
			for (var i = 0; i < touches.length; i++) {
				center.x += touches[0].pageX - canvas.offsetLeft;
				center.y += touches[0].pageY - canvas.offsetTop;
			}
			center.x = center.x / touches.length;
			center.y = center.y / touches.length;

			event.center = center;
		} else {
			event.mouse = {
				x: event.offsetX || (event.pageX - canvas.offsetLeft),
				y: event.offsetY || (event.pageY - canvas.offsetTop)
			};
		}

		if (!touches || 2 != touches.length) {
			/* Reset the distance for dragging */
			oldDistance = NaN;
		}

		switch (event.type) {
			case 'mousedown':
			case 'touchstart':
				if (!dragEnabled) {
					dragStart	= null;
					dragged		= false;
					zoomed		= false;

					return(true);
				}

				position = event.mouse;

				dragStart = ctx.transformedPoint(position.x, position.y);
				dragged	= false;
				zoomed	= false;
				return(true);

			case 'mousemove':
			case 'touchmove':
				mousePos = event.mouse;

				if (!dragStart || !dragEnabled) {
					dragStart	= null;
					dragged		= false;
					zoomed		= false;

					return(true);
				}

				if (touches && touches.length == 2) {
					var a = new V(touches[0].pageX, touches[0].pageY);
					var b = new V(touches[1].pageX, touches[1].pageY);
					var newDistance = a.distance(b);

					dragged	= false;
					zoomed	= true;

					if (!isNaN(oldDistance)) {
						/* Scale to x where oldDistance * x == newDistance */
						var x = newDistance / oldDistance;

						ctx.scale(x, x);
					}
					oldDistance = newDistance;
					break;
				} else if (zoomed) {
					/* Don't allow dragging if zooming has already started */
					break;
				} else {
					oldDistance = NaN;
				}

				if (Math.abs(position.x - mousePos.x) <= 5 &&
					Math.abs(position.y - mousePos.y) <= 5
				) {
					/* Ya gotta drag like ya mean it */
					return(true);
				}

				position.x = mousePos.x;
				position.y = mousePos.y;

				dragged	= true;
				zoomed	= false;

				var point = ctx.transformedPoint(position.x, position.y);

				if (dragcb) dragcb();
				ctx.translate(point.x - dragStart.x, point.y - dragStart.y);
				break;

			case 'mouseup':
			case 'touchend':
				mousePos = event.mouse;
				dragStart = null;

				if (!dragged && !zoomed) {
					return(true);
				}

				dragged	= false;
				zoomed	= false;
				break;

			case 'mousewheel':
			case 'DOMMouseScroll':
				var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
				if (delta) {
					zoom(delta);
				}

				break;
		}

		return event.preventDefault() && false;
	};

	canvas.addEventListener('touchstart',		handleEvent, false);
	canvas.addEventListener('touchend',			handleEvent, false);
	canvas.addEventListener('touchmove',		handleEvent, false);

	canvas.addEventListener('mousedown',		handleEvent, false);
	canvas.addEventListener('mouseup',			handleEvent, false);
	canvas.addEventListener('mousemove',		handleEvent, false);

	canvas.addEventListener('DOMMouseScroll',	handleEvent, false);
	canvas.addEventListener('mousewheel',		handleEvent, false);

	var zoom = function ctxZoom(clicks, center)
	{
		switch (typeof zoomEnabled) {
			case 'number':
				if (zoomEnabled++ < 0) {
					return;
				}
				break;

			default:
				if (!zoomEnabled) {
					return;
				}
				break;
		}

		var point;

		if (!center) {
			point = ctx.transformedPoint(mousePos.x, mousePos.y);

			ctx.translate(point.x, point.y);
		}

		var factor	= Math.pow(scaleFactor, clicks);
		ctx.scale(factor, factor);

		if (!center) {
			ctx.translate(-point.x, -point.y);
		}
	};

	/*
	   Wrap many of the canvas functions so that the transforms may be tracked
	   in order to allow applying the same transformations to a point at any
	   time.
	   */
	var svg		= document.createElementNS("http://www.w3.org/2000/svg",'svg');
	var xform	= svg.createSVGMatrix();

	ctx.getTransform = function()
	{
		return xform;
	};

	var savedTransforms = [];

	var save = ctx.save;
	ctx.save = function()
	{
		savedTransforms.push(xform.translate(0, 0));
		return(save.call(ctx));
	};

	var restore = ctx.restore;
	ctx.restore = function(){
		xform = savedTransforms.pop();

		if (!xform) {
			xform = svg.createSVGMatrix();
		}

		return(restore.call(ctx));
	};

	var scale = ctx.scale;
	ctx.scale = function(sx,sy)
	{
		xform = xform.scaleNonUniform(sx, sy);
		return(scale.call(ctx,sx,sy));
	};

	var rotate = ctx.rotate;
	ctx.rotate = function(radians)
	{
		xform = xform.rotate(radians * 180 / Math.PI);
		return(rotate.call(ctx, radians));
	};

	var translate = ctx.translate;
	ctx.translate = function(dx, dy)
	{
		xform = xform.translate(dx, dy);
		return(translate.call(ctx,dx,dy));
	};

	var transform = ctx.transform;
	ctx.transform = function(a, b, c, d, e, f)
	{
		var m2	= svg.createSVGMatrix();

		m2.a = a;
		m2.b = b;
		m2.c = c;
		m2.d = d;
		m2.e = e;
		m2.f = f;

		xform = xform.multiply(m2);
		return(transform.call(ctx, a, b, c, d, e, f));
	};

	var setTransform = ctx.setTransform;
	ctx.setTransform = function(a,b,c,d,e,f)
	{
		xform.a = a;
		xform.b = b;
		xform.c = c;
		xform.d = d;
		xform.e = e;
		xform.f = f;

		return(setTransform.call(ctx, a, b, c, d, e, f));
	};

	var point = svg.createSVGPoint();
	ctx.transformedPoint = function(x, y)
	{
		point.x = x;
		point.y = y;

		return(point.matrixTransform(xform.inverse()));
	};

	ctx.getScale = function()
	{
		var a		= ctx.transformedPoint(  0, 0);
		var b		= ctx.transformedPoint(100, 0);
		var scale	= (b.x - a.x) / 100;

		return(scale);
	};

	ctx.setDraggable = function(enabled)
	{
		dragEnabled = enabled;
	};

	ctx.setZoomable = function(enabled)
	{
		switch (typeof enabled) {
			case 'number':
				if (typeof(zoomEnabled) != 'number') {
					zoomEnabled = 0;
				}

				zoomEnabled += enabled;
				break;

			default:
				zoomEnabled = enabled;
				break;
		}
	};

	ctx.getMouse = function()
	{
		return(ctx.transformedPoint(mousePos.x, mousePos.y));
	};

	ctx.zoom = function(clicks, center)
	{
		zoom(clicks, center);
	};

	ctx.zoomIn = function()
	{
		zoom(1, true);
	};

	ctx.zoomOut = function()
	{
		zoom(-1, true);
	};

	ctx.center = function()
	{
		var t;

		if (ctx.getTransform) {
			t = ctx.getTransform();
		} else {
			t = { a: 1, b: 0, c: 0, d: 1 };
		}

		ctx.setTransform(t.a, t.b, t.c, t.d,
			canvas.width  / 2,
			canvas.height / 2);
	};

	ctx.cleanupZoomEvents = function()
	{
		canvas.removeEventListener('mousedown',			handleEvent, false);
		canvas.removeEventListener('mouseup',			handleEvent, false);
		canvas.removeEventListener('mousemove',			handleEvent, false);

		canvas.removeEventListener('touchstart',		handleEvent, false);
		canvas.removeEventListener('touchend',			handleEvent, false);
		canvas.removeEventListener('touchmove',			handleEvent, false);

		canvas.removeEventListener('DOMMouseScroll',	handleEvent, false);
		canvas.removeEventListener('mousewheel',		handleEvent, false);
	};
}

