"use strict";

import {print, sleep} from "./utils/utils.mjs";
import {GraphUi, EdgeUi, graphSamples} from "./graph/graph-visualizer.mjs"
import {BFSVisualizer, DFSVisualizer} from "./graph/algorithm-visualizers/traversals.mjs"
import {FrontendHandler} from "./frontend/frontend.mjs"

function main() {
	new FrontendHandler();
}

main();