function makeCanvasZoomable(canvas, ctx)
{
	var scaleFactor	= 1.1;
	var position = {
		x:			canvas.width  / 2,
		y:			canvas.height / 2
	};
	var dragStart	= null;
	var dragged		= false;
	var dragEnabled	= true;
	var zoomEnabled	= true;
	var mousePos	= { x: 0, y: 0 };

	document.body.style.mozUserSelect		= 'none';
	document.body.style.webkitUserSelect	= 'none';
	document.body.style.userSelect			= 'none';

	canvas.addEventListener('mousedown',function(e)
	{
		if (!dragEnabled) {
			dragStart	= null;
			dragged		= false;

			return;
		}

		position.x = e.offsetX || (e.pageX - canvas.offsetLeft);
		position.y = e.offsetY || (e.pageY - canvas.offsetTop);

		dragStart = ctx.transformedPoint(position.x, position.y);
		dragged = false;
	}, false);

	canvas.addEventListener('mousemove',function(e)
	{
		mousePos.x = e.offsetX || (e.pageX - canvas.offsetLeft);
		mousePos.y = e.offsetY || (e.pageY - canvas.offsetTop);

		if (!dragStart) {
			return;
		}

		position.x = mousePos.x;
		position.y = mousePos.y;

		dragged = true;

		var point = ctx.transformedPoint(position.x, position.y);

		ctx.translate(point.x - dragStart.x, point.y - dragStart.y);
	}, false);

	var zoom = function ctxZoom(clicks)
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

		var point	= ctx.transformedPoint(position.x, position.y);
		var factor	= Math.pow(scaleFactor, clicks);

		ctx.translate(point.x, point.y);

		ctx.scale(factor, factor);
		ctx.translate(-point.x, -point.y);
	};

	canvas.addEventListener('mouseup',function(e)
			{
			dragStart = null;

			if (false) {
			// Turn back on to allow click and shift click to zoom in and out...
			if (!dragged) {
			zoom(e.shiftKey ? -1 : 1 );
			}
			}
			}, false);

	function handleScroll(e)
	{
		var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
		if (delta) {
			zoom(delta);
		}

		return e.preventDefault() && false;
	};

	canvas.addEventListener('DOMMouseScroll',	handleScroll, false);
	canvas.addEventListener('mousewheel',		handleScroll, false);


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
		if (center) {
			position = {
				x: canvas.width  / 2,
				y: canvas.height / 2
			};
		}

		zoom(clicks);
	};
}

