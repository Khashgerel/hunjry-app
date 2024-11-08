document.addEventListener('DOMContentLoaded', () => {
  fetch('https://dummyjson.com/recipes')
    .then(response => response.json())
    .then(data => {
      if (data && data.recipes) {
        recipesData = data.recipes;

        const urlParams = new URLSearchParams(window.location.search);
        const filter = parseInt(urlParams.get('id'));

        updateImage(filter);
        updateIngredient(filter);
      } else {
        console.error('Data format error: No "recipes" array in JSON');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
});

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
          <img src="/iconpic/heart.png" alt="like">
          <img src="/iconpic/comment.png" alt="comment">
        </section>
        <nav class="rating-container">
          <img src="/iconpic/pizza.png" alt="unelgee">
          <img src="/iconpic/pizza.png" alt="unelgee">
          <img src="/iconpic/pizza.png" alt="unelgee">
          <img src="/iconpic/pizza.png" alt="unelgee">
          <img src="/iconpic/pizza.png" alt="unelgee">
        </nav>
      </article>
      <article class="comments">
        <h3>Сэтгэгдэл</h3>
        <form class="comment-input">
          <input type="text" placeholder="Сэтгэгдэл үлдээх">
          <button type="submit">Нийтлэх</button>
        </form>
        <section class="comment">
          <img src="/iconpic/profile.png" alt="user">
          <p>Сайхан хоол байна. Лайк</p>
        </section>
        <section class="comment">
          <img src="/iconpic/profile.png" alt="user">
          <p>Маш амттай!</p>
        </section>
        <section class="comment">
          <img src="/iconpic/profile.png" alt="user">
          <p>Дараа дахин хийх хэрэгтэй.</p>
        </section>
      </article>
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

