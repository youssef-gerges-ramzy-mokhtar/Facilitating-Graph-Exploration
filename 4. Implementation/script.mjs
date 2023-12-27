"use strict";

import {print, sleep} from "./utils/utils.mjs";
import {GraphUi, graphSamples} from "./graph/graph-visualizer.mjs"

// HTML Elements //
const graphInput = document.getElementById("graph-data");
const graphTypeSelect = document.getElementById("graph-type");

const g = new GraphUi();
graphInput.addEventListener("keyup", function (event) {
	const {edgeList, nodes} = generateGraph(event.target.value)
	if (event.target.value == "" || ((edgeList.length || nodes.length) && (event.key.length == 1 || event.key == "Backspace")))
		drawGraph()
})

graphTypeSelect.addEventListener("change", function (event) {
	g.setDirected(graphTypeSelect.value === "directed")
})

function drawGraph() {
	const graphText = graphInput.value

	const {edgeList, nodes} = generateGraph(graphText)
	g.readEdgeList(edgeList, nodes)
	g.drawGraph()
}

function generateGraph(graphData) {
	let rows = graphData.split("\n");
	rows = rows.filter(row => row.length > 0);

	const edgeList = [];
	const nodes = [];
	for (const row of rows) {
		const edge = generateEdge(row.trim());
		if (edge.length == 0)
			return [];

		if (edge.length == 2)
			edgeList.push(edge);
		else
			nodes.push(edge[0]);
	}

	return {edgeList, nodes};
}

function generateEdge(row) {
	let nodes = row.split(" ");
	if (nodes.length == 1 || nodes.length == 2)
		return nodes;

	return [];
}

// async function main() {
// 	for (const graph of graphSamples) {
// 		g.readAdjacencyList(graph);
// 		g.drawGraph();
// 		await sleep(5000);
// 	}
// }
// main();