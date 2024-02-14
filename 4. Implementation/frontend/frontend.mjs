import {print, sleep} from "../utils/utils.mjs";
import {GraphUi, EdgeUi, graphSamples} from "../graph/graph-visualizer.mjs"
import {BFSVisualizer, DFSVisualizer, DijkstraVisualizer} from "../graph/algorithm-visualizers/traversals.mjs"
import {DRAWING_CANVAS} from "../svg/svg.mjs";

const graphUI = new GraphUi();

class GraphInputHandler {
	#graphInputEl = document.getElementById("graph-data");
	#graphTypeSelectEl = document.getElementById("graph-type");
	constructor(algorithmVisualizerHandler) {
		this.#registerEventListeners();
		this.algorithmVisualizerHandler = algorithmVisualizerHandler;
	}

	#registerEventListeners() {
		const self = this;

		this.#graphInputEl.addEventListener("keyup", function (event) {
			const {edgeList, nodes} = self.#praseGraphText(event.target.value)

			if (self.#canDraw(event.target.value, edgeList, nodes, event)) {
				self.algorithmVisualizerHandler.stopAllVisualizers();
				self.algorithmVisualizerHandler.clearLogger();
				self.#drawGraph(edgeList, nodes);
			}
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

		let edgeList = [];
		let nodes = [];
		for (const row of rows) {
			const edge = this.#generateEdge(row);
			if (edge.length == 0) {
				edgeList = [];
				nodes = [];
				break;
			}

			if (edge.length === 1)
				nodes.push(edge[0]);
			else
				edgeList.push(edge);
		}

		return {edgeList, nodes};
	}

	#generateEdge(row) {
		let words = row.split(" ").filter(word => word !== "");
		if (words.length > 3)
			words = words.slice(0, 3);

		if (1 <= words.length && words.length <= 3)
			return words;

		return [];
	}

	#canDraw(inputText, edgeList, nodes, event) {
		if (inputText === "")
			return true;

		// Preventing the graph from re-drawing in case of "ctrl+key" is used 
		const reDrawAllowedKeys = ['z', 'y', 'x', 'v'];
		if (event.ctrlKey && !reDrawAllowedKeys.includes(event.key.toLowerCase()))
			return false;

		// Preventing the graph from re-drawing in case the edgeList and nodes are both empty
		if (edgeList.length === 0 && nodes.length === 0)
			return false;

		// Preventing the graph from re-drawing in case the user clicked a non-printable character or not a backspace
		if (event.key.length !== 1 && event.key !== "Backspace")
			return false;

		return true;
	}
}

class AlgorithmVisualizerHandler {
	#algorithmStepsEl;
	#visualizationSelectionEl;
	#speedControllerEl;
	#algorithmStepsLogger;
	#stopGraphBtnEl;
	#stopVisualizerBtnEl;
	#clearAlgorithmStepsBtnEl;
	#visualizationInstructionsEl;

	#currentVisualizer;
	#availableVisualizers;

	constructor() {
		this.#algorithmStepsEl = document.getElementById("algorithm-steps-container");
		this.#visualizationSelectionEl = document.getElementById("algorithm-selection");
		this.#speedControllerEl = document.getElementById("speed-controller");
		this.#stopGraphBtnEl = document.getElementById("btn1");
		this.#stopVisualizerBtnEl = document.getElementById("btn2");
		this.#clearAlgorithmStepsBtnEl = document.getElementById("btn3");
		this.#visualizationInstructionsEl = document.getElementById("visualization-instructions");

		this.#algorithmStepsLogger = new HtmlLogger(this.#algorithmStepsEl);
		this.#currentVisualizer = "none";

		this.#availableVisualizers  = {
			"bfs": new BFSVisualizer(graphUI, this.#algorithmStepsLogger),
			"dfs": new DFSVisualizer(graphUI, this.#algorithmStepsLogger),
			"dijkstra": new DijkstraVisualizer(graphUI, this.#algorithmStepsLogger),
			"none": null
		};

		this.#registerEventListeners();
	}

	stopAllVisualizers() {
		for (const visualizer of Object.values(this.#availableVisualizers))
			if (visualizer)
				visualizer.stopVisualizer();
	}

	clearLogger() {
		this.#algorithmStepsLogger.clear();
	}

	#registerEventListeners() {
		const self = this;

		DRAWING_CANVAS.addEventListener("click", function(event) {
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

		this.#visualizationSelectionEl.addEventListener("change", function(event) {
			self.#currentVisualizer = event.target.value;
			self.#algorithmStepsLogger.clear();
			self.#visualizationInstructionsEl.textContent = "";
		
			if (self.#currentVisualizer === "none")
				return;

			self.#waitingForNodesLog();
		})

		this.#speedControllerEl.addEventListener("input", function(event) {
			for (const visualizer of Object.values(self.#availableVisualizers))
				if (visualizer)
					visualizer.setTime(2010 - this.value);
		})

		this.#stopGraphBtnEl.addEventListener("click", function(event) {
			const btnType = this.textContent;
			let oppositeText = btnType === "stop drawing" ? "continue drawing" : "stop drawing";

			if (btnType === "stop drawing")
				graphUI.stopDrawing();
			else
				graphUI.drawGraph();

			this.textContent = oppositeText;
		})

		this.#stopVisualizerBtnEl.addEventListener("click", function(event) {
			self.stopAllVisualizers();
		})

		this.#clearAlgorithmStepsBtnEl.addEventListener("click", function(event) {
			self.#algorithmStepsLogger.clear();
		})
	}

	#waitingForNodesLog() {
		this.#visualizationInstructionsEl.textContent = "Waiting for node selection...";
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
		const algorithmVisualizerHandler = new AlgorithmVisualizerHandler();
		new GraphInputHandler(algorithmVisualizerHandler);
	}
}