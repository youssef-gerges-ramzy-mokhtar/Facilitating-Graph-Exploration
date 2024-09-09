"use strict";

import {print, sleep, SingleAsync} from ".././utils/utils.mjs";
import {DRAWING_CANVAS, Circle, Line, clearCanvas} from ".././svg/svg.mjs";

export class EdgeUi {
	constructor(from, to, weight, directedEdge) {
		this.from = from;
		this.to = to;
		this.weight = weight;
		this.directedEdge = directedEdge;

		this.line = new Line(0, 0, 0, 0, DRAWING_CANVAS);
		this.#initLine();
	}

	display() {
		this.#initLine();
		this.line.display();
	}

	#getCoords(x1, y1, x2, y2) {
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

	resetDefaults() {
		this.line.resetDefaults();
	}

	#initLine() {
		const x1 = this.from.x;
		const y1 = this.from.y;
		const x2 = this.to.x;
		const y2 = this.to.y;
		
		const [fromX, fromY] = this.#getCoords(x1, y1, x2, y2);
		const [toX, toY] = this.#getCoords(x2, y2, x1, y1);

		this.line.setCoords(fromX, fromY, toX, toY);
		this.line.setHasArrow(this.directedEdge);
		this.line.setLabel(this.weight);
	} 
}

class ObjectIdMapper {
	constructor() {
		this.objToId = new Map();
		this.idToObj = new Map();
	}

	getId(obj, strVal = "") {
		if (this.objToId.has(strVal))
			return this.objToId.get(strVal);

		const id = this.objToId.size;
		this.objToId.set(strVal, id);
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

	objExist(strVal) {
		return this.objToId.has(strVal);
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

export class Graph {
	constructor() {
	    this.edgeList = [];  // edgeList ====> array containg a tuple {from: val, to: val, weight: val}, we allow multi-edges
	    this.nodes = new Set(); // nods ====> set of all nodes
	}

	// Normal Adjacency List representation where each index contains a dynamic array of all of its neighbours
	readAdjacencyList(adjList) {
		const n = adjList.length;
		const weightedAdjList = this.#initializeAdjList(n, Array);

		for (let u = 0; u < n; u++)
			for (const v of adjList[u])
				weightedAdjList[u].push({to: v, weight: 0});
	
		this.readAdjacencyListWithWeights(weightedAdjList);
	}
	// Adjacency List representation where each index contains a dynamic array of all of its neighbours represented as an object {to, weight}
	readAdjacencyListWithWeights(adjList) {
		for (let u = 0; u < adjList.length; u++)
			this.addNode(u);

		for (let from = 0; from < adjList.length; from++)
			for (const neighbour of adjList[from])
				this.addEdge(from, neighbour.to, neighbour.weight);
	}

	// adjMatrix is a 2d array where each cell contains a boolean value 
	readAdjacencyMatrix(adjMatrix) {
		const n = adjMatrix.length;
		const weightedAdjMatrix = this.#initializeAdjMatrix(n);

		for (let u = 0; u < n; u++)
			for (let v = 0; v < n; v++)
				weightedAdjMatrix[u][v] = adjMatrix[u][v] === true ? [0] : [];

		this.readAdjacencyMatrixWithWeights(weightedAdjMatrix);
	}
	// adjMatrix is a 2d array where each cell contains an array of weights
	readAdjacencyMatrixWithWeights(adjMatrix) {
		for (let u = 0; u < adjMatrix.length; u++)
			this.addNode(u);

		for (let u = 0; u < adjMatrix.length; u++)
			for (let v = 0; v < adjMatrix.length; v++)
				for (const w of adjMatrix[u][v])
					this.addEdge(u, v, w);
	}

	addNode(node) {
		if (typeof node !== "number")
			throw new Error("Invalid Arguments Number Expected");

		this.nodes.add(node);
	}
	addEdge(from, to, weight = 0) {
		if (typeof from !== "number" || typeof to !== "number" || typeof weight !== "number")
			throw new Error("Invalid Arguments Number Expected");

		if (from !== to) // not a self-loop edge
			this.edgeList.push({from, to, weight});
		
		this.addNode(from);
		this.addNode(to);
	}
	addUndirectedEdge(from, to, weight = 0) {
		this.addEdge(from, to, weight);
		this.addEdge(to, from, weight);
	}

	getEdgeList() {
		return this.edgeList.map(edge => {
			const {weight, ...edgeCopy} = edge;
			return edgeCopy;
		});
	}
	getEdgeListWithWeights() {
		return this.edgeList.map(edge => ({...edge}));
	}
	getNodes() {
		return new Set(this.nodes);
	}
	getNumberOfNodes() {
		return this.nodes.size;
	}

	getAdjList() {
		return this.#removeAdjListWeights(this.getAdjListWithWeights());
	}
	getUndirectedAdjList() {
		return this.#removeAdjListWeights(this.getUndirectedAdjListWithWeights());
	}
	getAdjListWithWeights() {
		const adjList = this.#initializeAdjList(this.nodes.size, Array);

		for (const {from, to, weight} of this.edgeList)
			adjList[from].push({to, weight});

		return adjList;
	}
	getUndirectedAdjListWithWeights() {
		const adjList = this.#initializeAdjList(this.nodes.size, Array);
		for (const {from, to, weight} of this.edgeList) {
			adjList[from].push({to, weight});
			adjList[to].push({to: from, weight});
		}

		return adjList;
	}

	getNeighbours(node) {
		const adjList = this.getAdjList();
		return adjList[node];
	} 
	getNeighboursWithWeights(node) {
		const adjList = this.getAdjListWithWeights();
		return adjList[node];
	}
	getWeights(from, to) {
		const weights = new Set();
		for (const edge of this.edgeList)
			if (edge.from === from && edge.to === to)
				weights.add(edge.weight);
			
		return weights;
	}

	clear() {
		this.edgeList = [];
		this.nodes.clear();
	}

	#initializeAdjMatrix(n) {
		const adjMatrix = Array(n);
		for (let i = 0; i < adjMatrix.length; i++)
			adjMatrix[i] = Array(n);

		return adjMatrix;
	}
	#initializeAdjList(n, FillType = Set) {
		const adjList = Array(n);
		for (let i = 0; i < adjList.length; i++)
			adjList[i] = new FillType();

		return adjList;
	}
	#removeAdjListWeights(weightedAdjList) {
		const n = weightedAdjList.length;
		const adjList = this.#initializeAdjList(n);

		for (let from = 0; from < n; from++)
			for (const neighbour of weightedAdjList[from])
				adjList[from].add(neighbour.to);

		return adjList;
	}
}

export class GraphDrawingEngine {
	constructor() {
		this.nodeMapper = new ObjectIdMapper();
		this.graph = new Graph();
		this.isDirected = false;

		this.edgesUI = [];
		this.singleAsync = new SingleAsync();
	}

	// this method does a lot of stuff and very lengthy try to simplify it a bit into multiple functions
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

			let edgeWeight = parseInt(edge[2])
			if (isNaN(edgeWeight))
				edgeWeight = 0;
			this.graph.addEdge(fromNodeId, toNodeId, edgeWeight);
		}

		for (const edge of this.graph.getEdgeListWithWeights()) {
			const weights = this.graph.getWeights(edge.from, edge.to);
			let weightsLabel = Array.from(weights).join(", ");

			this.edgesUI.push(
				new EdgeUi(this.nodeMapper.getObj(edge.from), this.nodeMapper.getObj(edge.to), weightsLabel, this.isDirected)
			);
		}
	}

	readGraph(graph) {
		const edgeList = graph.getEdgeListWithWeights().map(edge => [edge.from, edge.to, edge.weight]);
		const nodes = graph.getNodes();
		this.readEdgeList(edgeList, nodes);
	}

	async drawGraph() {
		const functionLock = this.singleAsync.makeNewCall();
		const rate = 0.01;

		this.displayGraph();
		for (let i = 0; i < 250; i++) {
			for (let v = 0; v < this.graph.getNumberOfNodes(); v++) {
				if (functionLock.callStopped()) // mainly used for pefromance reasons to stop previous async calls, and to stop the graph drawing when requested
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

	getEdges(fromId, toId) {
		const fromNodeCircle = this.nodeMapper.getObj(fromId);
		const toNodeCircle = this.nodeMapper.getObj(toId);

		return this.edgesUI.filter(edgeUi => edgeUi.from == fromNodeCircle && edgeUi.to == toNodeCircle)
	}

	getGraph() {
		return this.graph;
	}

	stopDrawing() {
		this.singleAsync.makeNewCall();
	}

	resetDefaults() {
		const nodes = this.graph.getNodes();
		for (const node of nodes)
			this.nodeMapper.getObj(node).resetDefaults();

		for (const edge of this.edgesUI)
			edge.resetDefaults();
	}

	#calcForce(v) {
		const k1 = 10;
		const k2 = Math.pow(1500, 2);
		const l = 130;

		const undirectedAdjList = this.graph.getUndirectedAdjList();
		let fx = 0, fy = 0;

		const node = this.nodeMapper.getObj(v);
		for (const neighbour of undirectedAdjList[v]) {
			const neighbourNode = this.nodeMapper.getObj(neighbour);
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			const force = k1 * (edgeLength - l);
			fx += force * ((neighbourNode.x - node.x) / edgeLength);
			fy += force * ((neighbourNode.y - node.y) / edgeLength);
		}

		for (let i = 0; i < undirectedAdjList.length; i++) {
			if (i == v)
				continue;

			const neighbourNode = this.nodeMapper.getObj(i);
			const edge = new EdgeUi(node, neighbourNode);
			const edgeLength = edge.getEdgeLength();

			const force = k2 / Math.pow(edgeLength, 2);
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