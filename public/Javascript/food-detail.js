document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = parseInt(urlParams.get('id'), 10);

  if (!recipeId) {
    console.error('Recipe ID not found in URL');
    return;
  }

  fetch(`/api/recipes/${recipeId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.statusText}`);
      }
      return response.json();
    })
    .then(recipe => {
      if (!recipe) {
        console.error('Recipe not found');
        return;
      }

      updateImage(recipe);
      updateIngredient(recipe);
      setupSuggestedFood(recipeId, recipe.mealType);
    })
    .catch(error => console.error('Error fetching recipe data:', error));
});

function setupSuggestedFood(currentId, mealType) {
  const sugFoods = document.querySelector('.suggested-foods');
  sugFoods.innerHTML = '';

  fetch('/api/recipes')
    .then(response => response.json())
    .then(data => {
      const suggestions = data
        .filter(recipe => recipe.mealType.includes(mealType) && recipe.id !== currentId)
        .slice(0, 2);

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
    })
    .catch(error => console.error('Error fetching suggestions:', error));
}

function updateImage(recipe) {
  const recipeImage = document.querySelector('.recipe-image');
  recipeImage.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}">
    <h3>${recipe.name}</h3>
    <article class="icon">
      <section class="icons-container">
        <img src="/iconpic/heart.png" alt="like">
        <img src="/iconpic/comment.png" alt="comment">
      </section>
      <nav class="rating-container">
        ${'<img src="/iconpic/pizza.png" alt="unelgee">'.repeat(recipe.rating || 0)}
      </nav>
    </article>
  `;
}

function updateIngredient(recipe) {
  const recipeContent = document.querySelector('.recipe-content');
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
}
