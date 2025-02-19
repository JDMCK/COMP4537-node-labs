const http = require('http');
const en = require('./lang/en/en');
const lang = require('./lang/utils');
const mysql = require('mysql2/promise');

class Server {

  constructor() {

    this.PORT = 3002;
    
    // Initialize db connection
    this.tableName = 'patients';
    this.dbConnect();

    // Initialize server
    this.server = http.createServer((req, res) => {
      const basePath = "/COMP4537/labs/5/";
    
      const url = new URL(req.url, "http://put-domain-here");
    
      if (url.pathname !== basePath) {
        res.writeHead(404, { "content-type": "text/html" });
        res.end(utils.formatString(en.en["404Message"], { "PATH": url.pathname }));
        return;
      }

      if (req.method === "OPTIONS") {
        // Set necessary CORS headers
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": 86400 // Cache preflight response
        });
        res.end();
      } else if (req.method === "POST") {
        this.queryType = "INSERT";
        this.dbInsert(req, res);
      } else if (req.method === "GET") {
        this.queryType = "SELECT";
        this.dbSearch(res, url.searchParams.get("query"));
      } else {
        res.writeHead(404, { "content-type": "text/html" });
        res.end(utils.formatString(en.en["404Message"], { "PATH": url.pathname }));
      }
    });
  }

  async checkCreateTable(connection) {
    try {
      const [rows] = await connection.query(
      "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
      [this.tableName]
      );

      if (rows[0].count >= 1) {
        return;
      }
      
      console.log(`Creating new ${this.tableName} table...`);
      await connection.query(
        `CREATE TABLE patients (
          patientid INT AUTO_INCREMENT,
          name VARCHAR(100),
          dateOfBirth DATETIME,
          PRIMARY KEY(patientid)
        )`
      );
      console.log(`Successfully created ${this.tableName} table.`);
    } catch (error) {
      console.error(`Failed to create ${this.tableName} table.`, error);
    }
  }

  async dbConnect() {
    try {
      this.adminConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'lab5db',
        database: 'lab5',
        port: 3306
      });

      this.userConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'lab5server',
        password: 'lab5db',
        database: 'lab5',
        port: 3306
      });
      console.log("Successfully connected to database.");
    } catch (error) {
      console.error("Failed to connect to database.", error);
    }

    await this.checkCreateTable(this.adminConnection);
  }

  async dbSearch(res, query) {
    try {
      await this.checkCreateTable(this.adminConnection);
      const [rows] = await this.userConnection.query(query);

      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({
        rows,
        message: lang.formatString(en.en["QuerySuccess"], { "TYPE": this.queryType }),
        received: query }));
    } catch (error) {
      console.error(error);
      if (error.errno === 1142) {// 'ER_TABLEACCESS_DENIED_ERROR'
        res.writeHead(403, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          message: en.en["PermissionDeniedMessage"],
          received: query }));
        return;
      }
      res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({
        message: en.en["InternalServerError"],
        received: query }));
    }
  }

  dbInsert(req, res) {

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on('end', async () => {
      const parsedData = JSON.parse(body);
      try {
        await this.checkCreateTable(this.adminConnection);
        const [result] = await this.userConnection.query(parsedData.query);
  
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          message: lang.formatString(en.en["QuerySuccess"], { "TYPE": this.queryType }),
          received: parsedData }));
      } catch (error) {
        console.error(error);
        if (error.errno === 1142) {// 'ER_TABLEACCESS_DENIED_ERROR'
          res.writeHead(403, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({
            message: en.en["PermissionDeniedMessage"],
            received: parsedData }));
          return;
        }
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
          message: en.en["InternalServerError"],
          received: parsedData }));
      }
    });
  }
  
  start() {
    this.server.listen(this.PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${this.PORT}.`);
    });
  }
}

new Server().start();