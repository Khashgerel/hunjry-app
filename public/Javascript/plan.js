document.addEventListener('DOMContentLoaded', () => { //serverees joriin ugugdliig tatah
    fetch('/api/recipes')
        .then(response => response.json())
        .then(data => {
            if (data && data.recipes) {
                recipesData = data.recipes;
                setupDropdown();
            } else {
                console.error('Data format error: No "recipes" array in JSON');
            }
        })
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

function setupDropdown() { //hereglegchii oruulj bgaa ugugdluudiig haruulah, haih
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
                    foodItem.draggable = true; 
                    foodItem.dataset.id = recipe.id; 
                    foodItem.innerHTML = `
                      <img src="${recipe.image}" alt="${recipe.name}">
                      <a href='/htmls/hool_detail.html?id=${recipe.id}'>${recipe.name}</a>
                    `;
                    foodItem.addEventListener('dragstart', (event) => {
                        event.dataTransfer.setData('text/plain', JSON.stringify(recipe));
                    });

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
document.querySelectorAll('.meal-planner td[data-label]').forEach(cell => {
    cell.addEventListener('dragover', (event) => { //jorig husnegtiin nudend chirch oruulah
        event.preventDefault(); 
    });
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear'; //nudendeh jorig ustgah tovch
    cell.addEventListener('drop', (event) => {
        event.preventDefault();
        const recipeData = event.dataTransfer.getData('text/plain');
        const recipe = JSON.parse(recipeData);
    
        // Create clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.className = 'clear-btn';
    
        // Store original content in case we need to revert
        const originalContent = cell.innerHTML;
    
        // Update cell content
        cell.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}" style="width:150px; height:150px;">
            <p>${recipe.name}</p>
        `;
        cell.appendChild(clearBtn);
        const btnclear = document.querySelector('.clear-btn');
        btnclear.addEventListener('click', () => {
            cell.innerHTML = originalContent;
        });
    });
});
