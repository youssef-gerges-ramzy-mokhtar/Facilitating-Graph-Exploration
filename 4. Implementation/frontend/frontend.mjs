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

			if (self.#canDraw(event.target.value, edgeList, nodes, event.key))
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

	#canDraw(inputText, edgeList, nodes, eventKey) {
		if (inputText === "")
			return true;

		// Preventing the graph from re-drawing in case of "ctrl+key" is used 
		const reDrawAllowedKeys = ['z', 'y', 'x', 'v'];
		if (eventKey.ctrlKey && !reDrawAllowedKeys.includes(event.key.toLowerCase()))
			return false;

		// Preventing the graph from re-drawing in case the edgeList and nodes are both empty
		if (edgeList.length === 0 && nodes.length === 0)
			return false;

		// Preventing the graph from re-drawing in case the user clicked a non-printable character or not a backspace
		if (eventKey.length !== 1 && event.key !== "Backspace")
			return false;

		return true;
	}
}

class AlgorithmVisualizerHandler {
	#algorithmStepsEl;
	#visualizationSelectionEl;
	#algorithmStepsLogger;

	#currentVisualizer;
	#availableVisualizers;

	constructor() {
		this.#algorithmStepsEl = document.getElementById("algorithm-steps-container");
		this.#visualizationSelectionEl = document.getElementById("algorithm-selection");

		this.#algorithmStepsLogger = new HtmlLogger(this.#algorithmStepsEl);
		this.#currentVisualizer = "none";

		this.#availableVisualizers  = {
			"bfs": new BFSVisualizer(graphUI, this.#algorithmStepsLogger),
			"dfs": new DFSVisualizer(graphUI, this.#algorithmStepsLogger),
			"none": null,
			"dijkstra": null
		};

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
			if (self.#availableVisualizers[self.#currentVisualizer]) {
				self.#algorithmStepsLogger.clear();
				self.#availableVisualizers[self.#currentVisualizer].startVisualizer(nodeText);
			}
		})

		this.#visualizationSelectionEl.addEventListener("change", function (event) {
			self.#currentVisualizer = event.target.value;
			self.#algorithmStepsLogger.clear();
		
			if (self.#currentVisualizer === "none")
				return;

			self.#waitingForNodesLog();
		})
	}

	#waitingForNodesLog() {
		this.#algorithmStepsLogger.log("Waiting for node selection...")
		this.#algorithmStepsLogger.log("\n");	
	}
}

class HtmlLogger {
	#htmlEl = null;
	constructor(htmlEl) {
		this.#htmlEl = htmlEl;
	}

	log(info) {
		this.#htmlEl.appendChild(document.createTextNode(info));
		this.#htmlEl.appendChild(document.createElement('br'));
	}

	clear() {
		this.#htmlEl.textContent = "";
		this.#htmlEl.insertAdjacentHTML("beforeend", "<h2>Algorithm Steps</h2>");
	}
}

export class FrontendHandler {
	constructor() {
		new GraphInputHandler();
		new AlgorithmVisualizerHandler();
	}
}