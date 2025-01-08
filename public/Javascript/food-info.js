const itemsPerPage = 4;
let currentPage = 1;
let recipesData = [];
let filteredData = [];
let activeFilter = 'all';

function waitForComponents() {
    return Promise.all([
        customElements.whenDefined('search-input'),
        customElements.whenDefined('filter-btn'),
        customElements.whenDefined('recipe-card'),
        customElements.whenDefined('page-pagination')
    ]);
}

document.addEventListener('DOMContentLoaded', async () => {
    await waitForComponents();

    try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        
        if (data && data.recipes) {
            recipesData = data.recipes;
            filteredData = recipesData;
            displayRecipes(currentPage);
            updatePagination();
        }
    } catch (error) {
        console.error('Error:', error);
    }

    document.addEventListener('filter-click', (e) => {
        const filter = e.detail.filter;
        applyFilter(filter);
    });

    document.addEventListener('search', (e) => {
        filterRecipes(e.detail.query);
    });

    document.addEventListener('page-change', (e) => {
        currentPage = e.detail.page;
        displayRecipes(currentPage);
        updatePagination();
    });
});

const filterRecipes = (query) => {
  query = query.trim().toLowerCase();
  currentPage = 1;

  filteredData = recipesData.filter(recipe =>
    recipe.name.toLowerCase().includes(query)
  );

  if (filteredData.length === 0) {
    document.querySelector('.recipe-grid').innerHTML = '<p>No recipes found.</p>';
    document.querySelector('.pagination').innerHTML = '';
    return;
  }

  displayRecipes(currentPage);
  renderPaginationControls();
};

function setupDropdown() {
  const searchBar = document.querySelector('.search-bar');
  const dropdownContainer = document.querySelector('.dropdown-container');
  const searchbar = document.querySelector('#search-bar');
  dropdownContainer.innerHTML = '';
  dropdownContainer.style.display = 'none';
  
  searchbar.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    dropdownContainer.innerHTML = '';

    if (query) {
      const filteredRecipes = recipesData.filter(recipe =>
        recipe.name.toLowerCase().includes(query)
      );

      if (filteredRecipes.length > 0) {
        filteredRecipes.forEach(recipe => {
          const foodItem = document.createElement('section');
          foodItem.className = 'food-name';
          foodItem.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <a href='/htmls/hool_detail.html?id=${recipe.id}'>${recipe.name}</a>
          `;
          dropdownContainer.appendChild(foodItem);
        });
        dropdownContainer.style.display = 'block'; 
      } else {
        dropdownContainer.style.display = 'none'; 
      }
    } else {
      dropdownContainer.style.display = 'none'; 
    }
    searchBar.appendChild(dropdownContainer);
  });
}


function applyFilter(filter) {
  if (filter === 'All') {
    filteredData = recipesData;
  } else {
    filteredData = recipesData.filter(recipe =>
      recipe.mealType.some(type => type === filter)
    );
  }
  currentPage = 1;
  displayRecipes(currentPage);
  renderPaginationControls();
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.toggle('active', button.getAttribute('filter') === filter);
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
    const recipeCard = document.createElement('recipe-card');
    recipeCard.recipe = recipe;
    recipeGrid.appendChild(recipeCard);
  });
}

function renderPaginationControls() {
  const paginationSection = document.querySelector('.pagination');
  paginationSection.innerHTML = '';

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (totalPages === 0) {
    paginationSection.innerHTML = '<p>No pages to display.</p>';
    return;
  }

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

function updatePagination() {
  const pagination = document.querySelector('page-pagination');
  pagination.pages = {
    current: currentPage,
    total: Math.ceil(filteredData.length / itemsPerPage)
  };
}