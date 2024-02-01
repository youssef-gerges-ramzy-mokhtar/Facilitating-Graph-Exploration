"use strict";
import {print, sleep, SingleAsync} from "../../utils/utils.mjs";

export class BFSVisualizer {
	constructor(graphUI) {
		this.graphUI = graphUI;
		this.visualizationTime = 1000;

		this.colors = {
			CURRENT_NODE: {color: "lightBlue"},
			EDGE_TRAVERSAL: {color: "cyan"},
			UNVISITED_NEIGHBOUR: {color: "yellow"},
			EDGE_CLASSIFICATION: {color: "black", treeEdgeStrokeWidth: 4},
			CURRENT_NODE_FINISHED: {color: "lightGreen"}
		}

		this.singleAsync = new SingleAsync();
	}

	async startVisualizer(startNode) {
		const functionLock = this.singleAsync.makeNewCall();
		this.#resetGraph();

		const nodeId = this.graphUI.getCircleId(startNode);
		if (nodeId === null)
			throw new Error(`${startNode} does not exist in the graph`);

		const algorithmSteps = this.#algorithm(nodeId, this.graphUI.getGraph().getDirectedAdjList());
		for (const step of algorithmSteps) {
			if (functionLock.callStopped()) // IMP Question: where is the best pos to check for this condition & WHY?
				return;

			const {stepType, u} = step;

			if (stepType === "CURRENT_NODE" || stepType === "UNVISITED_NEIGHBOUR" || stepType === "CURRENT_NODE_FINISHED")
				this.graphUI.getCircle(u).setColor(this.colors[stepType].color);
			else if (stepType === "EDGE_TRAVERSAL" || stepType === "EDGE_CLASSIFICATION") {
				const edgeLine = this.graphUI.getEdge(u, step.v).getLine();
				edgeLine.setStrokeCol(this.colors[stepType].color)
				
				if (stepType === "EDGE_CLASSIFICATION" && step.treeEdge)
					edgeLine.setStrokeWidth(this.colors[stepType].treeEdgeStrokeWidth);
			}

			this.graphUI.displayGraph();
			await sleep(this.visualizationTime);
		}
	}

	stopVisualizer() {
		SingleAsync.makeNewCall();
	}

	#resetGraph() {
		this.graphUI.resetDefaults();
		this.graphUI.displayGraph();
	}

	#algorithm(startNode, adjList) {
		const algorithmSteps = [];

		const q = [];
		const vis = new Set();

		q.push(startNode);
		vis.add(startNode);

		for (let sz = q.length; q.length !== 0; sz = q.length) {
			while (sz--) {
				const curNode = q[0];
				q.shift();

				algorithmSteps.push({stepType: "CURRENT_NODE", u: curNode});
				for (const neighbour of adjList[curNode]) {
					algorithmSteps.push({stepType: "EDGE_TRAVERSAL", u: curNode, v: neighbour});

					let treeEdgeUsed = false;
					if (!vis.has(neighbour)) {
						q.push(neighbour);
						vis.add(neighbour);

						algorithmSteps.push({stepType: "UNVISITED_NEIGHBOUR", u: neighbour});
						treeEdgeUsed = true;
					}

					algorithmSteps.push({stepType: "EDGE_CLASSIFICATION", u: curNode, v: neighbour, treeEdge: treeEdgeUsed});
				}

				algorithmSteps.push({stepType: "CURRENT_NODE_FINISHED", u: curNode});
			}
		}

		return algorithmSteps;
	}
}