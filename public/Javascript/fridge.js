let recipesData = [];
let ingredientsData = [];
let activeIngredients = [];

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
                filterFood();
            } else {
                console.error('Data format error: No "recipes" array in JSON');
            }
        })
        .catch(error => console.error('Error fetching recipes:', error));

    fetch('/api/ingredients')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(dt => {
            if (dt) {
                ingredientsData = dt;
                setupIngredients();
                searchIngredients();
                selectIngredient();
                //setupDropdown();
            } else {
                console.error('Data format error: No valid data in JSON');
            }
        })
        .catch(error => console.error('Error fetching ingredients:', error));
});
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
function setupIngredients() {
    const orts = document.querySelector('.orts-list');
    orts.innerHTML = '';

    ingredientsData.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.className = 'ingredient';
        listItem.textContent = ingredient;
        orts.appendChild(listItem);
    });

}

function searchIngredients() {
    const searchInput = document.getElementById('orts-search');
    const ingredientsItems = document.querySelectorAll('.orts-list li');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();

        ingredientsItems.forEach(item => {
            const ingredient = item.textContent.toLowerCase();
            if (ingredient.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function selectIngredient() {
    const ingredientsItems = document.querySelectorAll('.orts-list li');

    ingredientsItems.forEach(ingredientsItem => {
        ingredientsItem.addEventListener('click', () => {
            const ingredient = ingredientsItem.textContent;

            if (activeIngredients.includes(ingredient)) {
                activeIngredients = activeIngredients.filter(item => item !== ingredient);
                ingredientsItem.classList.remove('active');
            } else {
                activeIngredients.push(ingredient);
                ingredientsItem.classList.add('active');
            }

            filterFood();
        });
    });
}

function filterFood() {
    const container = document.querySelector('.container');

    container.innerHTML = '';

    if (activeIngredients.length === 0) {
        recipesData.forEach(recipe => renderRecipe(recipe, container));
        return;
    }

    const filteredRecipes = recipesData.filter(recipe =>
        activeIngredients.every(activeIngredient =>
            recipe.ingredients.some(recipeIngredient =>
                recipeIngredient.toLowerCase().includes(activeIngredient.toLowerCase())
            )
        )
    );

    if (filteredRecipes.length > 0) {
        filteredRecipes.forEach(recipe => renderRecipe(recipe, container));
    } else {
        const noResultMessage = document.createElement('p');
        noResultMessage.textContent = 'No recipes match the selected ingredients.';
        container.appendChild(noResultMessage);
    }
}

function renderRecipe(recipe, container) {
    const foodCard = document.createElement('section');
    foodCard.className = 'food-card';
    foodCard.innerHTML = `
        <img src='${recipe.image}' alt='${recipe.name}'>
        <a href='/htmls/hool_detail.html?id=${recipe.id}'>
        <h3>${recipe.name}</h3>
        </a>
    `;
    container.appendChild(foodCard);
}
