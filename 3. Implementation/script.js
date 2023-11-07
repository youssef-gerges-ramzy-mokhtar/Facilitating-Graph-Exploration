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
		const r = this.from.radius;
		const x1 = this.from.x;
		const y1 = this.from.y;
		const x2 = this.to.x;
		const y2 = this.to.y;
		
		const angle1 = Math.atan(Math.abs(x2-x1) / Math.abs(y2-y1));
		const a = r*Math.cos(angle1);
		const b = r*Math.sin(angle1);

		let fromX = x1;
		let fromY = y1;
		let toX = x2; // WHY 
		let toY = y2; // WHY

		if (y2 <= y1) { // bottom
			fromY -= a;

			if (x2 >= x1) // right
				fromX += b;
			else
				fromX -= b;
		} 
		else { // top
			fromY += a;

			if (x2 >= x1)
				fromX += b;
			else
				fromX -= b;
		}

		if (y1 <= y2) { // bottom
			toY -= a;
		
			if (x1 >= x2) // right
				toX += b;
			else
				toX -= b;
		}
		else { // top
			toY += a;

			if (x1 >= x2)
				toX += b;
			else
				toX -= b;
		}

		const edge = `
			<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="black" stroke-width="2" />
		`

		svg.insertAdjacentHTML("beforeend", edge);
	}

	getCoords(x1, y1, x2, y2) {

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
];

// const graph = [
// 	[1],
// 	[0]
// ];


const nodeMapper = {
}

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