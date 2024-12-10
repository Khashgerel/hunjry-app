document.addEventListener('DOMContentLoaded', () => {
  const itemsPerPage = 4;
  let currentPage = 1;

  const fetchRecipes = (page = 1, query = '', mealType = 'all') => {
    const url = `/api/recipes?page=${page}&itemsPerPage=${itemsPerPage}&query=${query}&mealType=${mealType}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        displayRecipes(data.recipes);
        renderPaginationControls(data.totalPages, data.currentPage);
      })
      .catch(error => console.error('Error fetching recipes:', error));
  };

  const displayRecipes = (recipes) => {
    const recipeGrid = document.querySelector('.recipe-grid');
    recipeGrid.innerHTML = '';

    if (recipes.length === 0) {
      recipeGrid.innerHTML = '<p>No recipes found.</p>';
      return;
    }

    recipes.forEach(recipe => {
      const recipeCard = document.createElement('section');
      recipeCard.className = 'recipe-card';
      recipeCard.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="food-pic">
        <section class="food-info">
          <h3>${recipe.name}</h3>
          <p>${recipe.caloriesPerServing || 'N/A'} кал</p>
          <section class="ports">
            ${recipe.servings ? '<img src="/iconpic/profile.png">'.repeat(recipe.servings) : 'N/A'}
          </section>
          <a href="/htmls/hool_detail.html?id=${recipe.id}">
            <button class="view-recipe-btn">Жор харах</button>
          </a>
        </section>
      `;
      recipeGrid.appendChild(recipeCard);
    });
  };

  const renderPaginationControls = (totalPages, currentPage) => {
    const paginationSection = document.querySelector('.pagination');
    paginationSection.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const paginationButton = document.createElement('button');
      paginationButton.className = 'pagination-circle';
      if (i === currentPage) paginationButton.classList.add('active');
      paginationButton.innerText = i;
      paginationButton.addEventListener('click', () => {
        fetchRecipes(i);
      });
      paginationSection.appendChild(paginationButton);
    }
  };

  fetchRecipes(currentPage);
});
