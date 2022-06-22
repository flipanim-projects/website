let fs = require("../index");

let csv = fs("./obd.csv");

async function go() {
	console.log(await csv.head);
}

go();
