UnstableLevels = [
	{
		name: 'Get moving',
		hint: [
			'That planet looks like it is going to crash into the sun!',
			'That could be bad.',
			'Maybe you should move it a bit further away...',

			'Try dragging the planet to the right until it\'s path forms a circle.',
			'When you\'re pretty sure it won\'t crash hit the play button.'
		],

		bodies: [
			/* A Sun */
			{
				p: [ 0, 0, true ],
				v: [ 0, 0, true ],
				r: 50,
				t: 's',
				d: 0.09
			},

			/* A planet */
			{
				position:	[ 140, 0 ],
				velocity:	[ 0, 7, true ],
				radius:		15,

				goal:		3
			}
		]
	}, {
		name: 'Getting up to speed',
		hint: [
			'Oh look, another planet about to crash into the sun!',
			'This time try making it go a bit faster.',
			'Drag the velocity indicator to change the speed of the planet.',
			'Just drag the velocity indicator down until the path forms a circle around the sun.',
			'Each orbit will fill in one of the indicators around the planet. When they are all full you\'ve beaten the level.'
		],

		bodies: [
			/* A Sun */
			{
				position:	[ 0, 0, true ],
				velocity:	[ 0, 0, true ],
				radius:		50,
				type:		'sun',
				density:	0.09
			},

			/* A planet */
			{
				position:	[ 140, 0, true ],
				velocity:	[ 0, 7 ],
				radius:		15,

				goal:		3
			}
		]
	}, {
		name: 'Let\'s have a race',
		hint: [
			'These planets are identical, except for their position.',
			'The closer a planet is to the sun the faster it needs to go to maintain a stable orbit.',
			'Drag down on the velocity indicators until each planet has a circular path, that does\'t hit any others.'
		],

		bodies: [
			/* A Sun */
			{
				position:	[ -250, 0, true ],
				velocity:	[ 0, 0, true ],
				radius:		70,
				type:		'sun',
				density:	0.09
			},

			{
				position:	[ -50, 0, true ],
				velocity:	[ 0, 7 ],
				radius:		15,

				goal:		5
			},

			{
				position:	[ 50, 0, true ],
				velocity:	[ 0, 7 ],
				radius:		15,

				goal:		4
			},

			{
				position:	[ 150, 0, true ],
				velocity:	[ 0, 7 ],
				radius:		15,

				goal:		3
			},

			{
				position:	[ 250, 0, true ],
				velocity:	[ 0, 7 ],
				radius:		15,

				goal:		2
			}
		]
	}, {
		name: 'On your own',
		hint: [
			'In this level you can move the planets, and change their velocity.',
			'Find a solution that you like.',
			'Good luck!'
		],

		bodies: [
			/* A Sun */
			{
				position:	[ 0, 0, true ],
				velocity:	[ 0, 0, true ],
				radius:		50,
				type:		'sun',
				density:	0.15
			},

			/* A bit larger rocky planet */
			{
				position:	[ 0, 220 ],
				velocity:	[ -3, 0 ],
				radius:		25,

				goal:		9
			},

			/* Another rocky planet */
			{
				position:	[ 300, 0 ],
				velocity:	[ 5, 5 ],
				radius:		15,

				goal:		7
			}
		]
	}, {
		name: 'A bit of a challenge',
		bodies: [
			/* A Sun */
			{
				position:	[ 0, 0, true ],
				velocity:	[ 0, 0, true ],
				radius:		50,
				type:		'sun',
				density:	0.15
			},

			{
				position:	[ 0, 220 ],
				velocity:	[ -3, 0 ],
				radius:		35,

				goal:		20
			},

			{
				position:	[ 300, 0 ],
				velocity:	[ 5, 5 ],
				radius:		15,

				goal:		5
			},

			{
				position:	[ -350, -300 ],
				velocity:	[ 2, 2 ],
				radius:		20,

				goal:		4
			}
		]
	}, {
		name: 'A Trio',
		bodies: [
			/* A Sun */
			{
				position:	[ 0, 0, true ],
				velocity:	[ 0, 0, true ],
				radius:		70,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 0, 300, true ],
				velocity:	[ 0, 0 ],
				radius:		20,

				goal:		7
			},
			{
				position:	[ -260, -150, true ],
				velocity:	[ 0, 0 ],
				radius:		20,

				goal:		7
			},
			{
				position:	[ 260, -150, true ],
				velocity:	[ 0, 0 ],
				radius:		20,

				goal:		7
			}
		]
	}, {
		name: 'Binary',
		bodies: [
			/* A Sun */
			{
				position:	[ -200, 0, true ],
				velocity:	[ 0, 0 ],
				radius:		35,
				sun:		true,
				density:	0.35,
				goal:		10
			},

			{
				position:	[ 200, 0, true ],
				velocity:	[ 0, 0 ],
				radius:		35,
				sun:		true,
				density:	0.35,
				goal:		10
			}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Stethoscope',
		bodies: [
			{"p":[308,178],"v":[-15,3.375],"r":50,"d":0.09,"t":"s","g":0},
			{"p":[-211,-225],"v":[-6.25,-1.25],"r":15,"d":0.01,"t":"p","g":3},
			{"p":[-149,74],"v":[0,0],"r":30,"d":1.5,"t":"b","g":0},
			{"p":[-32,-222],"v":[5.625,-3.375],"r":15,"d":0.01,"t":"p","g":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Snail',
		bodies: [
			{"p":[-49,6],"v":[0,0,true],"r":100,"d":0.09,"t":"s","g":0},
			{"p":[215,-134],"v":[17.5,19.25,true],"r":15,"d":0.01,"t":"p","g":5},
			{"p":[311,-130],"v":[5,20.125,true],"r":15,"d":0.01,"t":"p","g":5}
		]
	}, {
		name: 'Three is a crowd',
		bodies: [
			/* A Sun */
			{
				position:	[ -200, 0, true ],
				velocity:	[ 0, -10, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 200, 0, true ],
				velocity:	[ 0, 10, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 0, 0 ],
				velocity:	[ 0, 0 ],
				radius:		15,
				goal:		15
			}
		]
	}, {
		name: 'Five is a party',
		bodies: [
			/* A Sun */
			{
				position:	[ -200, 0, true ],
				velocity:	[ 0, -20, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 200, 0, true ],
				velocity:	[ 0, 20, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 0, -200, true ],
				velocity:	[ 20, 0, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 0, 200, true ],
				velocity:	[ -20, 0, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 0, 0 ],
				velocity:	[ 0, 0 ],
				radius:		15,
				goal:		5
			}
		]
	}, {
		name: 'I\'m outta here',
		bodies: [
			/* A Sun */
			{
				position:	[ 0, 0, true ],
				velocity:	[ -5, -5, true ],
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	[ 200, 0 ],
				velocity:	[ 0, 0 ],
				radius:		10,
				goal:		8
			},

			{
				position:	[ 0, -200 ],
				velocity:	[ 0, 0 ],
				radius:		15,
				goal:		6
			},

			{
				position:	[ 0, 200 ],
				velocity:	[ 0, 0 ],
				radius:		5,
				goal:		10
			}
		]
	}, {
		author: 'Anthony Howe',
		name: 'Stitching',
		bodies: [
			{
				"position":{"x":-198,"y":16, locked: true},
				"velocity":{"x":12.875,"y":-9.625, locked: true},
				"radius":59,
				"type": 'sun'
			},

			{
				"position":{"x":6,"y":6, locked: true},
				"velocity":{"x":13.125,"y":-27.375, locked: true},
				"radius":32,
				"type": 'sun'
			},
			{
				"position":{"x":-69.87227630615234,"y":147.25770568847656},
				"velocity":{"x":0,"y":0},
				"radius":15,
				goal: 6
			}
		]
	}, {
		name: 'Buddies',
		bodies: [
			{
				"position":{"x":0,"y":0, locked: true},
				"velocity":{"x":0,"y":0, locked: true},
				"radius":50,
				"density":0.09,
				"type": 'sun',
				"goal":0
			},
			{
				"position":{"x":84,"y":115, locked: true},
				"velocity":{"x":0,"y":0},
				"radius":15,
				"color":5,
				"goal":3
			},
			{
				"position":{ "x":22, "y":136, locked:true},
				"velocity":{"x":0,"y":0},
				"radius":15,
				"color":25,
				"goal":3
			},
			{
				"position":{"x":-45,"y":134, locked:true},
				"velocity":{"x":0,"y":0},
				"radius":15,
				"color":125,
				"goal":3
			}
		]
	}, {
		name: 'Going Surfing',
		bodies: [
			{
				"position":{ "x":203, "y":-268, locked: true },
				"velocity":{ "x":0, "y":0, locked: true },
				"radius":24,
				"color":"#D28D5E",
				"goal":8
			},
			{
				"position":{ "x":305, "y":-359, locked:true },
				"velocity":{ "x":1.375000e+00, "y":2.125000e+00, locked:true },
				"radius":12,
				"color":"#6CE240",
				"goal":8
			},
			{
				"position":{ "x":-71, "y":77 },
				"velocity":{ "x":0, "y":0 },
				"radius":65,
				"type": 'sun',
				"goal":0
			}
		]
	}, {
		author: 'Anthony Howe',
		name: 'Eye of the Storm',
		bodies: [
			{"position":{"x":0,"y":0, locked: true},"velocity":{"x":0,"y":0, locked: true},"radius":50,"density":0.09,"type":'sun',"goal":0},
			{"position":{"x":-207,"y":-158},"velocity":{"x":10,"y":-5},"radius":15,"color":"#6CE240","goal":4},
			{"position":{"x":204,"y":-156},"velocity":{"x":6.125,"y":7.125},"radius":15,"color":"#549075","goal":4},
			{"position":{"x":-201,"y":163},"velocity":{"x":-8.125,"y":- 9.125},"radius":28,"color":"#66DFCC","goal":5},
			{"position":{"x":212,"y":158},"velocity":{"x":-7.375,"y":4.875},"radius":15,"color":"#D9E27A","goal":4}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Cradle Robber',
		bodies: [
			{"position":{"x":0,"y":0, locked: true},"velocity":{"x":0,"y":0, locked:true },"radius":50,"density":0.09,"type":'sun',"goal":0},
			{"position":{"x":150,"y":200, locked: true},"velocity":{"x":0,"y":0},"radius":15,"color":"#E04421","goal":3},
			{"position":{"x":50,"y":200, locked: true},"velocity":{"x":0,"y":0},"radius":15,"color":"#66DFCC","goal":3},
			{"position":{"x":-150,"y":200, locked: true},"velocity":{"x":0,"y":0},"radius":15,"color":"#A9DE9C","goal":3},
			{"position":{"x":-50,"y":200, locked: true},"velocity":{"x":0,"y":0},"radius":15,"color":"#45843E","goal":3}
		]
	}, {
		name: 'Lopsided',
		bodies: [
			{
				position: { x: 0, y: 0, locked: true },
				velocity: { x: 0, y: 0, locked: true },
				radius: 25,
				density: 1.5,
				type: 'blackhole',
				goal: 0
			}, {
				position: { x: -150, y: 0, locked: true },
				velocity: { x: 0, y: 0 },
				radius: 35,
				goal: 7
			}, {
				position: { x: 150, y: 0, locked: true },
				velocity: { x: 0, y: 0 },
				radius: 5,
				goal: 7
			}
		]
	}, {
		author: 'Anthony Howe',
		name: 'Lemon Twist',
		bodies: [
			{"position":{"x":-345,"y":-8},"velocity":{"x":-0.75,"y":-3.75},"radius":53,"density":0.09,"sun":true,"goal":0},
			{"position":{"x":121,"y":-8},"velocity":{"x":-3.839487075805664,"y":6.34871768951416},"radius":32,"density":0.09,"sun":true,"goal":0},
			{"position":{"x":203.5505828857422,"y":-295.1242980957031},"velocity":{"x":4.71589469909668,"y":6.484357833862305},"radius":18,"color":"#A9DE9C","goal":5}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Bad Dog',
		bodies: [
			{"position":{"x":0,"y":0},"velocity":{"x":0,"y":0},"radius":50,"density":0.09,"type":"sun","color":"#4E89D5","goal":0},
			{"position":{"x":-70,"y":-90,"locked":true},"velocity":{"x":-18,"y":-12},"radius":25,"type":"planet","color":"#6CE240","goal":3},
			{"position":{"x":70,"y":-90},"velocity":{"x":18,"y":-12},"radius":25,"type":"planet","color":"#549075","goal":3},
			{"position":{"x":-155,"y":145},"velocity":{"x":0,"y":9},"radius":15,"type":"planet","color":"#66DFCC","goal":3},
			{"position":{"x":155,"y":145,"locked":true},"velocity":{"x":0,"y":9},"radius":15,"type":"planet","color":"#D9E27A","goal":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Twelve Angry Orbits',
		bodies: [
			{"position":{"x":0,"y":0,"locked":true},"velocity":{"x":0,"y":0,"locked":true},"radius":50,"density":0.09,"type":"sun","color":"#4E89D5","goal":0},
			{"position":{"x":-50,"y":-200},"velocity":{"x":0,"y":-10,"locked":true},"radius":20,"type":"planet","color":"#E04421","goal":4},
			{"position":{"x":50,"y":-200},"velocity":{"x":0,"y":-10,"locked":true},"radius":20,"type":"planet","color":4,"goal":4},
			{"position":{"x":-220,"y":-33},"velocity":{"x":-5.25,"y":-7.75,"locked":true},"radius":10,"type":"planet","color":8,"goal":4}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Have a nice day',
		bodies: [
			{"position":{"x":-150,"y":-100,"locked":true},"velocity":{"x":-8,"y":-1},"radius":50,"density":0.09,"type":"sun","color":"#4E89D5","goal":0},
			{"position":{"x":150,"y":-100,"locked":true},"velocity":{"x":8,"y":-1},"radius":50,"density":0.09,"type":"sun","color":"#6CE240","goal":0},
			{"position":{"x":-210,"y":100},"velocity":{"x":8,"y":15,"locked":true},"radius":15,"type":"planet","color":"#549075","goal":3},
			{"position":{"x":210,"y":100},"velocity":{"x":-8,"y":15,"locked":true},"radius":15,"type":"planet","color":"#66DFCC","goal":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Fangs',
		bodies: [
			{"position":{"x":-17,"y":-250},"velocity":{"x":0,"y":0},"radius":25,"density":1.5,"type":"blackhole","color":"#4E89D5","goal":0},
			{"position":{"x":-155,"y":3.5},"velocity":{"x":0.25,"y":16.375,"locked":true},"radius":15,"type":"planet","color":"#E04421","goal":3},
			{"position":{"x":-103,"y":1.5},"velocity":{"x":0.75,"y":18.625,"locked":true},"radius":15,"type":"planet","color":"#66DFCC","goal":3},
			{"position":{"x":63,"y":2.5},"velocity":{"x":0.625,"y":18.5,"locked":true},"radius":15,"type":"planet","color":"#A9DE9C","goal":3},
			{"position":{"x":117,"y":2.5},"velocity":{"x":0.875,"y":16.25,"locked":true},"radius":15,"type":"planet","color":"#45843E","goal":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Snowman',
		bodies: [
			{"p":[0,5],"v":[0,0],"r":50,"d":0.02,"t":"s","g":4},
			{"p":[0,-90,true],"v":[0,0,true],"r":30,"d":0.09,"t":"s","g":4},
			{"p":[0,-150],"v":[0,0],"r":20,"d":0.09,"t":"s","g":4}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Wait, come back!',
		bodies: [
			{"p":[-200,0,true],"v":[2.8533058166503906,-0.9349170327186584],"r":15,"d":0.01,"t":"p","g":5},
			{"p":[0,-200],"v":[0.875,2.6683883666992188],"r":15,"d":0.01,"t":"p","g":5},
			{"p":[0,200],"v":[-0.7716943025588989,-3.1033058166503906],"r":15,"d":0.01,"t":"p","g":5},
			{"p":[200,0,true],"v":[-2.9783058166503906,0.7499999403953552],"r":15,"d":0.01,"t":"p","g":5}
		]
	}, {
		author: 'Anthony Howe',
		name: 'Weaving',
		bodies:[
			{"p":[-7,4,true],"v":[0.13379508256912231,-11.359407424926758,true],"r":65,"d":0.09,"t":"s","g":0},
			{"p":[-568.6982269287109,-16.87073576450348,true],"v":[2.6517105102539062,-27.36913537979126,true],"r":39,"d":0.09,"t":"s","g":0},
			{"p":[276,1,true],"v":[-3.0122323036193848,-28.575539588928223,true],"r":28,"d":0.09,"t":"s","g":0},
			{"p":[-572.67138671875,333.594970703125],"v":[0,0],"r":10,"d":0.01,"t":"p","g":10},
			{"p":[283.55572509765625,333.594970703125],"v":[0,0],"r":10,"d":0.01,"t":"p","g":10}
		]
	}, {
		name: 'Out of Nowhere',
		bodies: [
			{"p":[0, 0], "v": [0,0,true], "r":65, "t": "s"},
			{"p":[-5000,-5000, true], "v":[20,20, true], "r":5, "g": 10}
		]
	}, {
		author: 'Garret Downs',
		name: 'Flower',
		bodies: [
			{"p":[-267,-6],"v":[0,5.5],"r":50,"d":0.09,"t":"s","g":0},
			{"p":[382,-9.5],"v":[0.125,-5.25],"r":50,"d":0.09,"t":"s","g":0},
			{"p":[53.54320299625397,-120.51522064208984],"v":[4.935789585113525,-14.69332218170166],"r":15,"d":0.01,"t":"p","g":10},
			{"p":[37.20277786254883,4.4289021492004395],"v":[-0.6643352508544922,18.822834849357605],"r":15,"d":0.01,"t":"p","g":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'apple',
		bodies: [
			{"p":[0,0,true],"v":[0,3],"r":50,"d":0.09,"t":"s","g":0},
			{"p":[20,-140],"v":[15,-10,true],"r":15,"d":0.01,"t":"p","g":8},
			{"p":[-20,-140],"v":[-15,-10,true],"r":15,"d":0.01,"t":"p","g":8},
			{"p":[35,-275],"v":[-1,0],"r":10,"d":0.01,"t":"p","g":8}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'treble trouble',
		bodies: [
			{"p":[0,111,true],"v":[0,2],"r":50,"d":0.09,"t":"s","g":0},
			{"p":[0,-87,true],"v":[0,-14],"r":25,"d":0.09,"t":"s","g":0},
			{"p":[0,-256,true],"v":[5,0],"r":15,"d":0.01,"t":"p","g":6}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'ring around the rosy',
		bodies: [
			{"p":[0,0,true],"v":[0,0,true],"r":25,"d":1.5,"t":"b","g":0},
			{"p":[-253,-91],"v":[5.5,-8.625,true],"r":15,"d":0.01,"t":"p","g":12},
			{"p":[435,119],"v":[-2.125,6.5,true],"r":20,"d":0.01,"t":"p","g":12}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'scrambled egg',
		bodies: [
			{"p":[-100,0,true],"v":[0,20,true],"r":51,"d":0.09,"t":"s","g":0},
			{"p":[100,0,true],"v":[0,-10,true],"r":25,"d":1.53,"t":"b","g":0},
			{"p":[-520,1],"v":[0,0],"r":15,"d":0.01,"t":"p","g":8}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'peace',
		bodies: [
			{"p":[0,0,true],"v":[0,0,true],"r":25,"d":1.5,"t":"b","g":0},
			{"p":[260,170,true],"v":[0,0],"r":50,"d":0.09,"t":"s","g":3},
			{"p":[0,-300,true],"v":[0,0],"r":50,"d":0.09,"t":"s","g":3},
			{"p":[-260,170,true],"v":[0,0],"r":50,"d":0.09,"t":"s","g":3}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'smogheap',
		bodies: [
			{"p":[-50,180,true],"v":[0,-14],"r":15,"d":0.01,"t":"p","g":3},
			{"p":[50,180,true],"v":[0,-14],"r":15,"d":0.01,"t":"p","g":3},
			{"p":[0,180],"v":[0,-24,true],"r":15,"d":0.01,"t":"p","g":3},
			{"p":[175,-150,true],"v":[0,0],"r":25,"d":1.5,"t":"b","g":0},
			{"p":[-175,-150,true],"v":[0,0],"r":25,"d":1.5,"t":"b","g":0}
		]
	}, {
		author: 'Owen Swerkstrom',
		name: 'Endurance',
		bodies: [
			{"position":{"x":0,"y":0},"velocity":{"x":0,"y":0},"radius":50,"density":0.09,"type":"sun","goal":0},
			{"position":{"x":-400,"y":0,"locked":true},"velocity":{"x":0,"y":10,"locked":true},"radius":20,"type":"planet","goal":18},
			{"position":{"x":400,"y":0,"locked":true},"velocity":{"x":0,"y":-10,"locked":true},"radius":20,"type":"planet","goal":18},
			{"position":{"x":0,"y":-200,"locked":true},"velocity":{"x":-15,"y":0},"radius":15,"type":"planet","goal":18},
			{"position":{"x":0,"y":200,"locked":true},"velocity":{"x":15,"y":0},"radius":15,"type":"planet","goal":18}
		]
	}
];

