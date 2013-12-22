gravytea
========

TODO Write the game.

Notes
================================================================================

The game will start by displaying a portion of a small solar system. The player
will be able to pan and zoom within this view. Each planet, moon or other body
will be displayed as a simple solid colored silhouette on a black background
representing space.

A dim line will be displayed for each body in the game, representing it's
trajectory. The line will be bright near the object, and fade the farther it
goes from the body.

The player will control a rocket, which has a fixed mass, and has infinite fuel.
The player can apply thrust at any time and in any direction, but has no other
controls.

Each "level" will have a goal, that will be represented by a gently pulsing line
showing where the player needs to go. For example the goal may be to get into a
specific orbit, or to land on a body, etc.

The scale of the ship will be rather ridiculous, but will make the game play
simple. The ship should be visible even if a reasonably sized planet is visible.


The formula for calculating the surface gravity of a body is:
	g = (GM) / (r*r)

	where M is the mass of the object, r is its radius and G is the
	gravitational constant.

This can also be calculated in a simpler form as a relative force to a body with
a known surface gravity:
	g = m / (r * r)

	where g is the relative surface gravity, m is the relative mass and r is the
	relative mean radius.

Since our universe will not be using real units and will not be realistic this
2nd formula may be preferred. We can set a base planet and calculate everything
relative to that. This will be effectively setting our own gravitational
constant for the game universe.

In our simplified model all bodies will act as a perfect sphere, with all the
mass directly in the center. This means we can replace radius in the equation
above with the distance from the center of the body to determine the effective
gravitational force at any given point.

For simplicity each frame we will calculate the gravitational force on an object
from all other objects, and adjust the velocity vector of the object based on
those values. After these have all been calculated we will apply the velocity
vector for the time period of that frame.

This same method will be used to calculate the trajectory for objects, by
calculating assuming a (larger) frame size where the object will be. This method
will not be 100% accurate, but will hopefully be close enough that no one will
notice.

