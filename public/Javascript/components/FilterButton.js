export default class FilterButton extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['filter', 'active'];
    }

    connectedCallback() {
        const filter = this.getAttribute('filter');
        const isActive = this.hasAttribute('active');
        
        this.innerHTML = `
            <button class="filter-btn ${isActive ? 'active' : ''}" data-filter="${filter}">
                ${filter}
            </button>
        `;

        this.querySelector('button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('filter-click', {
                detail: { filter },
                bubbles: true
            }));
        });
    }
}

customElements.define('filter-btn', FilterButton); 