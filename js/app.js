// Initialize the application
class App {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
    }

    initializeComponents() {
        // Initialize core components
        this.panels = [
            new Panel('upcoming', 'Upcoming'),
            new Panel('assigned', 'Assigned'),
            new Panel('need-to-do', 'Need to Do')
        ];
        
        // Load saved todos
        TodoService.loadTodos();
        
        // Initialize feature components
        this.search = new SearchManager();
        this.filter = new FilterManager();
        this.stats = new StatisticsManager();
        window.bulkActionsManager = new BulkActionsManager();
        
        // Render initial todos
        this.panels.forEach(panel => panel.renderTodos());

        // Initialize drag and drop
        this.initializeDragAndDrop();
        
        // Add keyboard shortcuts
        this.initializeKeyboardShortcuts();
    }

    setupEventListeners() {
        // Listen for changes that should update statistics
        ['dragend', 'change'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.stats) {
                    this.stats.updateStatistics();
                }
            });
        });
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.search.searchInput.focus();
            }
            
            // Ctrl/Cmd + N to add new task to first panel
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.panels[0].showAddTodoModal();
            }
        });
    }

    initializeDragAndDrop() {
        const lists = document.querySelectorAll('.todo-list');
        
        lists.forEach(list => {
            list.addEventListener('dragover', this.handleDragOver);
            list.addEventListener('drop', this.handleDrop.bind(this));
            
            // Add visual feedback for drag target
            list.addEventListener('dragenter', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });
            
            list.addEventListener('dragleave', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
            });
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        const list = e.target.closest('.todo-list');
        list.classList.remove('drag-over');
        
        const todoId = e.dataTransfer.getData('text/plain');
        const [sourcePanel, id] = todoId.split('-');
        const targetPanel = e.target.closest('.panel').id.replace('-panel', '');
        
        if (sourcePanel !== targetPanel) {
            const todo = TodoService.getTodos(sourcePanel).find(t => t.id === parseInt(id));
            if (todo) {
                // Remove from source panel
                TodoService.deleteTodo(sourcePanel, parseInt(id));
                
                // Add to target panel
                TodoService.addTodo(targetPanel, {
                    text: todo.text,
                    description: todo.description,
                    dueDate: todo.dueDate,
                    priority: todo.priority,
                    category: todo.category
                });
                
                // Re-render both panels
                this.panels.find(p => p.id === sourcePanel).renderTodos();
                this.panels.find(p => p.id === targetPanel).renderTodos();
                
                // Update statistics if available
                if (this.stats) {
                    this.stats.updateStatistics();
                }
            }
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});