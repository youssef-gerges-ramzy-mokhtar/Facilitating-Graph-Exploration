export const print = console.log.bind(window.console);

export function sleep(delay) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}