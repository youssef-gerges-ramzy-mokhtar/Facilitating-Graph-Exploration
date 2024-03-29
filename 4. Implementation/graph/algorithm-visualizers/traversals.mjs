"use strict";
import {print, sleep, SingleAsync} from "../../utils/utils.mjs";
import {Graph} from "../graph-visualizer.mjs";

class GraphVisualizer {
	static singleAsync = new SingleAsync();

	constructor(graphDrawingEngine, logger) {
		this.graphDrawingEngine = graphDrawingEngine;
		this.logger = logger;

		this.visualizationTime = 1000;
		this.colors = {
			CURRENT_NODE: {color: "lightBlue"},
			EDGE_TRAVERSAL: {color: "cyan"},
			UNVISITED_NEIGHBOUR: {color: "yellow"},
			EDGE_CLASSIFICATION: {color: "black", treeEdgeStrokeWidth: 4},
			CURRENT_NODE_FINISHED: {color: "lightGreen"}
		}
	}

	async startVisualizer(startNode) {
		const functionLock = GraphVisualizer.singleAsync.makeNewCall();
		this.#resetGraph();

		const nodeId = this.graphDrawingEngine.getCircleId(startNode);
		if (nodeId === null)
			throw new Error(`${startNode} does not exist in the graph`);

		const algorithmSteps = this._algorithm(nodeId, this.graphDrawingEngine.getGraph());
		for (const step of algorithmSteps) {
			if (functionLock.callStopped()) // IMP Question: where is the best pos to check for this condition & WHY?
				return;

			const {stepType, u} = step;

			if (stepType === "CURRENT_NODE" || stepType === "UNVISITED_NEIGHBOUR" || stepType === "CURRENT_NODE_FINISHED")
				this.graphDrawingEngine.getCircle(u).setColor(this.colors[stepType].color);
			else if (stepType === "EDGE_TRAVERSAL" || stepType === "EDGE_CLASSIFICATION") {
				const edges = this.graphDrawingEngine.getEdges(u, step.v)
				const edgeLines = edges.map(edge => edge.getLine());
				for (const edgeLine of edgeLines)
					edgeLine.setStrokeCol(this.colors[stepType].color)
				
				if (stepType === "EDGE_CLASSIFICATION" && step.treeEdge)
					for (const edgeLine of edgeLines)
						edgeLine.setStrokeWidth(this.colors[stepType].treeEdgeStrokeWidth);
			}

			this._logInfo(step);
			this.graphDrawingEngine.displayGraph();

			if (stepType === "PREPARING_GRAPH")
				continue;
			
			await sleep(this.visualizationTime);
		}
	}

	stopVisualizer() {
		GraphVisualizer.singleAsync.makeNewCall();
		this.#resetGraph();
	}

	setTime(time = 1000) {
		this.visualizationTime = time;
	}

	#resetGraph() {
		this.graphDrawingEngine.resetDefaults();
		this.graphDrawingEngine.displayGraph();
	}

	_logInfo(step) {
		throw new Error("This is an abstract protected method")
	}

	_algorithm(startNode, graph) {
		throw new Error("This is an abstract protected method");
	}
}

export class BFSVisualizer extends GraphVisualizer {
	constructor(graphDrawingEngine, logger) {
		super(graphDrawingEngine, logger);
	}

	_algorithm(startNode, graph) {
		const algorithmSteps = [];

		const adjList = graph.getAdjList();
		const q = [];
		const vis = new Set();

		q.push(startNode);
		vis.add(startNode);

		for (let sz = q.length; q.length !== 0; sz = q.length) {
			while (sz--) {
				const curNode = q[0];
				q.shift();

				algorithmSteps.push({stepType: "CURRENT_NODE", u: curNode, data: this.#getData(q, vis)});
				for (const neighbour of adjList[curNode]) {
					algorithmSteps.push({stepType: "EDGE_TRAVERSAL", u: curNode, v: neighbour, data: this.#getData(q, vis)});

					let treeEdgeUsed = false;
					if (!vis.has(neighbour)) {
						q.push(neighbour);
						vis.add(neighbour);

						algorithmSteps.push({stepType: "UNVISITED_NEIGHBOUR", u: neighbour, data: this.#getData(q, vis)});
						treeEdgeUsed = true;
					}

					algorithmSteps.push({stepType: "EDGE_CLASSIFICATION", u: curNode, v: neighbour, treeEdge: treeEdgeUsed, data: this.#getData(q, vis)});
				}

				algorithmSteps.push({stepType: "CURRENT_NODE_FINISHED", u: curNode, data: this.#getData(q, vis)});
			}
		}

		return algorithmSteps;
	}

	_logInfo(step) {
		const {stepType, data} = step;
		if (stepType != "CURRENT_NODE" && stepType != "UNVISITED_NEIGHBOUR")
			return;

		this.logger.log(`Queue = [${getNodeNames(this.graphDrawingEngine, data.q)}]`);
		this.logger.log(`Visisted = [${getNodeNames(this.graphDrawingEngine, data.vis)}]`);
		this.logger.log("\n");
	}

	#getData(q, vis) {
		return {q: [...q], vis: [...vis]};
	}
}

export class DFSVisualizer extends GraphVisualizer {
	constructor(graphDrawingEngine, logger) {
		super(graphDrawingEngine, logger);
	}

	_algorithm(curNode, graph, algorithmSteps = [], vis = new Set(), stack = []) {
		// the 3 lines below are very bad in terms of code structure and design
		// _algorithm() might call an internal dfs() function and pass to it the adjList
		let adjList = graph;
		if (graph instanceof Graph)
			adjList = graph.getAdjList();

		stack.push(curNode);
		vis.add(curNode);

		algorithmSteps.push({stepType: "CURRENT_NODE", u: curNode, data: this.#getData(stack, vis)});

		for (const neighbour of adjList[curNode]) {
			algorithmSteps.push({stepType: "EDGE_TRAVERSAL", u: curNode, v: neighbour, data: this.#getData(stack, vis)});
			let treeEdgeUsed = false;

			if (!vis.has(neighbour)) {
				algorithmSteps.push({stepType: "UNVISITED_NEIGHBOUR", u: neighbour, data: this.#getData(stack, vis)});
				treeEdgeUsed = true;
			}

			algorithmSteps.push({stepType: "EDGE_CLASSIFICATION", u: curNode, v: neighbour, treeEdge: treeEdgeUsed, data: this.#getData(stack, vis)});
			
			if (treeEdgeUsed)
				this._algorithm(neighbour, adjList, algorithmSteps, vis, stack);
		}

		stack.pop();
		algorithmSteps.push({stepType: "CURRENT_NODE_FINISHED", u: curNode, data: this.#getData(stack, vis)});

		return algorithmSteps;
	}

	_logInfo(step) {
		const {stepType, data} = step;
		if (stepType != "CURRENT_NODE" && stepType != "CURRENT_NODE_FINISHED")
			return;

		this.logger.log(`Stack = [${getNodeNames(this.graphDrawingEngine, data.stack)}]`);
		this.logger.log(`Visisted = [${getNodeNames(this.graphDrawingEngine, data.vis)}]`);
		this.logger.log("\n");
	}

	#getData(stack, vis) {
		return {stack: [...stack], vis: [...vis]};
	}
}

export class DijkstraVisualizer extends GraphVisualizer {
	constructor(graphDrawingEngine, logger) {
		super(graphDrawingEngine, logger);
	}

	_algorithm(src, graph) {
		let adjList = graph.getAdjListWithWeights();
		if (this.#hasNegativeWeights(adjList))
			return [{stepType: "INVALID_GRAPH", reason: "Dijkstra's Algorithm only works with +ve weight edges"}];

		const algorithmSteps = [];

		adjList = this.#removeMultiEdges(adjList);
		algorithmSteps.push({stepType: "PREPARING_GRAPH", reason: "Removing multi-edges from the adjacency list"}); // you need to include a copy of the adjList here

		const vis = new Set();
		const dist = Array(adjList.length).fill(Infinity);
		const parent = Array(adjList.length).fill(-1);

		dist[src] = 0;

		while (true) {
			const u = this.#getMinDistNode(dist, vis);
			algorithmSteps.push({stepType: "CURRENT_NODE", u, data: this.#getData(dist, vis)});

			for (const neighbour of adjList[u]) { // relax all edges from from 'u' to all its neighbours
				this.#relax(u, neighbour.to, neighbour.weight, dist, parent);
				algorithmSteps.push({stepType: "EDGE_TRAVERSAL", u, v: neighbour.to, data: this.#getData(dist, vis)});
			}

			vis.add(u);
			algorithmSteps.push({stepType: "CURRENT_NODE_FINISHED", u, data: this.#getData(dist, vis)});
			
			const v = this.#getMinDistNode(dist, vis);
			if (v !== -1)
				algorithmSteps.push({stepType: "EDGE_CLASSIFICATION", u: parent[v], v, treeEdge: true, data: this.#getData(dist, vis)});

			for (const neighbour of adjList[u])
				if (!(parent[v] == u && neighbour.to == v))
					algorithmSteps.push({stepType: "EDGE_CLASSIFICATION", u, v: neighbour.to, treeEdge: false, data: this.#getData(dist, vis)});
		
			if (v === -1)
				break
		}

		return algorithmSteps;
	}

	_logInfo(step) {
		const {stepType, data} = step;
		if (!data) {
			this.logger.log(`${stepType}: ${step.reason}`);
			this.logger.log("\n");
			return;
		}

		if (stepType !== "CURRENT_NODE_FINISHED" && stepType !== "EDGE_TRAVERSAL")
			return;

		const labelledDist = data.dist.map((dist, idx) => `${getNodeName(this.graphDrawingEngine, idx)}: ${dist}`);
		this.logger.log(`Dist = [${labelledDist}]`);
		this.logger.log(`Visited = [${getNodeNames(this.graphDrawingEngine, data.vis)}]`);
		this.logger.log("\n");
	}

	#hasNegativeWeights(adjList) {
		for (let u = 0; u < adjList.length; u++)
			for (const neighbour of adjList[u])
				if (neighbour.weight < 0)
					return true;

		return false;
	}

	#removeMultiEdges(multiEdgeAdjList) {
		const n = multiEdgeAdjList.length;

		// created Adjaceny Matrix for the Graph where all edges weights are Infinity
		const adjMatrix = Array(n);
		for (let i = 0; i < n; i++)
			adjMatrix[i] = Array(n).fill(null);

		// Using the min edge weight if a multi-edge exists
		for (let u = 0; u < multiEdgeAdjList.length; u++) {
			for (const neighbour of multiEdgeAdjList[u]) {
				const v = neighbour.to, w = neighbour.weight;
				if (adjMatrix[u][v] !== null)
					adjMatrix[u][v] = Math.min(adjMatrix[u][v], w);
				else
					adjMatrix[u][v] = w;
			}
		}
	
		// converting back the adjMatrix to an adjList
		const adjList = Array(n);
		for (let i = 0; i < n; i++)
			adjList[i] = [];

		for (let u = 0; u < n; u++)
			for (let v = 0; v < n; v++)
				if (adjMatrix[u][v] !== null)
					adjList[u].push({to: v, weight: adjMatrix[u][v]});
	
		return adjList;
	}

	#getMinDistNode(dist, vis) {
		let minDist = Infinity, minNode = -1;
		for (let u = 0; u < dist.length; u++) if (!vis.has(u))
			if (dist[u] < minDist)
				minDist = dist[u], minNode = u;

		return minNode;
	}

	#relax(from, to, w, dist, parent) {
		if (dist[to] > dist[from] + w) {
			dist[to] = dist[from] + w;
			parent[to] = from;
		}
	}

	#getData(dist, vis) {
		return {dist: [...dist], vis: [...vis]};
	}
}

function getNodeNames(graphDrawingEngine, nodes) {
	return nodes.map(node => graphDrawingEngine.getCircle(node).content);
}

function getNodeName(graphDrawingEngine, node) {
	return graphDrawingEngine.getCircle(node).content;
}