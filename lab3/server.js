const http = require('http');
const en = require('./lang/en/en');
const utils = require('./modules/utils');
const fs = require('fs');
class Server {

  constructor() {

    this.PORT = 3000;

    this.server = http.createServer((req, res) => {
  
      const basePath = "/COMP4537/labs/3/";
    
      const url = new URL(req.url, "http://put-domain-here");
      const params = url.searchParams;
    
      if (url.pathname === basePath + "getDate/") {
        this.apiGetDate(res, params);
      } else if (url.pathname === basePath + "writeFile/") {
        this.apiWriteFile(res, params);
      } else if (url.pathname.startsWith(basePath + "readFile/")) {
        this.apiReadFile(res, url.pathname.split("/").pop());
      } else {
        res.end(en.en["InvalidPathMessage"]);
      }
    });
  }
    
  apiGetDate(res, params) {
    const name = params.get("name");
  
    res.writeHead(200, { "content-type": "text/html", "Access-Control-Allow-Origin": "*" });
    res.end(utils.formatString(en.en["DateTimeResponseMessage"], { "NAME": name, "DATESTRING": utils.getDate() }));
  }
  
  apiWriteFile(res, params) {
  
    const text = params.get("text");
  
    res.writeHead(200, { "content-type": "text/html", "Access-Control-Allow-Origin": "*" });
    try {
      fs.appendFileSync("file.txt", text);
      res.end("Successfully wrote to file.txt");
    } catch (err) {
      res.end("Failed to write to file.txt");
    }
  }
  
  apiReadFile(res, fileName) {
    try {
      const text = fs.readFileSync(fileName).toString();
      res.writeHead(200, { "content-type": "text", "Access-Control-Allow-Origin": "*" });
      res.end(text);
    } catch (err) {
      res.writeHead(404, { "content-type": "text/html", "Access-Control-Allow-Origin": "*" });
      res.end(utils.formatString(en.en["FileErrorMessage"], { "FILENAME": fileName }));
    }
  }
  
  start() {
    this.server.listen(this.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${this.PORT}.`);
    });
  }
}

new Server().start();