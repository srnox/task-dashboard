class TodoService {
    static todos = {
        upcoming: [],
        assigned: [],
        'need-to-do': []
    };

    static categories = [
        'Work', 'Personal', 'Shopping', 'Health', 'Important'
    ];

    static priorities = {
        LOW: { value: 1, label: 'Low', color: '#10B981' },
        MEDIUM: { value: 2, label: 'Medium', color: '#F59E0B' },
        HIGH: { value: 3, label: 'High', color: '#EF4444' }
    };

    static loadTodos() {
        Object.keys(this.todos).forEach(panel => {
            const savedTodos = localStorage.getItem(`todos-${panel}`);
            if (savedTodos) {
                this.todos[panel] = JSON.parse(savedTodos);
            }
        });
    }

    static saveTodos(panel) {
        localStorage.setItem(`todos-${panel}`, JSON.stringify(this.todos[panel]));
    }

    static getTodos(panel) {
        return this.todos[panel];
    }

    static addTodo(panel, { text, dueDate, priority, category, description }) {
        const todo = {
            id: Date.now(),
            text,
            completed: false,
            date: new Date().toLocaleDateString(),
            dueDate: dueDate || null,
            priority: priority || 'LOW',
            category: category || null,
            description: description || '',
            notes: []
        };
        
        this.todos[panel].push(todo);
        this.saveTodos(panel);
        return todo;
    }

    static addNote(panel, todoId, noteText) {
        const todo = this.todos[panel].find(t => t.id === todoId);
        if (todo) {
            const note = {
                id: Date.now(),
                text: noteText,
                date: new Date().toLocaleDateString()
            };
            todo.notes = todo.notes || [];
            todo.notes.push(note);
            this.saveTodos(panel);
            return note;
        }
        return null;
    }

    static getStatistics() {
        const stats = {
            total: 0,
            completed: 0,
            overdue: 0,
            byPriority: {},
            byCategory: {},
            byPanel: {}
        };

        Object.entries(this.todos).forEach(([panel, todos]) => {
            stats.byPanel[panel] = todos.length;
            stats.total += todos.length;
            
            todos.forEach(todo => {
                if (todo.completed) stats.completed++;
                if (todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed) {
                    stats.overdue++;
                }
                
                // Priority stats
                stats.byPriority[todo.priority] = (stats.byPriority[todo.priority] || 0) + 1;
                
                // Category stats
                if (todo.category) {
                    stats.byCategory[todo.category] = (stats.byCategory[todo.category] || 0) + 1;
                }
            });
        });

        return stats;
    }

    static bulkAction(panel, todoIds, action) {
        switch (action) {
            case 'complete':
                todoIds.forEach(id => this.toggleTodo(panel, id, true));
                break;
            case 'delete':
                this.todos[panel] = this.todos[panel].filter(todo => !todoIds.includes(todo.id));
                break;
            case 'setPriority':
                todoIds.forEach(id => {
                    const todo = this.todos[panel].find(t => t.id === id);
                    if (todo) todo.priority = priority;
                });
                break;
        }
        this.saveTodos(panel);
    }

    static deleteTodo(panel, id) {
        this.todos[panel] = this.todos[panel].filter(todo => todo.id !== id);
        this.saveTodos(panel);
    }

    static toggleTodo(panel, id, value = null) {
        const todo = this.todos[panel].find(t => t.id === id);
        if (todo) {
            todo.completed = value !== null ? value : !todo.completed;
            this.saveTodos(panel);
        }
    }

    static editTodo(panel, id, updates) {
        const todo = this.todos[panel].find(t => t.id === id);
        if (todo) {
            Object.assign(todo, updates);
            this.saveTodos(panel);
        }
    }
}