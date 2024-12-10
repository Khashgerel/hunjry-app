document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/recipes') 
      .then(response => {
          if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.json();
      })
      .then(data => {
          if (data && data.recipes) {
              recipesData = data.recipes;
              const urlParams = new URLSearchParams(window.location.search);
              const filter = urlParams.get('filter') || 'All';
            
              applyFilter(filter);
              setupFilterButtons(); 
          } else {
              console.error('Data format error: No "recipes" array in JSON');
          }
      })
      .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

let recipesData = []; 

function displayRecipes(recipes) {
  const recipeGrid = document.querySelector('.recipe-grid');
  recipeGrid.innerHTML = ''; 

  recipes.forEach(recipe => {
      const mealTypes = recipe.mealType ? recipe.mealType.join(', ') : ''; 

      const recipeCard = document.createElement('section');
      recipeCard.classList.add('recipe-card');
      recipeCard.innerHTML = `
          <img src="${recipe.image}" alt="${recipe.name}">
          <section class="food-info">
              <h3>${recipe.name}</h3>
              <p>${recipe.caloriesPerServing} кал</p>
              <section class="ports">
                ${'<img src="/iconpic/profile.png" alt="ports">'.repeat(recipe.servings)}
              </section>
              <button class="view-recipe-btn">Жор харах</button>
          </section>
      `;
      recipeGrid.appendChild(recipeCard);
  });
}

function applyFilter(filter) {
  let filteredRecipes;
  if (filter === 'All') {
      filteredRecipes = recipesData;
  } else {
      filteredRecipes = recipesData.filter(recipe => recipe.mealType && recipe.mealType.includes(filter));
  }
  displayRecipes(filteredRecipes.slice(0, 4));

  document.querySelectorAll('.filter-btn').forEach(button => {
      if (button.textContent.trim() === filter) {
          button.classList.add('active');
      } else {
          button.classList.remove('active');
      }
  });
}

function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', () => {
          const filter = button.textContent.trim();

          const url = new URL(window.location);
          url.searchParams.set('filter', filter);
          window.history.pushState({}, '', url);

          applyFilter(filter);
      });
  });
}
