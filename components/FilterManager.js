class FilterManager {
    constructor() {
        this.filterSelect = document.createElement('select');
        this.setupFilter();
    }

    setupFilter() {
        this.filterSelect.className = 'filter-select';
        
        const options = [
            { value: 'all', text: 'All Tasks' },
            { value: 'completed', text: 'Completed' },
            { value: 'active', text: 'Active' },
            { value: 'overdue', text: 'Overdue' }
        ];
        
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            this.filterSelect.appendChild(opt);
        });
        
        const header = document.querySelector('.header');
        header.appendChild(this.filterSelect);
        
        this.filterSelect.addEventListener('change', this.handleFilter.bind(this));
    }

    handleFilter(e) {
        const filterValue = e.target.value;
        
        Object.keys(TodoService.todos).forEach(panelId => {
            const todos = document.querySelectorAll(`#${panelId}-list .todo-item`);
            
            todos.forEach(todo => {
                const isCompleted = todo.classList.contains('completed');
                const dueDate = todo.querySelector('.todo-due-date')?.textContent;
                const isOverdue = dueDate && todo.querySelector('.todo-due-date').classList.contains('overdue');
                
                switch (filterValue) {
                    case 'completed':
                        todo.style.display = isCompleted ? '' : 'none';
                        break;
                    case 'active':
                        todo.style.display = !isCompleted ? '' : 'none';
                        break;
                    case 'overdue':
                        todo.style.display = isOverdue ? '' : 'none';
                        break;
                    default:
                        todo.style.display = '';
                }
            });
        });
    }
}