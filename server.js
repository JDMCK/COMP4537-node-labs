const https = require('https');
const en = require('./lang/en/en');
const utils = require('./modules/utils');
const fs = require('fs');

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

const server = https.createServer(options, function (req, res) {

  const basePath = "/COMP4537/labs/3/";

  const url = new URL(req.url, "https://put-domain-here");
  const params = url.searchParams;

  if (url.pathname === basePath + "getDate/") {
    apiGetDate(res, params);
  } else if (url.pathname === basePath + "writeFile/") {
    apiWriteFile(res, params);
  } else if (url.pathname.startsWith(basePath + "readFile/")) {
    apiReadFile(res, url.pathname.split("/").pop());
  } else {
    res.end("Invalid path.");
  }
});

function apiGetDate(res, params) {
  const name = params.get("name");

  res.writeHead(200, { "content-type": "text/html", "access-control-allow-credentials": "*" });
  res.end(utils.formatString(en.en["DateTimeResponseMessage"], { "NAME": name, "DATESTRING": utils.getDate() }));
}

function apiWriteFile(res, params) {

  const text = params.get("text");

  res.writeHead(200, { "content-type": "text/html", "access-control-allow-credentials": "*" });
  try {
    fs.appendFileSync("file.txt", text);
    res.end("Successfully wrote to file.txt");
  } catch (err) {
    res.end("Failed to write to file.txt");
  }
}

function apiReadFile(res, fileName) {
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}.`);
})