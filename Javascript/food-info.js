const itemsPerPage = 4; 
let currentPage = 1; 
let recipesData = []; 

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://dummyjson.com/recipes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.recipes) {
                recipesData = data.recipes;
                displayRecipes(currentPage);
                renderPaginationControls();
            } else {
                console.error('Data format error: No "recipes" array in JSON');
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
});

function displayRecipes(page) {
    if (!recipesData.length) {
        console.warn('No recipes to display');
        return;
    }

    const recipeGrid = document.querySelector('.recipe-grid');
    recipeGrid.innerHTML = ''; 

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const recipesToDisplay = recipesData.slice(start, end);

    recipesToDisplay.forEach(recipe => {
        const recipeCard = document.createElement('section');
        recipeCard.className = 'recipe-card';

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <section class="food-info">
                <h3>${recipe.name}</h3>
                <p>${recipe.caloriesPerServing} кал</p>
                <section class="ports">
                    ${'<img src="/iconpic/profile.png">'.repeat(recipe.servings)}
                </section>
                <button class="view-recipe-btn">Жор</button>
            </section>
        `;

        recipeGrid.appendChild(recipeCard);
    });
}

function renderPaginationControls() {
    const paginationSection = document.querySelector('.pagination');
    paginationSection.innerHTML = ''; 

    const totalPages = Math.ceil(recipesData.length / itemsPerPage);

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
