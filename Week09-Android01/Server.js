var http = require('http');
var url = require('url');
var port = process.env.PORT || 30025;
var fs = require('fs');
var path = require('path');

function getPath(request) {
	return url.parse(request.url).pathname;
}

// Thanks to Wallace: http://stackoverflow.com/a/1203361/253576
function getExtension(fileName) {
	var fileNameArray = fileName.split(".");
	if (fileNameArray.length === 1 || (fileNameArray[0] === "" && fileNameArray.length === 2 )) {
		return "";
	}
	return fileNameArray.pop().toLowerCase();
}

// Add endsWith method to String
if ( typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

var findFile = function(dir, fileName, done) {
	var results = [];
	var ext = path.extname(fileName);
	try {
		fs.readdir(dir, function(err, list) {

			if (err) {
				console.log("ERROR!!!!");
				return done(err);
			}
			var pending = list.length;
			if (!pending)
				return done(null, results);
			try {
				list.forEach(function(file) {
					file = dir + '/' + file;
					fs.stat(file, function(err, stat) {
						if (stat && stat.isDirectory()) {
							findFile(file, fileName, function(err, res) {
								results = results.concat(res);
								if (!--pending)
									done(null, results);
							});
						} else {
							//console.log("Pending: " + pending + " File " + file);
							var newExt = path.extname(file);
							if (newExt !== "" && newExt === ext) {
								if (file.endsWith(fileName)) {
									file = file.replace(/\\/g, '\/');
									results.push(file);
								}
							} else {
								//console.log("Rejecting: " + file + " FileName " + fileName);
							}
							if (!--pending) {
								done(null, results);
							}
						}
					});
				});
			} catch(e) {
				throw e;
			}
		});
	} catch(e) {
		console.log("Can't read");
	}
};

function getFile(fileName) {
	try {
		return fs.readFileSync(fileName);
	} catch(e) {
		console.log('***** ELF ERROR REPORT *****');
		console.log(e.name);
		console.log('Can not open: ' + fileName);
		console.log(e.message);
		console.log('***** END ERROR REPORT *****');
		return null;
	}
}

function getType(ext) {
	switch (ext) {
		case 'css': 
			return 'text/css';
		case 'html':
		case 'htm':
			return 'text/html';
		case 'js':
			return 'text/javascript';
		default:
			throw 'Unknown type: ' + ext;
	}
}

function loadContent(request, response) {
	var path = getPath(request);
	var ext = getExtension(path);
	console.log("Request for " + path + " received.");
	if (ext === 'css' || ext === 'html' || ext === 'htm' || ext === 'js') {
		findFile(__dirname, path.replace('\/', ''), function(err, results) {
			console.log("Found: " + path);			
			var css = getFile(results[0]);
			if (css === null) {
				throw "Can't find: " + path;
			} else {
				response.writeHead(200, {
					'Content-Type' : getType(ext)
				});
				response.write(css);
				response.end();
			}
		});
	} else if (getExtension(path) === 'png' || getExtension(path) === 'gif' || getExtension(path) === 'jpg') {
		findFile(__dirname, path.replace('\/', ''), function(err, results) {
			console.log("Found: " + path);
			fs.readFile(results[0], "binary", function(err, file) {
				if (err) {
					console.log("Error reading binary file");
					response.writeHeader(500, {
						"Content-Type" : "text/plain"
					});
					response.write(err + "\n");
					response.end();
				} else {
					response.writeHeader(200, {
						"Content-Type" : "image/png"
					});
					response.write(file, "binary");
					response.end();
				}
			});
		});
	} else {
		var html = fs.readFileSync(__dirname + '/index.html');
		response.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		response.write(html);
		response.end();
	}
}


http.createServer(loadContent).listen(port);
console.log("Server has started on port: " + port);
