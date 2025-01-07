export default class RecipeCard extends HTMLElement {
    constructor() {
        super();
    }

    set recipe(data) {
        this.innerHTML = `
            <section class="recipe-card">
                <img src="${data.image}" alt="${data.name}" class="food-pic">
                <section class="food-info">
                    <h3>${data.name}</h3>
                    <p>${data.caloriesPerServing || 'N/A'} кал</p>
                    <section class="ports">
                        ${data.servings ? '<img src="/iconpic/profile.png">'.repeat(data.servings) : 'N/A'}
                    </section>
                    <a href="/htmls/hool_detail.html?id=${data.id}">
                        <button class="view-recipe-btn">Жор харах</button>
                    </a>
                </section>
            </section>
        `;
    }
}

customElements.define('recipe-card', RecipeCard);