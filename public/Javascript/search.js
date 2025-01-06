let recipesData = [];

async function initializeSearch() {  //huudas achaalahad serverees recipe uudiig awna
    try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        if (data && data.recipes) {
            recipesData = data.recipes;
            setupDropdown();
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

function setupDropdown() { //search bar deer oruulj bga utgaar ni huudas achaalahad hooliig haruulah
    const searchBar = document.querySelector('.search-bar');
    const dropdownContainer = document.querySelector('.dropdown-container');
    const searchbar = document.querySelector('#search-bar');
    
    if (!dropdownContainer || !searchbar) return; //tohiroh jor oldohgui bol unadag tses nuuh 
    
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
    });
}

document.addEventListener('DOMContentLoaded', initializeSearch); 