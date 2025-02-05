const http = require('http');
const en = require('./lang/en/en');
const utils = require('./modules/utils');
const fs = require('fs');
class Server {

  constructor() {

    this.PORT = 3001;
    this.requestCount = 0;
    this.dbPath = "dictionary.db";

    this.server = http.createServer((req, res) => {
      this.requestCount++;
      const basePath = "/COMP4537/labs/4/";
    
      const url = new URL(req.url, "http://put-domain-here");
    
      if (url.pathname !== basePath) {
        res.writeHead(404, { "content-type": "text/html" });
        res.end(utils.formatString(en.en["404Message"], { "PATH": url.pathname }));
        return;
      }

      if (req.method === "POST") {
        this.apiStore(req, res);
      } else if (req.method === "GET") {
        this.apiSearch(url.searchParams, res);
      } else {
        res.writeHead(404, { "content-type": "text/html" });
        res.end(utils.formatString(en.en["404Message"], { "PATH": url.pathname }));
      }
    });
  }

  apiStore(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on('end', () => {
      const parsedData = JSON.parse(body);
      try {
        if (fs.existsSync(this.dbPath) === false) {
          fs.writeFileSync(this.dbPath, "{}");
        }
        const dictionary = fs.readFileSync(this.dbPath);
        const jsonDictionary = JSON.parse(dictionary);
        const word = parsedData["word"];
        const definition = parsedData["definition"];

        if (!word || !definition) {
          res.writeHead(422, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({
            serverRequestCount: this.requestCount,
            message: en.en["BadInputErrorMessage"],
            received: parsedData }));
          return;
        }

        jsonDictionary[word] = definition;
  
        fs.writeFileSync(this.dbPath, JSON.stringify(jsonDictionary));
  
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          serverRequestCount: this.requestCount,
          message: utils.formatString(en.en["StoreSuccessMessage"], { "WORD": word }),
          received: parsedData }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          serverRequestCount: this.requestCount,
          message: en.en["StoreErrorMessage"],
          received: parsedData }));
      }
    });
  }

  apiSearch(params, res) {

    const word = params.get("word");

    if (fs.existsSync(this.dbPath) === false) {
      fs.writeFileSync(this.dbPath, "{}");
    }

    if (!word) {
      res.writeHead(422, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({
        serverRequestCount: this.requestCount,
        message: en.en["BadInputErrorMessage"],
        received: word }));
      return;
    }

    const definitions = fs.readFileSync(this.dbPath);
    const jsonDefinitions = JSON.parse(definitions);
    const definition = jsonDefinitions[word];

    if (definition === undefined) {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({
        word: word,
        defintion: undefined,
        error: utils.formatString(en.en["NoDefinitionMessasge"], { "WORD": word }),
      }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({
      word: word,
      defintion: definition,
      error: "",
    }));
  }
  
  start() {
    this.server.listen(this.PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${this.PORT}.`);
    });
  }
}

new Server().start();