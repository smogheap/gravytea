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
				sun:		true,
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
				sun:		true,
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
				sun:		true,
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
				sun:		true,
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
				sun:		true,
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
	}
];

