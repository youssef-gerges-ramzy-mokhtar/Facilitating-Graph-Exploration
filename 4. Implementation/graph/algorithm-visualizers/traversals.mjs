"use strict";
import {print, sleep, SingleAsync} from "../../utils/utils.mjs";
import {Graph} from "../graph-visualizer.mjs";

class GraphTraversalVisualizer {
	static singleAsync = new SingleAsync();

	constructor(graphUI, logger, algorithmDataLogger) {
		this.graphUI = graphUI;
		this.logger = logger;
		this.algorithmDataLogger = algorithmDataLogger;

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
		const functionLock = GraphTraversalVisualizer.singleAsync.makeNewCall();
		this.#resetGraph();

		const nodeId = this.graphUI.getCircleId(startNode);
		if (nodeId === null)
			throw new Error(`${startNode} does not exist in the graph`);

		const algorithmSteps = this._algorithm(nodeId, this.graphUI.getGraph());
		for (const step of algorithmSteps) {
			if (functionLock.callStopped()) // IMP Question: where is the best pos to check for this condition & WHY?
				return;

			const {stepType, u} = step;

			if (stepType === "CURRENT_NODE" || stepType === "UNVISITED_NEIGHBOUR" || stepType === "CURRENT_NODE_FINISHED")
				this.graphUI.getCircle(u).setColor(this.colors[stepType].color);
			else if (stepType === "EDGE_TRAVERSAL" || stepType === "EDGE_CLASSIFICATION") {
				const edges = this.graphUI.getEdges(u, step.v)
				const edgeLines = edges.map(edge => edge.getLine());
				for (const edgeLine of edgeLines)
					edgeLine.setStrokeCol(this.colors[stepType].color)
				
				if (stepType === "EDGE_CLASSIFICATION" && step.treeEdge)
					for (const edgeLine of edgeLines)
						edgeLine.setStrokeWidth(this.colors[stepType].treeEdgeStrokeWidth);
			}

			this.algorithmDataLogger.logInfo(step, this.logger);
			this.graphUI.displayGraph();

			if (stepType === "PREPARING_GRAPH")
				continue;
			
			await sleep(this.visualizationTime);
		}
	}

	stopVisualizer() {
		GraphTraversalVisualizer.singleAsync.makeNewCall();
		this.#resetGraph();
	}

	setTime(time = 1000) {
		this.visualizationTime = time;
	}

	#resetGraph() {
		this.graphUI.resetDefaults();
		this.graphUI.displayGraph();
	}

	_algorithm(startNode, adjList) {
		throw new Error("This is an abstract protected method");
	}
}

class BFSDataLogger {
	constructor(graphUI, logger) {
		this.graphUI = graphUI;
		this.logger = logger;
	}

	logInfo(info, logger) {
		const {stepType, data} = info;
		if (stepType != "CURRENT_NODE" && stepType != "UNVISITED_NEIGHBOUR")
			return;

		logger.log(`Queue = [${getNodeNames(this.graphUI, data.q)}]`);
		logger.log(`Visisted = [${getNodeNames(this.graphUI, data.vis)}]`);
		logger.log("\n");
	}
}

class DFSDataLogger {
	constructor(graphUI, logger) {
		this.graphUI = graphUI;
		this.logger = logger;
	}

	logInfo(info, logger) {
		const {stepType, data} = info;
		if (stepType != "CURRENT_NODE" && stepType != "CURRENT_NODE_FINISHED")
			return;

		logger.log(`Stack = [${getNodeNames(this.graphUI, data.stack)}]`);
		logger.log(`Visisted = [${getNodeNames(this.graphUI, data.vis)}]`);
		logger.log("\n");
	}
}

// Class still under implementation
class DijkstraDataLogger {
	constructor(graphUI, logger) {
		this.graphUI = graphUI;
		this.logger = logger;
	}

	logInfo(info, logger) {
		// write that dijkstra will only work on a directed graph for now
		
		const {stepType, data} = info;
		if (!data) {
			logger.log(`${stepType}: ${info.reason}`);
			return;
		}

		logger.log(`Dist = [${data.dist}]`);
		logger.log(`Visited = [${getNodeNames(this.graphUI, data.vis)}]`);
		logger.log("\n");
	}
}

export class BFSVisualizer extends GraphTraversalVisualizer {
	constructor(graphUI, logger) {
		super(graphUI, logger, new BFSDataLogger(graphUI, logger));
	}

	_algorithm(startNode, graph) {
		const algorithmSteps = [];

		const adjList = graph.getDirectedAdjList();
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

	#getData(q, vis) {
		return {q: [...q], vis: [...vis]};
	}
}

export class DFSVisualizer extends GraphTraversalVisualizer {
	constructor(graphUI, logger) {
		super(graphUI, logger, new DFSDataLogger(graphUI, logger));
	}

	_algorithm(curNode, graph, algorithmSteps = [], vis = new Set(), stack = []) {
		// the 3 lines below are very bad in terms of code structure and design
		// _algorithm() might call an internal dfs() function and pass to it the adjList
		let adjList = graph;
		if (graph instanceof Graph)
			adjList = graph.getDirectedAdjList();

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

	#getData(stack, vis) {
		return {stack: [...stack], vis: [...vis]};
	}
}

export class DijkstraVisualizer extends GraphTraversalVisualizer {
	constructor(graphUI, logger) {
		super(graphUI, logger, new DijkstraDataLogger(graphUI, logger));
	}

	_algorithm(src, graph) {
		let adjList = graph.getDirectedAdjListWithWeights();
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

function getNodeNames(graphUI, nodes) {
	return nodes.map(node => graphUI.getCircle(node).content);
}