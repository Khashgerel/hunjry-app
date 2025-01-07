export default class SearchInput extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <section class="search-bar">
                <input type="text" name="search" id="search-bar" placeholder="Хоолны нэр">
            </section>
        `;

        this.setupSearch();
    }

    setupSearch() {
        const searchbar = this.querySelector('#search-bar');
        const dropdownContainer = this.querySelector('.dropdown-container');

        searchbar.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            this.dispatchEvent(new CustomEvent('search', { 
                detail: { query },
                bubbles: true 
            }));
        });
    }
}

customElements.define('search-input', SearchInput); 