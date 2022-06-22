let fs = require("fs-extra");
let osPath = require("path");
let es = require("event-stream");
let glob = require("glob");
let mkdirp = require("mkdirp-promise");

module.exports = function(opts) {
	let options = Object.assign({
		mkdirp: false,
	}, opts);
	
	class Node {
		constructor(path) {
			this.setPath(path);
		}
		
		get isRoot() {
			return this.path === this.parent.path;
		}
		
		get parent() {
			return new Node(osPath.resolve(this.path, ".."));
		}
		
		child(path) {
			return this.rel(path);
		}
		
		rel(path) {
			return new Node(osPath.resolve(this.path, path));
		}
		
		sibling(path) {
			return this.parent.child(path);
		}
		
		pathFrom(parent) {
			if (typeof parent === "string") {
				parent = new Node(parent);
			}
			
			return osPath.relative(parent.path, this.path);
		}
		
		async mkdirp() {
			await mkdirp(this.path);
		}
		
		lines() {
			return fs.createReadStream(this.path).pipe(es.split());
		}
		
		get head() {
			return new Promise((resolve, reject) => {
				let lines = this.lines();
				let done = false;
				
				lines.on("data", (line) => {
					done = true;
					lines.destroy();
					resolve(line);
				});
				
				lines.on("error", (e) => {
					if (!done) {
						reject(e);
					}
				});
				
				lines.on("close", () => {
					if (!done) {
						resolve(null);
					}
				});
			});
		}
		
		// is the Node a descendant of parent?
		within(parent) {
			if (parent.path) {
				parent = parent.path;
			}
			
			parent = parent.replace(/\/$/, "");
			
			return this.path.indexOf(parent) === 0 && this.path.length > parent.length;
		}
		
		setPath(path) {
			this.path = osPath.resolve(path);
			this.name = osPath.basename(this.path);
			
			let extIndex = this.name.indexOf(".", 1);
			let hasExt = extIndex !== -1;
			
			this.basename = hasExt ? this.name.substr(0, extIndex) : this.name;
			this.extension = hasExt ? this.name.substr(extIndex) : "";
			this.type = this.extension.substr(1);
		}
		
		stat() {
			return fs.stat(this.path);
		}
		
		lstat() {
			return fs.lstat(this.path);
		}
		
		async delete() {
			if (await this.isDir()) {
				return this.rmdir();
			} else {
				return this.unlink();
			}
		}
		
		async rename(find, replace) {
			let newPath;
			
			if (replace) {
				newPath = this.name.replace(find, replace);
			} else {
				newPath = find;
			}
			
			newPath = this.sibling(newPath).path;
			await fs.rename(this.path, newPath);
			
			this.setPath(newPath);
		}
		
		async move(dest) {
			await this.rename(dest);
		}
		
		readdir() {
			return fs.readdir(this.path);
		}
		
		async ls() {
			return (await this.readdir()).map((path) => {
				return new Node(osPath.resolve(this.path, path));
			});
		}
		
		async glob(pattern, options) {
			return await new Promise((resolve, reject) => {
				glob(osPath.resolve(this.path, pattern), options, (e, files) => {
					if (e) {
						reject(e);
					} else {
						resolve(files.map(file => this.child(file)));
					}
				});
			});
		}
		
		async contains(filename) {
			return (await this.readdir()).indexOf(filename) !== -1;
		}
		
		async isDir() {
			try {
				return (await fs.stat(this.path)).isDirectory();
			} catch (e) {
				return false;
			}
		}
		
		async isFile() {
			try {
				return (await fs.stat(this.path)).isFile();
			} catch (e) {
				return false;
			}
		}
		
		async readJson() {
			return JSON.parse(await this.read());
		}
		
		writeJson(json) {
			return this.write(JSON.stringify(json, null, 4));
		}
		
		async read() {
			return (await fs.readFile(this.path)).toString();
		}
		
		async write(data) {
			if (options.mkdirp) {
				await this.parent.mkdirp();
			}
			
			return fs.writeFile(this.path, data);
		}
		
		exists() {
			return fs.exists(this.path);
		}
		
		rmdir() {
			return fs.rmdir(this.path);
		}
		
		unlink() {
			return fs.unlink(this.path);
		}
	}
	
	return function(path=process.cwd()) {
		return new Node(path);
	}
}
