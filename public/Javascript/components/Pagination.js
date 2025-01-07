export default class Pagination extends HTMLElement {
    constructor() {
        super();
    }

    set pages({ current, total }) {
        this.innerHTML = '';
        
        if (total === 0) {
            this.innerHTML = '<p>No pages to display.</p>';
            return;
        }
        
        for (let i = 1; i <= total; i++) {
            const button = document.createElement('button');
            button.className = `pagination-circle ${i === current ? 'active' : ''}`;
            button.innerText = i;
            
            button.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('page-change', {
                    detail: { page: i },
                    bubbles: true
                }));
            });
            
            this.appendChild(button);
        }
    }
}

customElements.define('page-pagination', Pagination); 