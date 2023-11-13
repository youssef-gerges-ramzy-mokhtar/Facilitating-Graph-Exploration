"use strict";

function print(anything, ...rest) {
	console.log(anything, ...rest);
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

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

3. Consider abstracting away the usage between the SVG Tags and the Node & EdgeUI Classes

*/

const svg = document.getElementById("graph_canvas");

class NodeUi {
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

	setX(x) {
		this.x = this.#validatePos(x, 750 - this.radius);
	}

	setY(y) {
		this.y = this.#validatePos(y, 350 - this.radius);
	}

	#validatePos(pos, maxRange) {
		if (pos < this.radius)
			return this.radius;
		if (pos > maxRange)
			return maxRange;

		return pos;
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

	getEdgeLength() {
		return Math.sqrt(Math.pow(this.from.x - this.to.x, 2) + Math.pow(this.from.y - this.to.y, 2));
	}
}

class GraphUi {
	/*
	Thoughts:
		- Might want to remove the nodeToNum Mapper and the numToNode Mapper
			[.] Reason can simply create the graphAdjList to map NodeUi objects to an array of NodeUi objects
			[.] graphAdjList: Map<NodeUi, Array<NodeUi>>, this transformation will happen in the reading functions

		- Might want to keep the graphAdjList without change to allow other code/algorithms that will need to deal with the graph 
		  to have a standard view of the graph which is a simple Adjacency List Representation
	*/
	constructor() {
		this.nodeToNum = {};
		this.numToNode = {};
		this.graphAdjList = [];

		this.k1 = 10;
		this.k2 = Math.pow(1500, 2);
		this.l = 130;
	}

	readAdjacencyMatrix(adjMatrix) {
		// to implement later
	}

	readAdjacencyList(adjList) {
		this.graphAdjList = adjList;
		this.#updateGraphMapping();
	}

	readEdgeList() {
		// to implement later
	}

	calcForce(v) {
		let fx = 0, fy = 0;

		const node = this.numToNode[v];
		for (const neighbour of this.graphAdjList[v]) {
			const neighbourNode = this.numToNode[neighbour];
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			print(edgeLength)

			const force = this.k1 * (edgeLength - this.l);
			fx += force * ((neighbourNode.x - node.x) / edgeLength);
			fy += force * ((neighbourNode.y - node.y) / edgeLength);
		}

		for (let i = 0; i < this.graphAdjList.length; i++) {
			if (i == v)
				continue;

			const neighbourNode = this.numToNode[i];
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			const force = this.k2 / Math.pow(edgeLength, 2);
			fx += force * ((node.x - neighbourNode.x) / edgeLength);
			fy += force * ((node.y - neighbourNode.y) / edgeLength);
		}

		return [fx, fy];
	}

	async drawGraph() {
		let rate = 0.01;

		for (let i = 0; i < 10_000; i++) {
			for (let v = 0; v < this.graphAdjList.length; v++) {
				this.displayGraph();

				const [xForce, yForce] = this.calcForce(v);
				const x = rate*xForce;
				const y = rate*yForce;

				const node = this.numToNode[v];
				node.setX(node.x + x);
				node.setY(node.y + y);

				await sleep(10);
			}
		}
	}

	displayGraph() {
		svg.innerHTML = "<rect width='750' height='350' style='fill:rgb(255,255,255);stroke-width:10;stroke:rgb(0,0,0)'/>";
		for (let i = 0; i < this.graphAdjList.length; i++) {
			const node = this.numToNode[i];
			node.display();
		}

		for (let node = 0; node < this.graphAdjList.length; node++) {
			for (let neighbour of this.graphAdjList[node]) {
				const fromNode = this.numToNode[node];
				const toNode = this.numToNode[neighbour];
				const edge = new EdgeUi(fromNode, toNode);
				edge.display();
			}
		}
	}

	#updateGraphMapping() {
		this.nodeToNum = this.numToNode = {};
		for (let i = 0; i < this.graphAdjList.length; i++) {
			const node = new NodeUi(i);
			this.numToNode[i] = node;
			this.nodeToNum[node] = i;
		}
	}
}

async function main() {
	const graphSamples = [
	// 	[
	// 		[1, 3],
	// 		[0, 2, 4],
	// 		[1, 3],
	// 		[0, 2],
	// 		[1, 2]
	// 	],

		// [
		// 	[1, 2],
		// 	[0, 2],
		// 	[0, 1],
		// ],

		// [
		// 	[1],
		// 	[0]
		// ],

		// [
		// 	[1],
		// 	[0, 2],
		// 	[1, 3],
		// 	[2, 4],
		// 	[3]
		// ],

		// [
		// 	[],
		// 	[],
		// 	[],
		// 	[],
		// 	[],
		// ],

		// [
		// 	[],
		// 	[],
		// 	[],
		// ],

		// [
		// 	[1],
		// 	[0, 2],
		// 	[1, 3],
		// 	[1, 2]
		// ],

		// [
		// 	[1, 2],
		// 	[0, 2],
		// 	[1, 3, 0],
		// 	[1, 2]
		// ],

		[
			[1, 2, 3, 4],
			[0, 2, 3, 4],
			[0, 1, 3, 4],
			[0, 1, 2, 4],
			[0, 1, 2, 3]
		],
	];

	const g = new GraphUi();
	for (const graph of graphSamples) {
		g.readAdjacencyList(graph);
		g.drawGraph();		
		await sleep(3500);
	}
}
main();