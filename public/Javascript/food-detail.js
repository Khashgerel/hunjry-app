let recipesData = [];
/* HTML хуудсыг ачаалсан үед, /api/recipes API-ээс хоолны жоруудыг татаж авна.
Жорын ID-ийг URL-аас авч, тухайн жорыг дэлгэц дээр харуулах, мөн сэтгэгдэл, лайк, санал болгох хоол, 
орц, заавар зэрэг мэдээллийг ачаалж гаргана. */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data && data.recipes) {
            recipesData = data.recipes;

            const urlParams = new URLSearchParams(window.location.search);
            const filter = parseInt(urlParams.get('id'));
            
            if (!filter || isNaN(filter)) {
                console.error('Invalid or missing recipe ID');
                return;
            }

            updateImage(filter);
            updateIngredient(filter);
            setupSuggestedFood(filter);
            setTimeout(() => setupLikeButton(filter), 0);
            setupDropdown();
            setupCommentForm(filter);
            displayComments(filter);
        } else {
            console.error('Data format error: No "recipes" array in JSON');
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="error-message">
                    <p>Жорын мэдээлэл ачаалахад алдаа гарлаа. Та хуудсаа дахин ачаална уу.</p>
                </div>
            `;
        }
    }
});
/* Сонгосон жортой ижил төрлийн бусад хоолны жоруудыг санал болгох хэсгийг үүсгэдэг. 
Хэрэглэгчийн сонгосон жорын төрлөөс тохирох 2 хоолыг саналаар харуулна. */

function setupSuggestedFood(id) {
    const sugFoods = document.querySelector('.suggested-foods');
    sugFoods.innerHTML = ''; 
    
    const currentRecipe = recipesData.find(recipe => recipe.id === id);
    if (!currentRecipe) return;

    const filteredData = recipesData.filter(recipe => 
        recipe.id !== id && 
        recipe.mealType.some(type => 
            currentRecipe.mealType.includes(type)
        )
    );

    const suggestions = filteredData
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 2);

    if (suggestions.length === 0) {
        sugFoods.innerHTML = `<p>Санал болгох хоол олдсонгүй.</p>`;
        return;
    }

    suggestions.forEach(recipe => {
        const sugFood = document.createElement('section');
        sugFood.className = 'suggested-food';
        sugFood.innerHTML = `
            <a href="/htmls/hool_detail.html?id=${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
            </a>
        `;
        sugFoods.appendChild(sugFood);
    });
}
/* Тухайн жорын зураг, нэр, рейтинг, лайк болон коммент хийх товчийг харуулдаг. 
Жорын мэдээлэл олдсон бол дэлгэц дээр харуулна, олдсонгүй бол "Recipe not found." гэж харуулна. */

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
          <button class="heart-button">
            <img src="/iconpic/heart.png" alt="like">
          </button>
          <button class="comment-button">
            <img src="/iconpic/comment.png" alt="comment">
          </button>
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
/* Хайлтын хэсэг дээр хэрэглэгчийн бичсэн үгнээс үндэслэн тохирох хоолны жоруудыг dropdown 
буюу жагсаалтаар харуулна. Хайлтын үр дүн байхгүй бол жагсаалт нууж, байвал харуулна. */

function setupDropdown() {
  const searchBar = document.querySelector('.search-bar');
  const dropdownContainer = document.querySelector('.dropdown-container');
  const searchbar = document.querySelector('#search-bar');
  
  if (!dropdownContainer || !searchbar) return;
  
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
/* Жорын орцууд болон зааврыг дэлгэц дээр харуулах. Жорын дэлгэрэнгүй мэдээлэл гарахад, тухайн 
жорын ID-г URL-д нэмнэ. */

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
/* Хэрэглэгч нэвтэрсэн бол тухайн жорын лайк товчийг тохируулж, лайк тавих үйлдлийг гүйцэтгэнэ. 
Хэрэглэгч нэвтрээгүй бол нэвтрэх шаардлагатайг хэлж, нэвтрэх хуудсанд шилжүүлнэ. 
Лайк товчийг дарахад, like-food API руу хүсэлт илгээж, лайк буюу идэвхжүүлэх/идэвхгүй болгох 
үйлдлийг гүйцэтгэнэ. */

async function setupLikeButton(recipeId) {
    const likeButton = document.querySelector('.heart-button');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        likeButton.addEventListener('click', () => {
            alert('Та эхлээд нэвтрэх шаардлагатай!');
            window.location.href = '/htmls/login.html';
        });
        return;
    }

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
/* Сэтгэгдэл бичих хэсэг үүсгэдэг. Хэрэглэгч нэвтрээгүй бол нэвтрэхийг шаарддаг. Сэтгэгдэл бичиж, 
"comments" API руу илгээх бөгөөд амжилттай бол жорын сэтгэгдэлд шинэ сэтгэгдлийг нэмнэ. 
Мөн шинэ сэтгэгдлийг дэлгэц дээр үзүүлнэ. */

async function setupCommentForm(recipeId) {
    const commentForm = document.querySelector('.comment-input');
    if (!commentForm) return;

    const commentInput = commentForm.querySelector('input');
    if (!commentInput) return;

    const commentsSection = document.querySelector('.comments');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Та эхлээд нэвтрэх шаардлагатай!');
            window.location.href = '/htmls/login.html';
        });
        return;
    }

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const commentText = commentInput.value.trim();
        if (!commentText) {
            alert('Сэтгэгдэл хоосон байж болохгүй!');
            return;
        }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipeId: recipeId,
                    userId: user.userId,
                    body: commentText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                const recipe = recipesData.find(r => r.id === recipeId);
                if (recipe) {
                    if (!recipe.comments) {
                        recipe.comments = [];
                    }
                    recipe.comments.push(data.comment);
                }

                const newComment = document.createElement('section');
                newComment.className = 'comment';
                newComment.innerHTML = `
                    <img src="/iconpic/profile.png" alt="user">
                    <p>${commentText}</p>
                `;
                
                const firstComment = commentsSection.querySelector('.comment');
                if (firstComment) {
                    commentsSection.insertBefore(newComment, firstComment);
                } else {
                    commentsSection.appendChild(newComment);
                }
                
                commentInput.value = '';
            } else {
                alert('Алдаа гарлаа: ' + (data.message || 'Тодорхойгүй алдаа'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Сэтгэгдэл нэмэх үед алдаа гарлаа');
        }
    });
}
/* Тухайн жорын бүх сэтгэгдлийг дэлгэц дээр харуулдаг. Хоёр дахь удаагийн ачаалалт хийхэд хуучин 
сэтгэгдлүүдийг устгаж, шинэ сэтгэгдлүүдийг нэмнэ. */

function displayComments(recipeId) {
    const commentsSection = document.querySelector('.comments');
    const commentForm = document.querySelector('.comment-input');
    
    // Clear existing comments except the form
    const existingComments = commentsSection.querySelectorAll('.comment');
    existingComments.forEach(comment => comment.remove());
    
    const recipe = recipesData.find(r => r.id === recipeId);
    if (recipe && recipe.comments) {
        recipe.comments.forEach(comment => {
            const commentElement = document.createElement('section');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <img src="/iconpic/profile.png" alt="user">
                <p>${comment.body}</p>
            `;
            commentsSection.appendChild(commentElement);
        });
    }
}