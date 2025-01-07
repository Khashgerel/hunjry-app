const itemsPerPage = 4;
let currentPage = 1;
let recipesData = [];
let filteredData = [];
let activeFilter = 'all';
/* waitForComponents функц нь хэд хэдэн custom элементүүдийг ачаалахад хүлээж байна (жишээ нь, 
хайлт хийх, шүүлт хийх, жор карт үүсгэх, хуудаслах).
Хоолны жоруудыг /api/recipes API-аас ачаалж, тэдгээрийг дэлгэц дээр харуулах.
 */

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/recipes')
    .then(response => response.json())
    .then(data => {
      if (data && data.recipes) {
        recipesData = data.recipes;

        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('mealType') || 'All';

        applyFilter(filter);
        setupFilterButtons();
        setupDropdown();
      } else {
        console.error('Data format error: No "recipes" array in JSON');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
});
/* Хайлтын үгтэй тохирсон жоруудыг шүүж, харуулдаг. Хайлтын үгийн дагуу жоруудыг фильтрлэж, 
харуулах хуудас болон хуудаслах товчийг шинэчилнэ. */

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
/* Хайлтын бар дээр хэрэглэгч текст бичих үед, тухайн бичсэн үгтэй тохирох хоолны жорууд 
dropdown буюу жагсаалтаар харуулах функц. Хэрэв тохирох жор байхгүй бол жагсаалт хаагдана. */

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
/* Хэрэглэгчийн сонгосон шүүлтээр жоруудыг фильтрлэх. Хэрэв "All" шүүлт сонгогдвол бүх жор харуулна, 
харин өөр шүүлт сонгосон бол зөвхөн тухайн төрлийн хоолнуудыг харуулна. */


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
    button.classList.toggle('active', button.textContent.trim() === filter);
  });
}
/* Шүүлт хийх товчлууруудыг тохируулах. Хэрэглэгч шүүлт хийх товчийг дарахад тухайн шүүлтээ URL-д 
хадгалаад, шүүлтийг дагуу хоолны жоруудыг фильтрлэж харуулна. */

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
/* Тухайн хуудас дээр харуулах жоруудыг тодорхойлж, recipe-card элемент ашиглан тухайн жоруудыг харуулна. */

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
}
/* Хуудаслах товчлууруудыг үүсгэж, дэлгэц дээр харуулах. Хэрэв жорууд олон хуудаст хуваагдвал, 
хуудаслах товчлуур үүсгэж, хэрэглэгч хуудас солих боломжтой болно. */

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
/* Хуудас солих үед хуудаслах товчийн идэвхжсэн байдал (active) болон бусад товчлуудыг шинэчилнэ. */

function updatePaginationButtons() {
  const paginationButtons = document.querySelectorAll('.pagination-circle');
  paginationButtons.forEach((button, index) => {
    button.classList.toggle('active', index + 1 === currentPage);
  });
}