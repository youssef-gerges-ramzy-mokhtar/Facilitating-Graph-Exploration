export const print = console.log.bind(window.console);

export function sleep(delay) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}

// SingleAsync only allows the latest async function called to run and cancels all previous async functions
// The async function must ensure that they are not stopped before executing the critical secution using the callStopped() method
export class SingleAsync {
	static id = 1;
	static prevAsyncFunction = new SingleAsync(); // can we make the prevAsyncFunction non-static

	constructor() {
		this.stopped = false;
		this.id = SingleAsync.id++;
	}

	static makeNewCall() {
		SingleAsync.prevAsyncFunction.stopped = true;
		SingleAsync.prevAsyncFunction = new SingleAsync();
		return SingleAsync.prevAsyncFunction;
	}

	callStopped() {
		return this.stopped;
	}
}