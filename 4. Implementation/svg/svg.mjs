// CONSTANTS //
export const DRAWING_CANVAS = document.getElementById("graph_canvas");

export class Circle {
	static defaultOptions = {
		x: 0,
		y: 0,
		col: "white",
		radius: 19,
		content: "",
		drawingArea: DRAWING_CANVAS,
	}

	constructor(x, y, col, radius, content, drawingArea, randomPoint) {
		this.#initCircle(x, y, col, radius, content, drawingArea, randomPoint);
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

	setColor(col) {
		this.col = col ?? this.defaultOptions.col;
	}

	resetDefaults() {
		this.#initCircle(this.x, this.y, undefined, undefined, this.content);
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

	#initCircle(x, y, col, radius, content, drawingArea, randomPoint) {
		this.x = x ?? Circle.defaultOptions.x;
		this.y = y ?? Circle.defaultOptions.y;
		this.col = col ?? Circle.defaultOptions.col;
		this.radius = radius ?? Circle.defaultOptions.radius;
		this.content = content ?? Circle.defaultOptions.content;
		this.drawingArea = drawingArea ?? Circle.defaultOptions.drawingArea;
	
		if (randomPoint)
			[this.x, this.y] = this.#randomCoords();
	}
}

export class Line {
	static defaultOptions = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		strokeWidth: 2,
		strokeCol: "black",
		drawingArea: DRAWING_CANVAS,
		hasArrow: false,
		label: "123"
	}

	constructor(x1, y1, x2, y2, drawingArea, hasArrow, label) {
		this.#initLine(x1, y1, x2, y2, drawingArea, hasArrow, label);
	}

	setStrokeWidth(strokeWidth) {
		this.strokeWidth = strokeWidth;
	}

	setStrokeCol(strokeCol) {
		this.strokeCol = strokeCol;
	}

	setCoords(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	setHasArrow(hasArrow) {
		this.hasArrow = hasArrow;
	}

	resetDefaults() {
		this.#initLine(this.x1, this.y1, this.x2, this.y2, this.drawingArea, this.hasArrow);
	}

	display() {
		addElementToSvg(this.#createLineEl(), this.drawingArea);
	}

	#createLineEl() {
		let line = `
			<line x1="${this.x1}" y1="${this.y1}" x2="${this.x2}" y2="${this.y2}" stroke="${this.strokeCol}" stroke-width="${this.strokeWidth}" marker-end="url(#arrow)"  />
		`

		line += this.#createLineLabelEl();
		line += (this.hasArrow ? this.#createArrowEl() : "");

		return line;
	}

	#createArrowEl() {
		const arrow = `
			<marker 
				id="arrow"
				viewBox="0 0 10 10" 
				refX="10"
				refY="5" 
				markerWidth="15" 
				markerHeight="6" 
				orient="auto-start-reverse"> 
				<path d="M 0 0 L 10 5 L 0 10 z" />
	  		</marker>
		`

		return arrow;
	}

	#createLineLabelEl() {
		const x = (this.x1 + this.x2) / 2;
		const y = (this.y1 + this.y2) / 2;

		const text = `
			<text
				x=${x}
				y=${y}
				transform="rotate(${this.#getTextAngle()}, ${x}, ${y})"
				text-anchor="middle"
				font-size="15px"
				font-weight="bold"
				dy="-0.35em"
			>
				${this.label}
			</text>
		`;

		return text;
	}

	#getTextAngle() {
		const opp = Math.abs(this.y2 - this.y1);
		const hyp = Math.sqrt(Math.pow(this.y2 - this.y1, 2) + Math.pow(this.x2 - this.x1, 2));
		let angle = Math.asin(opp/hyp) * (180/Math.PI);

		const gradient = (this.y2 - this.y1)/(this.x2 - this.x1); // division by zero doesn't result in an error in JavaScript
		if (gradient < 0)
			angle *= -1;

		return angle;
	}

	#initLine(x1, y1, x2, y2, drawingArea, hasArrow, label) {
		this.x1 = x1 ?? Line.defaultOptions.x1;
		this.y1 = y1 ?? Line.defaultOptions.y1;
		this.x2 = x2 ?? Line.defaultOptions.x2;
		this.y2 = y2 ?? Line.defaultOptions.y2;
		this.drawingArea = drawingArea ?? Line.defaultOptions.drawingArea;
		this.hasArrow = hasArrow ?? Line.defaultOptions.hasArrow;
		this.label = label ?? Line.defaultOptions.label;

		this.strokeWidth = Line.defaultOptions.strokeWidth;
		this.strokeCol = Line.defaultOptions.strokeCol;
	}
}

export function clearCanvas(svg, width, height) {
	const svgWidth = width ?? svg.width.baseVal.value;
	const svgHeight = height ?? svg.height.baseVal.value;
	svg.innerHTML = `<rect width=${svgWidth} height=${svgHeight} style='fill:rgb(255,255,255);stroke-width:4;stroke:rgb(0,0,0)'/>`;
}

function addElementToSvg(element, svg) {
	svg.insertAdjacentHTML("beforeend", element);
}