class Panel {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.element = document.getElementById(`${id}-panel`);
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <div class="panel-header">
                <h2>${this.title}</h2>
                <div class="panel-controls">
                    <div class="panel-sort">
                        <select class="sort-select">
                            <option value="date">Sort by Date</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="dueDate">Sort by Due Date</option>
                        </select>
                    </div>
                    <span class="panel-badge" id="${this.id}-count">0</span>
                </div>
            </div>
            <div class="panel-content">
                <div class="add-todo">
                    <input type="text" placeholder="Add ${this.title.toLowerCase()} task..." id="${this.id}-input">
                    <button id="${this.id}-add-btn">Add</button>
                </div>
                <ul class="todo-list" id="${this.id}-list"></ul>
            </div>
        `;
    }

    attachEventListeners() {
        const input = document.getElementById(`${this.id}-input`);
        const addButton = document.getElementById(`${this.id}-add-btn`);
        const sortSelect = this.element.querySelector('.sort-select');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.showAddTodoModal();
            }
        });

        addButton.addEventListener('click', () => {
            this.showAddTodoModal();
        });

        sortSelect.addEventListener('change', (e) => {
            this.sortTodos(e.target.value);
        });
    }

    showAddTodoModal() {
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Task</h3>
                <input type="text" class="edit-text" placeholder="Task title" value="${document.getElementById(`${this.id}-input`).value}">
                <textarea class="edit-description" placeholder="Description"></textarea>
                <div class="edit-meta">
                    <input type="date" class="edit-due-date" placeholder="Due date">
                    <select class="edit-priority">
                        ${Object.entries(TodoService.priorities).map(([key, value]) => `
                            <option value="${key}">${value.label}</option>
                        `).join('')}
                    </select>
                    <select class="edit-category">
                        <option value="">No Category</option>
                        ${TodoService.categories.map(category => `
                            <option value="${category}">${category}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn">Add Task</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const saveBtn = modal.querySelector('.save-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        saveBtn.addEventListener('click', () => {
            const todoData = {
                text: modal.querySelector('.edit-text').value.trim(),
                description: modal.querySelector('.edit-description').value.trim(),
                dueDate: modal.querySelector('.edit-due-date').value,
                priority: modal.querySelector('.edit-priority').value,
                category: modal.querySelector('.edit-category').value
            };

            if (todoData.text) {
                TodoService.addTodo(this.id, todoData);
                document.getElementById(`${this.id}-input`).value = '';
                this.renderTodos();
                modal.remove();
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
    }

    sortTodos(criteria) {
        const todos = TodoService.getTodos(this.id);
        
        switch (criteria) {
            case 'priority':
                todos.sort((a, b) => {
                    const priorityValues = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return priorityValues[b.priority] - priorityValues[a.priority];
                });
                break;
            case 'dueDate':
                todos.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'date':
                todos.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
        
        this.renderTodos();
    }

    renderTodos() {
        const todos = TodoService.getTodos(this.id);
        const list = document.getElementById(`${this.id}-list`);
        const count = document.getElementById(`${this.id}-count`);
        
        list.innerHTML = '';
        count.textContent = todos.length;
        
        todos.forEach(todo => {
            const todoItem = new TodoItem(todo, this.id);
            list.appendChild(todoItem.element);
        });

        // Re-initialize bulk actions
        if (window.bulkActionsManager) {
            window.bulkActionsManager.addSelectionCheckboxes();
        }
    }
}