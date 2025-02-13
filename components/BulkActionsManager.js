class BulkActionsManager {
    constructor() {
        this.selectedTodos = new Set();
        this.createBulkActionsPanel();
        this.addSelectionCheckboxes();
    }

    createBulkActionsPanel() {
        const header = document.querySelector('.header');
        
        this.actionsPanel = document.createElement('div');
        this.actionsPanel.className = 'bulk-actions-panel';
        this.actionsPanel.innerHTML = `
            <div class="bulk-actions-content" style="display: none;">
                <span class="selected-count">0 selected</span>
                <div class="bulk-actions">
                    <button class="bulk-complete">Complete All</button>
                    <button class="bulk-delete">Delete All</button>
                    <select class="bulk-priority">
                        <option value="">Set Priority</option>
                        ${Object.entries(TodoService.priorities).map(([key, value]) => `
                            <option value="${key}">${value.label}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
        
        header.appendChild(this.actionsPanel);
        this.attachEventListeners();
    }

    addSelectionCheckboxes() {
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'bulk-select';
            
            // Insert checkbox at the start of the todo item
            item.querySelector('.todo-main').insertBefore(
                checkbox,
                item.querySelector('.todo-main').firstChild
            );

            checkbox.addEventListener('change', (e) => {
                const todoId = parseInt(item.dataset.id);
                const panelId = item.closest('.panel').id.replace('-panel', '');
                
                if (e.target.checked) {
                    this.selectedTodos.add(`${panelId}-${todoId}`);
                } else {
                    this.selectedTodos.delete(`${panelId}-${todoId}`);
                }
                
                this.updateActionsPanel();
            });
        });
    }

    attachEventListeners() {
        const bulkComplete = this.actionsPanel.querySelector('.bulk-complete');
        const bulkDelete = this.actionsPanel.querySelector('.bulk-delete');
        const bulkPriority = this.actionsPanel.querySelector('.bulk-priority');

        bulkComplete.addEventListener('click', () => {
            this.selectedTodos.forEach(todoKey => {
                const [panel, id] = todoKey.split('-');
                TodoService.toggleTodo(panel, parseInt(id), true);
            });
            this.refreshTodos();
        });

        bulkDelete.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all selected tasks?')) {
                this.selectedTodos.forEach(todoKey => {
                    const [panel, id] = todoKey.split('-');
                    TodoService.deleteTodo(panel, parseInt(id));
                });
                this.refreshTodos();
            }
        });

        bulkPriority.addEventListener('change', (e) => {
            const priority = e.target.value;
            if (priority) {
                this.selectedTodos.forEach(todoKey => {
                    const [panel, id] = todoKey.split('-');
                    TodoService.editTodo(panel, parseInt(id), { priority });
                });
                this.refreshTodos();
                e.target.value = ''; // Reset select
            }
        });
    }

    updateActionsPanel() {
        const content = this.actionsPanel.querySelector('.bulk-actions-content');
        const count = this.actionsPanel.querySelector('.selected-count');
        
        if (this.selectedTodos.size > 0) {
            content.style.display = 'flex';
            count.textContent = `${this.selectedTodos.size} selected`;
        } else {
            content.style.display = 'none';
        }
    }

    refreshTodos() {
        this.selectedTodos.clear();
        this.updateActionsPanel();
        // Trigger re-render of all panels
        document.querySelectorAll('.panel').forEach(panel => {
            const panelId = panel.id.replace('-panel', '');
            const panelInstance = app.panels.find(p => p.id === panelId);
            if (panelInstance) {
                panelInstance.renderTodos();
            }
        });
    }
}