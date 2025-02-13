class SearchManager {
    constructor() {
        this.searchInput = document.createElement('input');
        this.setupSearch();
    }

    setupSearch() {
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search tasks...';
        this.searchInput.className = 'search-input';
        
        const header = document.querySelector('.header');
        header.appendChild(this.searchInput);
        
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        Object.keys(TodoService.todos).forEach(panelId => {
            const todos = document.querySelectorAll(`#${panelId}-list .todo-item`);
            
            todos.forEach(todo => {
                const text = todo.querySelector('.todo-text').textContent.toLowerCase();
                const description = todo.querySelector('.todo-description')?.textContent.toLowerCase() || '';
                if (text.includes(searchTerm) || description.includes(searchTerm)) {
                    todo.style.display = '';
                } else {
                    todo.style.display = 'none';
                }
            });
        });
    }
}