let recipesData = [];
document.addEventListener('DOMContentLoaded', async () => {
  fetch('/api/recipes')
    .then(response => response.json())
    .then(data => {
      if (data && data.recipes) {
        recipesData = data.recipes;

        const urlParams = new URLSearchParams(window.location.search);
        const filter = parseInt(urlParams.get('id'));
        const recipe = recipesData.filter(recipe => recipe.id === filter)

        updateImage(filter);
        updateIngredient(filter);
        setupSuggestedFood(filter);
        setTimeout(() => setupLikeButton(filter), 0);
      } else {
        console.error('Data format error: No "recipes" array in JSON');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

function setupSuggestedFood(id) {
  const sugFoods = document.querySelector('.suggested-foods');
  sugFoods.innerHTML = ''; 
  const recipe = recipesData.find(recipe => recipe.id === id);
  const filteredData = recipesData.filter(recip =>
    recip.mealType.some(type => type === recipe.mealType)
  )

  const suggestions = filteredData.slice(0, 2);

  if (filteredData.length === 0) {
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
          <img src="/iconpic/heart.png" alt="like" class="heart-button">
          <img src="/iconpic/comment.png" alt="comment">
        </section>
        <nav class="rating-container">
          ${recipe.rating ? '<img src="/iconpic/pizza.png" alt="unelgee">'.repeat(recipe.rating) : 'N/A'}
        </nav>
      </article>
      <section id="suggested-foods" class="suggested-foods">
        <section class="suggested-food"></section>
        <section class="suggested-food"></section>
      </section>
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

async function setupLikeButton(recipeId) {
    const likeButton = document.querySelector('.heart-button');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        likeButton.addEventListener('click', () => {
            alert('Та эхлээд нэвтрэ�� шаардлагатай!');
            window.location.href = '/htmls/login.html';
        });
        return;
    }

    // Check if recipe is already liked
    const response = await fetch('/api/users');
    const userData = await response.json();
    const currentUser = userData.users.find(u => u.userId === user.userId);
    
    if (currentUser.likedFoods && currentUser.likedFoods.includes(recipeId)) {
        likeButton.classList.add('active');
    }

    likeButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/like-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.userId,
                    recipeId: recipeId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                likeButton.classList.toggle('active');
            } else {
                alert('Алдаа гарлаа: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Алдаа гарлаа');
        }
    });
}
