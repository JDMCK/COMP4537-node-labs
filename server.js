const http = require('http');
const en = require('./lang/en/en');
const utils = require('./modules/utils');
const fs = require('fs');

const server = http.createServer(function (req, res) {

  const basePath = "3000/COMP4537/labs/3/";

  const url = new URL(req.headers.host + req.url);
  console.log(url.pathname);
  if (url.pathname === basePath + "getDate/") {
    apiGetDate(req, res);
  } else if (url.pathname === basePath + "writeFile/") {
    apiWriteFile(req, res);
  } else if (url.pathname.startsWith(basePath + "readFile/")) {
    apiReadFile(req, res, url.pathname.split("/").pop());
  } else {
    res.end("Invalid path.");
  }
});

function apiGetDate(req, res) {
  const url = new URL(req.headers.host + req.url);
  const name = url.searchParams.get("name");

  console.log(name);

  res.writeHead(200, { "content-type": "text/html", "access-control-allow-credentials": "*" });
  res.end(utils.formatString(en.en["DateTimeResponseMessage"], { "NAME": name, "DATESTRING": utils.getDate() }));
}

function apiWriteFile(req, res) {

  const url = new URL(req.headers.host + req.url);

  const text = url.searchParams.get("text");

  res.writeHead(200, { "content-type": "text/html", "access-control-allow-credentials": "*" });
  try {
    fs.appendFileSync("file.txt", text);
    res.end("Successfully wrote to file.txt");
  } catch (err) {
    res.end("Failed to write to file.txt");
  }
}

function apiReadFile(req, res, fileName) {
  try {
    const text = fs.readFileSync(fileName).toString();
    res.writeHead(200, { "content-type": "text", "access-control-allow-credentials": "*" });
    res.end(text);
  } catch (err) {
    res.writeHead(404, { "content-type": "text/html", "access-control-allow-credentials": "*" });
    res.end(`File: '${fileName}' doesn't exist or cannot be accessed.`);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
})