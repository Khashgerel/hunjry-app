document.addEventListener('DOMContentLoaded', () => {
  fetch('/json/recipe.json')
    .then(response => response.json())
    .then(data => {
      if (data && data.recipes) {
        recipesData = data.recipes;

        const urlParams = new URLSearchParams(window.location.search);
        const filter = parseInt(urlParams.get('id'));
        const recipe = recipesData.find(recipe => recipe.id === filter);

        updateImage(filter);
        setupSuggestedFood(filter, recipe.mealType);
        updateIngredient(filter);
      } else {
        console.error('Data format error: No "recipes" array in JSON');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

function setupSuggestedFood(id, mealtype) {
  const sugFoods = document.querySelector('.suggested-foods');
  sugFoods.innerHTML = ''; 
  const filteredData = recipesData.filter(recipe =>
    recipe.mealType.includes(mealtype) && recipe.id !== id
  );

  const suggestions = filteredData.slice(0, 2);

  if (suggestions.length === 0) {
    sugFoods.innerHTML = `<p>No suggestions available for this meal type.</p>`;
    return;
  }

  suggestions.forEach(recipe => {
    const sugFood = document.createElement('section');
    sugFood.className = 'suggested-food';
    sugFood.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">
      <h3>${recipe.name}</h3>
    `;
    sugFoods.appendChild(sugFood);
  });
}

function updateImage(filter) {
  const recipeImage = document.querySelector('.recipe-image');
  recipeImage.innerHTML = '';

  const recipe = recipesData.find(recipe => recipe.id === filter);

  if (recipe) {
    recipeImage.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">
      <h3>${recipe.name}</h3>
      <article class="icon">
        <section class="icons-container">
          <img src="/iconpic/heart.png" alt="like">
          <img src="/iconpic/comment.png" alt="comment">
        </section>
        <nav class="rating-container">
          ${recipe.rating ? '<img src="/iconpic/pizza.png" alt="unelgee">'.repeat(recipe.rating) : 'N/A'}
        </nav>
      </article>
    `;
  } else {
    recipeImage.innerHTML = `<p>Recipe not found.</p>`;
  }
}

function updateIngredient(filter) {
  const recipeContent = document.querySelector('.recipe-content');
  recipeContent.innerHTML = '';

  const recipe = recipesData.find(recipe => recipe.id === filter);

  if (recipe) {
    recipeContent.innerHTML = `
      <section class="ingredients">
        <h2>Орц</h2>
        <ol>
          ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ol>
      </section>
      <section class="instructions">
        <h2>Заавар</h2>
        <p>${recipe.instructions.join('<br>')}</p>
      </section>
    `;

    const url = new URL(window.location);
    url.searchParams.set('id', recipe.id);
    window.history.pushState({}, '', url);
  } else {
    recipeContent.innerHTML = `<p>Recipe details not found.</p>`;
  }
}
