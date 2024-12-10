const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const recipesData = JSON.parse(fs.readFileSync('./json/recipes.json'));

app.get('/api/recipes', (req, res) => {
  const { page = 1, itemsPerPage = 4, query = '', mealType = 'all' } = req.query;

  let filteredData = recipesData.recipes;

  if (mealType !== 'all') {
    filteredData = filteredData.filter(recipe =>
      recipe.mealType.some(type => type.toLowerCase() === mealType.toLowerCase())
    );
  }

  if (query) {
    filteredData = filteredData.filter(recipe =>
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  const total = filteredData.length;
  const start = (page - 1) * itemsPerPage;
  const end = start + parseInt(itemsPerPage, 10);
  const paginatedData = filteredData.slice(start, end);

  res.json({
    recipes: paginatedData,
    total,
    totalPages: Math.ceil(total / itemsPerPage),
    currentPage: parseInt(page, 10),
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
