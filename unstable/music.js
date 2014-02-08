function UnstableGameMusic()
{
	this.element = document.createElement('audio');

	this.songs = [
		{
			src:		'music/chillinspace.ogg',
			loopstart:	30
		},
		{
			src:		'music/offkilter.ogg',
			loopstart:	0
		}
	];

	document.body.appendChild(this.element);
// TODO	Add an event handler for things like the song ending to start it again
}

UnstableGameMusic.prototype.play = function play()
{
	var x				= Math.floor(Math.random() * this.songs.length);
	var song			= this.songs[x];

	this.playing		= song;
	this.element.src	= song.src;
	this.element.play();
};

UnstableGameMusic.prototype.stop = function stop()
{
	this.element.pause();
	this.element.src = '#';

	delete this.playing;
};

