export function print(anything, ...rest) {
	console.log(anything, ...rest);
}

export function sleep(delay) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}