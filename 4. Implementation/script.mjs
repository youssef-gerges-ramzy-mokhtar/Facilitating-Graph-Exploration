"use strict";

import {print, sleep} from "./utils/utils.mjs";
import {GraphUi, EdgeUi, graphSamples} from "./graph/graph-visualizer.mjs"

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


/* Initial Code to Visualize BFS (alot of problems in the code)
	. Code is not Clean & DRY
	. Choose better colors for the visualization process
	. Visualizing BFS in an undirected GRAPH results in an unatural visualization (see about that)
		- the reason for not having an unatural visualization is that you store edges in reverse directions
		- some how you need to convert it to a dummy directed graph to simulate a natural visualization
	. You should provide more methods in the Line Class to be able to customize how the line is displayed
*/

async function visualize_playing() {
	const graph = [
		[1, 4],
		[3],
		[4],
		[4, 2]
	];
	g.readAdjacencyList(graph)
	g.drawGraph()

	// BFS
	const start = 0
	const q = [start];
	const vis = new Set();
	vis.add(0);

	const diGraph = g.getGraph().getDirectedAdjList();
	for (let sz = q.length; q.length !== 0; sz = q.length) {
		while (sz--) {
			const nodeId = q[0];
			q.shift();

			const curNode = g.getCircle(nodeId);
			curNode.setColor("lightBlue");
			g.displayGraph();
			await sleep(1500);

			for (const neighbour of diGraph[nodeId]) {
				const neighbourNode = g.getCircle(neighbour);
				
				const edge = g.getEdge(nodeId, neighbour);
				edge.getLine().setStrokeCol("cyan");
				g.displayGraph();
				await sleep(1000);

				if (!vis.has(neighbour)) {
					q.push(neighbour);
					vis.add(neighbour);

					neighbourNode.setColor("yellow");
					neighbourNode.display();
					await sleep(1000);

					edge.getLine().setStrokeWidth(4);
				} else
					edge.getLine().setStrokeWidth(2);

				edge.getLine().setStrokeCol("black");
				g.displayGraph();
				await sleep(1000);
			}
			
			curNode.setColor("lightGreen");
			g.displayGraph();
			await sleep(1000);
		}
	}
}
visualize_playing();

// async function main() {
// 	for (const graph of graphSamples) {
// 		g.readAdjacencyList(graph);
// 		g.drawGraph();
// 		await sleep(5000);
// 	}
// }
// main();