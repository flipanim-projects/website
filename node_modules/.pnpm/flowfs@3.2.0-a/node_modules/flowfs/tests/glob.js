let fs = require("../index");

async function go() {
	console.log((await fs("/home/gus/projects/flowfs").glob("**/*.js")).map(n => n.path));
}

go();
