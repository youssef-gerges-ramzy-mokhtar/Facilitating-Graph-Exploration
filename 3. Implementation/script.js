"use strict";

function print(anything, ...rest) {
	console.log(anything, ...rest);
}

/*
Recipe:
1. create a class for a Node
	- Test that this class can link to the SVG element on the HTML
	- Test that the class provides functionality like changing the Node Value, Color, Position etc..

2. create a class for an EdgeUI
	- The EdgeUI class is responsible to draw a line between 2 nodes no matter where are there positions on the Canvas
		[.] You need to figure out how to make the (x, y) coords of the line start from the surface of the node not the center
	- Test that this class can link to the SVG element on the HTML
	- Test that the class provides functionality like changing the edge stroke size, color, etc...

3. Hardcode a small graph represented as an Adjacency List
4. Consider abstracting away the usage between the SVG Tags and the Node & EdgeUI Classes
5. Handle the case when changing the node position and calling the draw() method the old node should be deleted and the new node should be redrawn

*/

const svg = document.getElementById("graph_canvas");

class Node {
	constructor(value, col, x, y) {
		this.value = value;
		this.col = col;
		this.radius = 19;
		this.x = x;
		this.y = y;

		if (this.x == undefined)
			this.x = this.radius + 712 * Math.random();
		if (this.y == undefined)
			this.y = this.radius + 312 * Math.random();
		if (this.col == undefined)
			this.col = "white";
	}

	display() {
		const node = `
			<circle cx="${this.x}" cy="${this.y}" r="${this.radius}" fill="${this.col}" stroke-width="2" stroke="black" />
			<text x="${this.x}" y="${this.y}" text-anchor="middle" alignment-baseline="middle" stroke="#000">${this.value}</text>
		`

		svg.insertAdjacentHTML("beforeend", node);
	}
}

class EdgeUi {
	constructor(from, to) {
		this.from = from;
		this.to = to;
	}

	display() {
		const x1 = this.from.x;
		const y1 = this.from.y;
		const x2 = this.to.x;
		const y2 = this.to.y;
		
		const [fromX, fromY] = this.getCoords(x1, y1, x2, y2);
		const [toX, toY] = this.getCoords(x2, y2, x1, y1);

		const edge = `
			<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="black" stroke-width="2" />
		`

		svg.insertAdjacentHTML("beforeend", edge);
	}

	getCoords(x1, y1, x2, y2) {
		const r = this.from.radius;
		const angle = Math.atan(Math.abs(x2-x1) / Math.abs(y2-y1));
		const a = r*Math.cos(angle);
		const b = r*Math.sin(angle);

		let x = x1;
		let y = y1;

		// Here we are getting the coordinates at the surface of the circle, but there are 4 qudrants in the circle {top-left, top-right, bottom-left, bottom-right}
		// That is why we are handling each of those cases separately to adjust the (x, y) coordinates at the circle surface
		if (y2 <= y1) // bottom
			y -= a;
		else // top
			y += a;

		if (x2 >= x1) // right
			x += b;
		else // left
			x -= b;

		return [x, y];
	}
}

// const graph = [
// 	[1, 3],
// 	[0, 2, 4],
// 	[1, 3],
// 	[0, 2],
// 	[1, 2]
// ];

// const graph = [
// 	[1, 2],
// 	[0, 2],
// 	[0, 1],
// ];

// const graph = [
// 	[1],
// 	[0]
// ];

const graph = [
	[1],
	[0, 2],
	[1, 3],
	[2, 4],
	[3]
]

const nodeMapper = {}

for (let i = 0; i < graph.length; i++) {
	const node = new Node(i);
	nodeMapper[i] = node;
	node.display();
}

for (let i = 0; i < graph.length; i++) {
	for (let j = 0; j < graph[i].length; j++) {
		const from = nodeMapper[i];
		const toIdx = graph[i][j];
		const to = nodeMapper[toIdx];

		const edge = new EdgeUi(from, to);
		edge.display();
	}
}