chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('unstable/index.html', {
		'bounds': {
			'width':	400,
			'height':	500
		}
	});
});

