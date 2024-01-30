"use strict";

import {print, sleep} from ".././utils/utils.mjs";
import {DRAWING_CANVAS, Circle, Line, clearCanvas} from ".././svg/svg.mjs";

export class EdgeUi {
	constructor(from, to, directedEdge) {
		this.from = from;
		this.to = to;
		this.directedEdge = directedEdge;

		this.line = new Line(0, 0, 0, 0, DRAWING_CANVAS);
		this.#initLine();
	}

	display() {
		this.#initLine();
		this.line.display();
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

	getLine() {
		return this.line;
	}

	setDirected(directedEdge) {
		this.directedEdge = directedEdge;
		this.#initLine();
	}

	#initLine() {
		const x1 = this.from.x;
		const y1 = this.from.y;
		const x2 = this.to.x;
		const y2 = this.to.y;
		
		const [fromX, fromY] = this.getCoords(x1, y1, x2, y2);
		const [toX, toY] = this.getCoords(x2, y2, x1, y1);

		this.line.setCoords(fromX, fromY, toX, toY);
		this.line.setHasArrow(this.directedEdge);
	}
}

class ObjectIdMapper {
	constructor() {
		this.objToId = new Map();
		this.idToObj = new Map();
	}

	getId(obj, strObj = "") {
		if (this.objToId.has(strObj))
			return this.objToId.get(strObj);

		const id = this.objToId.size;
		this.objToId.set(strObj, id);
		this.idToObj.set(id, obj);

		return id;
	}

	getObj(id) {
		if (!this.idToObj.has(id))
			throw new Error(`Id ${id} Not Found`);

		return this.idToObj.get(id);
	}

	idExist(id) {
		return this.idToObj.has(id);
	}

	objExist(strObj) {
		return this.objToId.has(strObj);
	}

	print() {
		print("1 >>>", this.objToId);
		print("2 >>>", this.idToObj);
	}

	clear() {
		this.objToId.clear();
		this.idToObj.clear();
	}
}

class Graph {
	constructor() {
		this.edgeList = [];
		this.nodes = new Set();
	}

	readAdjacencyList(adjList) {
		for (let u = 0; u < adjList.length; u++) {
			this.addNode(u);
			for (const v of adjList[u])
				this.addEdge(u, v);
		}
	}

	readAdjacencyMatrix(adjMatrix) {
		for (let u = 0; u < adjMatrix.length; u++) {
			this.addNode(u);
			for (const v = 0; v < adjMatrix.length; v++)
				if (adjMatrix[u][v])
					this.addEdge(u, v);
		}
	}

	addNode(node) {
		if (typeof node !== "number")
			throw new Error("Invalid Arguments Number Expected");

		this.nodes.add(node);
	}

	addEdge(from, to) {
		if (typeof from !== "number" || typeof to !== "number")
			throw new Error("Invalid Arguments Number Expected");

		if (from !== to) // not a self-loop edge
			this.edgeList.push([from, to]); // in the future you might want to check if this edge already exists (to prevent multi-edges)

		this.addNode(from);
		this.addNode(to);
	}

	addUndirectedEdge(from, to) {
		this.addEdge(from, to);
		this.addEdge(to, from);
	}

	getDirectedAdjList() {
		const adjList = this.#initializeAdjList();
		for (const [u, v] of this.edgeList)
			adjList[u].add(v);

		return adjList;
	}

	getUndirectedAdjList() {
		const adjList = this.#initializeAdjList();
		for (const [u, v] of this.edgeList) {
			adjList[u].add(v);
			adjList[v].add(u);
		}

		return adjList;
	}

	getEdgeList() {
		return this.edgeList;
	}

	getNodes() {
		return new Set(this.nodes);
	}

	clear() {
		this.edgeList = [];
		this.nodes.clear();
	}

	#initializeAdjList() {
		const adjList = Array(this.nodes.size);
		for (let i = 0; i < adjList.length; i++)
			adjList[i] = new Set();

		return adjList;
	}
}

export class GraphUi {
	constructor() {
		this.nodeMapper = new ObjectIdMapper();
		this.graph = new Graph();
		this.isDirected = false;

		this.k1 = 10;
		this.k2 = Math.pow(1500, 2);
		this.l = 130;

		this.drawingStopped = false;

		this.edgesUI = [];
	}

	readAdjacencyMatrix(adjMatrix) {
		this.graph.clear();
		this.graph.readAdjacencyMatrix(adjMatrix);
		this.readEdgeList(this.graph.getEdgeList(), this.graph.getNodes());
	}

	readAdjacencyList(adjList) {
		this.graph.clear();
		this.graph.readAdjacencyList(adjList);
		this.readEdgeList(this.graph.getEdgeList(), this.graph.getNodes());
	}

	readEdgeList(edgeList, nodes = []) {
		this.#resetGraph();

		for (const node of nodes) {
			const nodeCircle = new Circle(undefined, undefined, undefined, undefined, node, DRAWING_CANVAS, true);
			const nodeId = this.nodeMapper.getId(nodeCircle, node);
			this.graph.addNode(nodeId);
		}

		for (const edge of edgeList) {
			const fromNodeCircle = new Circle(undefined, undefined, undefined, undefined, edge[0], DRAWING_CANVAS, true);
			const toNodeCircle = new Circle(undefined, undefined, undefined, undefined, edge[1], DRAWING_CANVAS, true);

			const fromNodeId = this.nodeMapper.getId(fromNodeCircle, edge[0]);
			const toNodeId = this.nodeMapper.getId(toNodeCircle, edge[1]);

			this.graph.addEdge(fromNodeId, toNodeId);
		}

		for (const edge of this.graph.getEdgeList())
			this.edgesUI.push(
				new EdgeUi(this.nodeMapper.getObj(edge[0]), this.nodeMapper.getObj(edge[1]), this.isDirected)
			); 
	}

	async drawGraph() {
		const undirectedAdjList = this.graph.getUndirectedAdjList();
		
		this.displayGraph();
		let rate = 0.01;

		for (let i = 0; i < 250; i++) {
			for (let v = 0; v < undirectedAdjList.length; v++) {
				if (this.drawingStopped)
					return;

				this.displayGraph();

				const [xForce, yForce] = this.#calcForce(v);
				const x = rate*xForce;
				const y = rate*yForce;

				const node = this.nodeMapper.getObj(v);
				node.setX(node.x + x);
				node.setY(node.y + y);

				await sleep(1);
			}
		}
	}

	displayGraph() {
		clearCanvas(DRAWING_CANVAS);

		const nodes = this.graph.getNodes();
		for (const node of nodes)
			this.nodeMapper.getObj(node).display();

		for (const edgeUi of this.edgesUI)
			edgeUi.display();
	}

	setDirected(isDirected) {
		this.isDirected = isDirected;
		for (const edgeUi of this.edgesUI)
			edgeUi.setDirected(isDirected);
		this.displayGraph();
	}

	getCircle(nodeId) {
		return this.nodeMapper.getObj(nodeId);
	}

	getCircleId(nodeText) {
		if (!this.nodeMapper.objExist(nodeText))
			return null;

		return this.nodeMapper.getId(null, nodeText);
	}

	getEdge(fromId, toId) {
		const fromNodeCircle = this.nodeMapper.getObj(fromId);
		const toNodeCircle = this.nodeMapper.getObj(toId);

		for (const edgeUi of this.edgesUI)
			if (edgeUi.from == fromNodeCircle && edgeUi.to == toNodeCircle)
				return edgeUi;
	}

	getGraph() {
		return this.graph;
	}

	stopDrawing() {
		this.drawingStopped = true;
	}

	enableDrawing() {
		this.drawingStopped = false;
	}

	#calcForce(v) {
		const undirectedAdjList = this.graph.getUndirectedAdjList();
		let fx = 0, fy = 0;

		const node = this.nodeMapper.getObj(v);
		for (const neighbour of undirectedAdjList[v]) {
			const neighbourNode = this.nodeMapper.getObj(neighbour);
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			const force = this.k1 * (edgeLength - this.l);
			fx += force * ((neighbourNode.x - node.x) / edgeLength);
			fy += force * ((neighbourNode.y - node.y) / edgeLength);
		}

		for (let i = 0; i < undirectedAdjList.length; i++) {
			if (i == v)
				continue;

			const neighbourNode = this.nodeMapper.getObj(i);
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			const force = this.k2 / Math.pow(edgeLength, 2);
			fx += force * ((node.x - neighbourNode.x) / edgeLength);
			fy += force * ((node.y - neighbourNode.y) / edgeLength);
		}

		return [fx, fy];
	}

	#resetGraph() {
		this.nodeMapper.clear();
		this.graph.clear();
		this.edgesUI = [];
	}

	#convertAdjListToEdgeList(adjList) {
		const edgeList = [];
		for (const node in adjList)
			for (const neighbour of adjList[node])
				edgeList.push([node, neighbour.toString()]);

		return edgeList;
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