"use strict";

import {print, sleep} from ".././utils/utils.mjs";
import {DRAWING_CANVAS, Circle, Line, clearCanvas} from ".././svg/svg.mjs";

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

		new Line(fromX, fromY, toX, toY).display();
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

export class GraphUi {
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

		for (let i = 0; i < 500; i++) {
			for (let v = 0; v < this.graphAdjList.length; v++) {
				this.displayGraph();

				const [xForce, yForce] = this.calcForce(v);
				const x = rate*xForce;
				const y = rate*yForce;

				const node = this.numToNode[v];
				node.setX(node.x + x);
				node.setY(node.y + y);

				await sleep(1);
				if (i%1000 == 0)
					print(this.graphAdjList.length, i) // that is werid behavior try to understand how this concurrency Works in JavaScript
			}
		}
	}

	displayGraph() {
		clearCanvas(DRAWING_CANVAS);
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
			const node = new Circle(undefined, undefined, undefined, undefined, i, DRAWING_CANVAS, true);
			this.numToNode[i] = node;
			this.nodeToNum[node] = i;
		}
	}
}

export const graphSamples = [
	[
		[1, 3],
		[0, 2, 4],
		[1, 3],
		[0, 2],
		[1, 2]
	],

	[
		[1, 2],
		[0, 2],
		[0, 1],
	],

	[
		[1],
		[0]
	],

	[
		[1],
		[0, 2],
		[1, 3],
		[2, 4],
		[3]
	],

	[
		[],
		[],
		[],
		[],
		[],
	],

	[
		[],
		[],
		[],
	],

	[
		[1],
		[0, 2],
		[1, 3],
		[1, 2]
	],

	[
		[1, 2],
		[0, 2],
		[1, 3, 0],
		[1, 2]
	],

	[
		[1, 2, 3, 4],
		[0, 2, 3, 4],
		[0, 1, 3, 4],
		[0, 1, 2, 4],
		[0, 1, 2, 3]
	],

	[
		[1, 2, 3, 4, 5, 6, 7],
		[0, 2, 3, 4, 5, 6, 7],
		[0, 1, 3, 4, 5, 6, 7],
		[0, 1, 2, 4, 5, 6, 7],
		[0, 1, 2, 3, 5, 6, 7],
		[0, 1, 2, 3, 4, 6, 7],
		[0, 1, 2, 3, 4, 5, 7],
		[0, 1, 2, 3, 4, 5, 6],
	],

	[
		[1, 2, 3, 4, 5, 6, 7, 11],
		[0, 2, 3, 4, 5, 6, 7, 14],
		[0, 1, 3, 4, 5, 6, 7, 17],
		[0, 1, 2, 4, 5, 6, 7, 20],
		[0, 1, 2, 3, 5, 6, 7, 23],
		[0, 1, 2, 3, 4, 6, 7, 26],
		[0, 1, 2, 3, 4, 5, 7, 29],
		[0, 1, 2, 3, 4, 5, 6, 8],
		[9, 10],
		[8, 10],
		[8, 9],
		[0, 12, 13],
		[11, 13],
		[11, 12],
		[1, 15, 16],
		[14, 16],
		[14, 15],
		[2, 18, 19],
		[17, 19],
		[17, 18],
		[3, 21, 22],
		[20, 22],
		[20, 21],
		[4, 24, 25],
		[23, 25],
		[23, 24],
		[5, 27, 28],
		[26, 28],
		[26, 27],
		[6, 30, 31],
		[29, 31],
		[29, 30]
	],

	[
		[1, 2],
		[0, 3, 4],
		[0, 5, 6],
		[1],
		[1],
		[2],
		[2]
	],
];