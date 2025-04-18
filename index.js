const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

require('dotenv').config();
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to My-Notebook API');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`My-Notebook app listening on port ${port}`);
});
