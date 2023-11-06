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
		const radius = this.from.radius;
		const edge = `
			<line x1="${this.from.x}" y1="${this.from.y}" x2="${this.to.x}" y2="${this.to.y}" stroke="black" stroke-width="2" />
		`

		svg.insertAdjacentHTML("beforeend", edge);
	}
}

// const graph = [
// 	[1, 3],
// 	[0, 2, 4],
// 	[1, 3],
// 	[0, 2],
// 	[1, 2]
// ];

const graph = [
	[1, 2],
	[0, 2],
	[0, 1],
	// [0, 2],
	// [1, 2]
];

const nodeMapper = {
}

for (let i = 0; i < graph.length; i++) {
	const node = new Node(i);
	nodeMapper[i] = node;
	node.display();
}

for (let i = 0; i < 5; i++) {
	for (let j = 0; j < graph[i].length; j++) {
		const from = nodeMapper[i];
		const toIdx = graph[i][j];
		const to = nodeMapper[toIdx];

		const edge = new EdgeUi(from, to);
		edge.display();
	}
}