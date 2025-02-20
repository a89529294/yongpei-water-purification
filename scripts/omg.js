const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const dir = [];

for (const i of x) {
	async function f() {
		const num = await new Promise((r) =>
			setTimeout(() => r(i), Math.random() * 1000)
		);
		dir.push(num);
	}

	f();
}

console.log(dir);

setTimeout(() => {
	console.log(dir);
}, 10000);
