UnstableLevels = [
	{
		name: 'Get moving',
		hint: [
			'That planet looks like it is going to crash into the sun!',
			'That could be bad.',
			'Maybe you should move it a bit further away...'
		],

		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(0, 0, true),
				radius:		50,
				type:		'sun',
				density:	0.09
			},

			/* A planet */
			{
				position:	new V(140, 0),
				velocity:	new V(0, 7, true),
				radius:		15,

				goal:		3
			}
		]
	}, {
		name: 'Getting up to speed',
		hint: [
			'Oh look, another planet about to crash into the sun!',
			'This time try making it go a bit faster.',
			'Drag the velocity indicator to change the speed of the planet.'
		],

		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(0, 0, true),
				radius:		50,
				type:		'sun',
				density:	0.09
			},

			/* A planet */
			{
				position:	new V(140, 0, true),
				velocity:	new V(0, 7),
				radius:		15,

				goal:		3
			}
		]
	}, {
		name: 'Let\'s have a race',
		hint: [
			'These planets are identical, except for their position. The',
			'closer a planet is to the sun the faster it needs to go to',
			'get a stable orbit.'
		],

		bodies: [
			/* A Sun */
			{
				position:	new V(-250, 0, true),
				velocity:	new V(0, 0, true),
				radius:		70,
				type:		'sun',
				density:	0.09
			},

			{
				position:	new V(-50, 0, true),
				velocity:	new V(0, 7),
				radius:		15,

				goal:		5
			},

			{
				position:	new V(50, 0, true),
				velocity:	new V(0, 7),
				radius:		15,

				goal:		4
			},

			{
				position:	new V(150, 0, true),
				velocity:	new V(0, 7),
				radius:		15,

				goal:		3
			},

			{
				position:	new V(250, 0, true),
				velocity:	new V(0, 7),
				radius:		15,

				goal:		2
			}
		]
	}, {
		name: 'On your own',
		hint: [
			'Now you are on your own.',
			'Good luck!'
		],

		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(0, 0, true),
				radius:		50,
				type:		'sun',
				density:	0.15
			},

			/* A bit larger rocky planet */
			{
				position:	new V(0, 220),
				velocity:	new V(-3, 0),
				radius:		25,

				goal:		9
			},

			/* Another rocky planet */
			{
				position:	new V(300, 0),
				velocity:	new V(5, 5),
				radius:		15,

				goal:		7
			}
		]
	}, {
		name: 'A bit of a challenge',
		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(0, 0, true),
				radius:		50,
				type:		'sun',
				density:	0.15
			},

			{
				position:	new V(0, 220),
				velocity:	new V(-3, 0),
				radius:		35,

				goal:		20
			},

			{
				position:	new V(300, 0),
				velocity:	new V(5, 5),
				radius:		15,

				goal:		5
			},

			{
				position:	new V(-350, -300),
				velocity:	new V(2, 2),
				radius:		20,

				goal:		4
			}
		]
	}, {
		name: 'A Trio',
		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(0, 0, true),
				radius:		70,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(0, 300, true),
				velocity:	new V(0, 0),
				radius:		20,

				goal:		7
			},
			{
				position:	new V(-260, -150, true),
				velocity:	new V(0, 0),
				radius:		20,

				goal:		7
			},
			{
				position:	new V(260, -150, true),
				velocity:	new V(0, 0),
				radius:		20,

				goal:		7
			}
		]
	}, {
		name: 'Binary',
		bodies: [
			/* A Sun */
			{
				position:	new V(-200, 0, true),
				velocity:	new V(0, 0),
				radius:		35,
				sun:		true,
				density:	0.35,
				goal:		10
			},

			{
				position:	new V(200, 0, true),
				velocity:	new V(0, 0),
				radius:		35,
				sun:		true,
				density:	0.35,
				goal:		10
			}
		]
	}, {
		name: 'Three is a crowd',
		bodies: [
			/* A Sun */
			{
				position:	new V(-200, 0, true),
				velocity:	new V(0, -10, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(200, 0, true),
				velocity:	new V(0, 10, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(0, 0),
				velocity:	new V(0, 0),
				radius:		15,
				goal:		15
			}
		]
	}, {
		name: 'Five is a party',
		bodies: [
			/* A Sun */
			{
				position:	new V(-200, 0, true),
				velocity:	new V(0, -20, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(200, 0, true),
				velocity:	new V(0, 20, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(0, -200, true),
				velocity:	new V(20, 0, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(0, 200, true),
				velocity:	new V(-20, 0, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(0, 0),
				velocity:	new V(0, 0),
				radius:		15,
				goal:		5
			}
		]
	}, {
		name: 'I\'m outta here',
		bodies: [
			/* A Sun */
			{
				position:	new V(0, 0, true),
				velocity:	new V(-5, -5, true),
				radius:		35,
				sun:		true,
				density:	0.35
			},

			{
				position:	new V(200, 0),
				velocity:	new V(0, 0),
				radius:		10,
				goal:		8
			},

			{
				position:	new V(0, -200),
				velocity:	new V(0, 0),
				radius:		15,
				goal:		6
			},

			{
				position:	new V(0, 200),
				velocity:	new V(0, 0),
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
	}
];

