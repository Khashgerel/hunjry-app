const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const recipesData = JSON.parse(fs.readFileSync('./json/recipes.json'));
const ingredientsData = JSON.parse(fs.readFileSync('./json/ingredients.json'));

app.get('/api/recipes', (req, res) => {
  res.json(recipesData);
});

app.get('/api/ingredients', (req, res) => {
  res.json(ingredientsData);
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'htmls', 'nuur.html'));
});

app.get('/htmls/:file', (req, res) => {
  const file = req.params.file;
  res.sendFile(path.join(__dirname, 'public', 'htmls', file));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

