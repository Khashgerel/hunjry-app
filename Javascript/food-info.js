const itemsPerPage = 4;
let currentPage = 1;
let recipesData = [];
let filteredData = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  fetch('/json/recipe.json')
    .then(response => response.json())
    .then(data => {
      if (data && data.recipes) {
        recipesData = data.recipes;

        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('mealType') || 'All';

        applyFilter(filter);
        setupFilterButtons();
      } else {
        console.error('Data format error: No "recipes" array in JSON');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

function applyFilter(filter) {
  if (filter === 'All') {
    filteredData = recipesData;
  } else {
    filteredData = recipesData.filter(recipe => recipe[0].mealType[0] === filter || recipe[0].mealType[1] === filter || recipe[0].mealType[2] === filter);
  }
  currentPage = 1;
  displayRecipes(currentPage);
  renderPaginationControls();
  document.querySelectorAll('.filter-btn').forEach(button => {
    if (button.textContent.trim() === filter) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
});
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.getAttribute('data-filter');
      const url = new URL(window.location);
      url.searchParams.set('mealType', activeFilter);
      window.history.pushState({}, '', url);

      applyFilter(activeFilter);
    });
  });
}

function displayRecipes(page) {
  const recipeGrid = document.querySelector('.recipe-grid');
  recipeGrid.innerHTML = '';

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const recipesToDisplay = filteredData.slice(start, end);

  recipesToDisplay.forEach(recipe => {
    const recipeCard = document.createElement('section');
    recipeCard.className = 'recipe-card';

    recipeCard.innerHTML = `
            <img src="${recipe.english.image}" alt="${recipe.english.name}">
            <section class="food-info">
                <h3>${recipe.english.name}</h3>
                <p>${recipe.english.caloriesPerServing} кал</p>
                <section class="ports">
                    ${'<img src="/iconpic/profile.png">'.repeat(recipe.english.servings)}
                </section>
                <button class="view-recipe-btn"><a href="/htmls/hool_detail.html?id=${recipe.english.id}">Жор харах</button>
            </section>
        `;

    recipeGrid.appendChild(recipeCard);
  });
}

function renderPaginationControls() {
  const paginationSection = document.querySelector('.pagination');
  paginationSection.innerHTML = '';

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const paginationButton = document.createElement('button');
    paginationButton.className = 'pagination-circle';
    if (i === currentPage) paginationButton.classList.add('active');

    paginationButton.innerText = i;
    paginationButton.addEventListener('click', () => {
      currentPage = i;
      displayRecipes(currentPage);
      updatePaginationButtons();
    });

    paginationSection.appendChild(paginationButton);
  }
}

function updatePaginationButtons() {
  const paginationButtons = document.querySelectorAll('.pagination-circle');
  paginationButtons.forEach((button, index) => {
    button.classList.toggle('active', index + 1 === currentPage);
  });
}