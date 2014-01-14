function toRad(angle)
{
	return(angle * (Math.PI / 180));
}

function V(x, y)
{
	switch (typeof(x)) {
		case 'number':
			this.x = x;
			this.y = y;

			break;

		case 'object':
			this.x = x.x;
			this.y = x.y;
			break;
	}

}

V.prototype.toString = function()
{
	return('[' +
			Math.floor(this.x * 100) / 100
		+ ',' +
			Math.floor(this.y * 100) / 100
		+ ']');
};

V.prototype.compare = function(v)
{
	if (this.x == v.x && this.y == v.y) {
		return(true);
	} else {
		return(false);
	}
};

V.prototype.tx = function(v)
{
	switch (typeof(v)) {
		case 'number':	this.x += v;	this.y += v;	break;
		case 'object':	this.x += v.x;	this.y += v.y;	break;
	}
};

V.prototype.multiply = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x * v,	this.y * v	));
		case 'object':	return(new V(this.x * v.x,	this.y * v.y));
		default:		return(null);
	}
};

V.prototype.divide = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x / v,	this.y / v	));
		case 'object':	return(new V(this.x / v.x,	this.y / v.y));
		default:		return(null);
	}
};

V.prototype.add = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x + v,	this.y + v	));
		case 'object':	return(new V(this.x + v.x,	this.y + v.y));
		default:		return(null);
	}
};

V.prototype.subtract = function(v)
{
	switch (typeof(v)) {
		case 'number':	return(new V(this.x - v,	this.y - v	));
		case 'object':	return(new V(this.x - v.x,	this.y - v.y));
		default:		return(null);
	}
};

V.prototype.dot = function(v)
{
	return(this.x * v.x + this.y * v.y);
};

V.prototype.length = function()
{
	return(Math.sqrt((this.x * this.x) + (this.y * this.y)));
};

V.prototype.distance = function(v)
{
	return(this.subtract(v).length());
};

V.prototype.angle = function(v)
{
	var d = this.subtract(v);

	// return(Math.atan2(d.y, d.x) * (180 / Math.PI));
	return(Math.atan2(d.y, d.x));
};

V.prototype.normal = function()
{
	var s = 1 / this.length();

	return(new V(this.x * s, this.y * s));
};

V.prototype.rotate = function(angle)
{
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	return(new V(
		this.x * c - this.y * s,
		this.x * s + this.y * c
	));
};


