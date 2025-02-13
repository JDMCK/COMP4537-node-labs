const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'lab5server',
  password: 'lab5db',
  database: 'lab5',
  port: 3306
});

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});
