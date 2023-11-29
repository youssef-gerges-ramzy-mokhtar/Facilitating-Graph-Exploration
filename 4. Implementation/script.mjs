"use strict";

import {print, sleep} from "./utils/utils.mjs";
import {GraphUi, graphSamples} from "./graph/graph-visualizer.mjs"

async function main() {
	const g = new GraphUi();
	for (const graph of graphSamples) {
		g.readAdjacencyList(graph);
		g.drawGraph();
		await sleep(5000);
		// break;
	}
}
main();