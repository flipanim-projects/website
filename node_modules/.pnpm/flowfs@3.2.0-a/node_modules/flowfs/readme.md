flowfs
======

I wrote flowfs because I could never remember the names and signatures of the `fs` and related APIs, and because manipulating paths as strings is awkward and error-prone.  Dealing with files was always a point where I would be knocked out of the zone by having to refer to docs, and run throwaway tests to make sure I was doing it right.

flowfs attempts to solve these issues by exposing an intuitive API that represents files as objects.  Navigation between nodes is via properties; for example, if you're implementing an "include" directive for a template language and need to calculate a relative path -- instead of this:

```javascript
// old, bad, awkward, error-prone, annoying, hard-to-remember way:

const fs = require("fs");
const path = require("path");

function include (templatePath, includePath) {
	let parent = fs.dirname(templatePath);
	
	return path.resolve(parent, includePath); // or something
}
```

... you would do this:

```javascript
// flowfs way:

const fs = require("flowfs");

function include (templatePath, includePath) {
	return fs(templatePath).parent.child(includePath).path;
}
```

Instantiating and navigating between nodes doesn't do any IO, it just does string manipulation internally -- `fs("/path/to/non-existent/file")` is perfectly valid, and is the recommended way to create new files with flowfs, for example:

```javascript
await fs("/new/file").write("some data");
```
