// CONSTANTS //
export const DRAWING_CANVAS = document.getElementById("graph_canvas");

export class Circle {
	constructor(x, y, col, radius, content, drawingArea, randomPoint) {
		const defaultOptions = {
			x: 0,
			y: 0,
			col: "white",
			radius: 19,
			content: "",
			drawingArea: DRAWING_CANVAS,
		};

		this.x = x ?? defaultOptions.x;
		this.y = y ?? defaultOptions.y;
		this.col = col ?? defaultOptions.col;
		this.radius = radius ?? defaultOptions.radius;
		this.content = content ?? defaultOptions.content;
		this.drawingArea = drawingArea ?? defaultOptions.drawingArea;
	
		if (randomPoint)
			[this.x, this.y] = this.#randomCoords();
	}

	display() {
		const circle = `
			<circle cx="${this.x}" cy="${this.y}" r="${this.radius}" fill="${this.col}" stroke-width="2" stroke="black" />
			<text x="${this.x}" y="${this.y}" text-anchor="middle" alignment-baseline="middle" stroke="#000">${this.content}</text>
		`

		addElementToSvg(circle, this.drawingArea);
	}

	setX(x) {
		const drawAreaWidth = this.drawingArea.width.baseVal.value;
		this.x = this.#validatePos(x, drawAreaWidth - this.radius);
	}

	setY(y) {
		const drawAreaHeight = this.drawingArea.height.baseVal.value;
		this.y = this.#validatePos(y, drawAreaHeight - this.radius);
	}

	#validatePos(pos, maxRange) {
		if (pos < this.radius)
			return this.radius;
		if (pos > maxRange)
			return maxRange;

		return pos;
	}

	#randomCoords() {
		const diameter = 2*this.radius;
		const drawAreaWidth = this.drawingArea.width.baseVal.value - diameter;
		const drawAreaHeight = this.drawingArea.height.baseVal.value - diameter;

		return [Math.random()*drawAreaWidth + this.radius, Math.random()*drawAreaHeight + this.radius];
	}
}

export class Line {
	constructor(x1, y1, x2, y2, drawingArea) {
		const defaultOptions = {
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0,
			drawingArea: DRAWING_CANVAS
		}

		this.x1 = x1 ?? defaultOptions.x1;
		this.y1 = y1 ?? defaultOptions.y1;
		this.x2 = x2 ?? defaultOptions.x2;
		this.y2 = y2 ?? defaultOptions.y2;
		this.drawingArea = drawingArea ?? defaultOptions.drawingArea;
	}

	display() {
		const line = `<line x1="${this.x1}" y1="${this.y1}" x2="${this.x2}" y2="${this.y2}" stroke="black" stroke-width="2" />`
		addElementToSvg(line, this.drawingArea);
	}
}

export function clearCanvas(svg, width, height) {
	const svgWidth = width ?? svg.width.baseVal.value;
	const svgHeight = height ?? svg.height.baseVal.value;
	svg.innerHTML = `<rect width=${svgWidth} height=${svgHeight} style='fill:rgb(255,255,255);stroke-width:10;stroke:rgb(0,0,0)'/>`;
}

function addElementToSvg(element, svg) {
	svg.insertAdjacentHTML("beforeend", element);
}
