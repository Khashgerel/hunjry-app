document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/htmls/login.html';
        return;
    }

    // Update user info
    updateUserInfo(user);
    
    // Load and display liked recipes
    loadLikedRecipes(user.userId);
});

function updateUserInfo(user) {
    // Update the user info section
    const userInfoSection = document.querySelector('.user_info');
    if (userInfoSection) {
        userInfoSection.innerHTML = `
            <p>Хэрэглэгчийн нэр: ${user.username}</p>
            <p>Утас: ${user.phoneNumber || 'Бүртгэлгүй'}</p>
            <p>Гэрийн хаяг: ${user.address || 'Бүртгэлгүй'}</p>
            <p>И-мэйл: ${user.email || 'Бүртгэлгүй'}</p>
            <button class="logout">Системээс гарах</button>
        `;

        // Add logout functionality
        const logoutButton = userInfoSection.querySelector('.logout');
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = '/htmls/login.html';
        });
    }
}

async function loadLikedRecipes(userId) {
    try {
        const response = await fetch(`/api/user/${userId}/liked-recipes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const likedRecipes = await response.json();
        
        const userFavsContainer = document.querySelector('.user_favs');
        if (!userFavsContainer) return;

        // Keep the title
        userFavsContainer.innerHTML = '<h2>Надад таалагдсан хоол</h2>';

        if (!Array.isArray(likedRecipes) || likedRecipes.length === 0) {
            userFavsContainer.innerHTML += '<p>Таньд одоогоор таалагдсан хоол байхгүй байна.</p>';
            return;
        }

        likedRecipes.forEach(recipe => {
            if (recipe) {
                const articleElement = document.createElement('article');
                articleElement.innerHTML = `
                    <a href="/htmls/hool_detail.html?id=${recipe.id}">
                        <img src="${recipe.image}" alt="${recipe.name}">
                        <p>${recipe.name}</p>
                    </a>
                `;
                userFavsContainer.appendChild(articleElement);
            }
        });
    } catch (error) {
        console.error('Error loading liked recipes:', error);
        const userFavsContainer = document.querySelector('.user_favs');
        if (userFavsContainer) {
            userFavsContainer.innerHTML = `
                <h2>Надад таалагдсан хоол</h2>
                <p>Таалагдсан хоолнуудыг ачаалахад алдаа гарлаа.</p>
            `;
        }
    }
} 