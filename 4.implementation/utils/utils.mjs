export const print = console.log.bind(window.console);

export function sleep(delay) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}

// SingleAsync only allows the latest async function called to run and cancels all previous async functions
// The async function must ensure that they are not stopped before executing the critical secution using the callStopped() method
export class SingleAsync {
	static id = 1;

	constructor() {
		this.stopped = false;
		this.id = SingleAsync.id++;
		this.prevAsyncFunction = null;
	}

	makeNewCall() {
		if (this.prevAsyncFunction !== null)
			this.prevAsyncFunction.stopped = true;
		
		this.prevAsyncFunction = new SingleAsync();
		return this.prevAsyncFunction;
	}

	callStopped() {
		return this.stopped;
	}
}