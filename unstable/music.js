function UnstableGameMusic()

{
	/* There should only ever be one music manager object */
	if (arguments.callee._singletonInstance) {
		return(arguments.callee._singletonInstance);
	}
	arguments.callee._singletonInstance = this;

	this.songs = [
		{
			src:		'music/chillinspace2-noreverb.mp3',
			loopstart:	30
		},
		{
			src:		'music/offkilter2.mp3',
			loopstart:	0
		},
		{
			src:		'music/aquatic.mp3',
			loopstart:	0
		}
	];

	/*
		Find a refrence to each sound effect listed in index.html so they can be
		played easily.
	*/
	this.sounds = {};
	if ((s = document.getElementById('sounds'))) {
		var sounds = s.getElementsByTagName('audio');

		for (var i = 0, sound; sound = sounds[i]; i++) {
			if (!this.sounds[sound.className]) {
				this.sounds[sound.className] = [];
			}
			this.sounds[sound.className].push(sound);
		}
	}


	this.options	= new UnstableGameOptions(this);
	this.music		= document.createElement('audio');

	document.body.appendChild(this.music);
// TODO	Add an event handler for things like the song ending to start it again
	return(this);
}

UnstableGameMusic.prototype.play = function play(src)
{
	var song;

	if (!this.options.get('music')) {
		this.stop();
		return;
	}

	if (src) {
		song = { src: src };
	} else {
		var x	= Math.floor(Math.random() * this.songs.length);
		song	= this.songs[x];
	}

	this.playing			= song;
	this.music.volume		= 1.0;
	this.music.src			= song.src;

	this.music.play();
};

UnstableGameMusic.prototype.resume = function resume()
{
	if (!this.playing) {
		this.play();
	}
};

UnstableGameMusic.prototype.stop = function stop()
{
	// TODO	Fade out over a few seconds by changing the volume...

	this.music.pause();
	this.music.src = '#';

	delete this.playing;
};

UnstableGameMusic.prototype.sfx = function sfx(name)
{
	var sounds;
	var sound;
	var x;

	this.stop();

	if (!this.options.get('sfx')) {
		return;
	}

	if (!(sounds = this.sounds[name])) {
		return;
	}
	x = Math.floor(Math.random() * sounds.length);
	sound = sounds[x];

	/* Play */
	sound.currentTime = 0;
	sound.play();
};


