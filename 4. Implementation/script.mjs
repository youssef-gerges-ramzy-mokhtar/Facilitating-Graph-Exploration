"use strict";

import {print, sleep} from "./utils/utils.mjs";
import {GraphUi, graphSamples} from "./graph/graph-visualizer.mjs"
const g = new GraphUi();

const graphInput = document.getElementById("graph-data");
graphInput.addEventListener("keyup", function (event) {
	const graph = generateGraph(event.target.value)
	if (event.target.value == "" || (graph.length && (event.key.length == 1 || event.key == "Backspace"))) {
		g.readEdgeList(graph);
		g.drawGraph();
	}
})

function generateGraph(graphData) {
	let rows = graphData.split("\n");
	rows = rows.filter(row => row.length > 0);

	const graph = [];
	for (const row of rows) {
		const edge = generateEdge(row.trim());
		if (edge.length == 0)
			return [];

		graph.push(edge);
	}

	return graph;
}

function generateEdge(row) {
	let nodes = row.split(" ");
	if (nodes.length != 2)
		return [];

	return nodes;
}

async function main() {
	// for (const graph of graphSamples) {
	// 	print(graph)
	// 	g.readAdjacencyList(graph);
	// 	g.drawGraph();
	// 	await sleep(5000);
	// }
}
main();