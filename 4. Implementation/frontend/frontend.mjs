import {print, sleep} from "../utils/utils.mjs";
import {GraphUi, EdgeUi, graphSamples} from "../graph/graph-visualizer.mjs"
import {BFSVisualizer, DFSVisualizer} from "../graph/algorithm-visualizers/traversals.mjs"
import {DRAWING_CANVAS} from "../svg/svg.mjs";

const graphUI = new GraphUi();

class GraphInputHandler {
	#graphInputEl = document.getElementById("graph-data");
	#graphTypeSelectEl = document.getElementById("graph-type");
	constructor() {
		this.#registerEventListeners();
	}

	#registerEventListeners() {
		const self = this;

		this.#graphInputEl.addEventListener("keyup", function (event) {
			const {edgeList, nodes} = self.#praseGraphText(event.target.value)

			// I don't like this if statement + it feels very buggy
			if (event.target.value == "" || ((edgeList.length || nodes.length) && (event.key.length == 1 || event.key == "Backspace"))) 
				self.#drawGraph(edgeList, nodes);
		})

		this.#graphTypeSelectEl.addEventListener("change", function (event) {
			graphUI.setDirected(event.target.value === "directed");
		})
	}

	#drawGraph(edgeList, nodes) {
		graphUI.readEdgeList(edgeList, nodes)
		graphUI.drawGraph()
	}

	#praseGraphText(graphText) {
		let rows = graphText.split("\n");
		rows = rows.filter(row => row.length > 0);

		const edgeList = [];
		const nodes = [];
		for (const row of rows) {
			const edge = this.#generateEdge(row.trim());
			if (edge.length == 0)
				return [];

			if (edge.length == 2)
				edgeList.push(edge);
			else
				nodes.push(edge[0]);
		}

		return {edgeList, nodes};
	}

	#generateEdge(row) {
		let nodes = row.split(" ");
		if (nodes.length == 1 || nodes.length == 2)
			return nodes;

		return [];
	}
}

class AlgorithmVisualizerHandler {
	#algorithmStepsEl = document.getElementById("algorithm-steps");
	#visualizationSelectionEl = document.getElementById("algorithm-selection")
	
	#currentVisualizer = "none";
	#availableVisualizers = {
		"bfs": new BFSVisualizer(graphUI),
		"dfs": new DFSVisualizer(graphUI),
		"none": null,
		"dijkstra": null
	};

	constructor() {
		this.#registerEventListeners();
	}

	#registerEventListeners() {
		const self = this;

		DRAWING_CANVAS.addEventListener("click", function (event) {
			let textEl = event.target;
			if (event.target.tagName == "circle")
				textEl = event.target.nextElementSibling;

			if (textEl.tagName != "text")
				return;

			const nodeText = textEl.textContent;
			if (self.#availableVisualizers[self.#currentVisualizer])
				self.#availableVisualizers[self.#currentVisualizer].startVisualizer(nodeText);
		})

		this.#visualizationSelectionEl.addEventListener("change", function (event) {
			self.#currentVisualizer = event.target.value;
			if (self.#currentVisualizer === "none") {
				self.#algorithmStepsEl.textContent = "";
				return;
			}

			self.#algorithmStepsEl.textContent = "Waiting for node selection..."; // every visualizer should do its own specific logging
		})
	}
}

export class FrontendHandler {
	constructor() {
		new GraphInputHandler();
		new AlgorithmVisualizerHandler();
	}
}