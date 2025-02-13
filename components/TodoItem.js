class TodoItem {
    constructor(todo, panelId) {
        this.todo = todo;
        this.panelId = panelId;
        this.element = this.render();
        this.attachEventListeners();
    }

    render() {
        const li = document.createElement('li');
        li.className = `todo-item ${this.todo.completed ? 'completed' : ''} priority-${this.todo.priority.toLowerCase()}`;
        li.draggable = true;
        
        const isOverdue = this.todo.dueDate && new Date(this.todo.dueDate) < new Date() && !this.todo.completed;
        
        li.innerHTML = `
            <div class="todo-main">
                <input type="checkbox" ${this.todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <span class="todo-text">${this.todo.text}</span>
                    ${this.todo.description ? `<p class="todo-description">${this.todo.description}</p>` : ''}
                    <div class="todo-meta">
                        <span class="todo-date">Created: ${this.todo.date}</span>
                        ${this.todo.dueDate ? `
                            <span class="todo-due-date ${isOverdue ? 'overdue' : ''}">
                                Due: ${new Date(this.todo.dueDate).toLocaleDateString()}
                            </span>
                        ` : ''}
                        ${this.todo.category ? `
                            <span class="todo-category">${this.todo.category}</span>
                        ` : ''}
                        <span class="todo-priority" style="background: ${TodoService.priorities[this.todo.priority].color}">
                            ${TodoService.priorities[this.todo.priority].label}
                        </span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="notes-btn">Notes (${this.todo.notes?.length || 0})</button>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
            <div class="todo-notes" style="display: none;">
                <div class="notes-list">
                    ${this.renderNotes()}
                </div>
                <div class="add-note">
                    <input type="text" placeholder="Add a note..." class="note-input">
                    <button class="add-note-btn">Add</button>
                </div>
            </div>
        `;

        return li;
    }

    renderNotes() {
        if (!this.todo.notes?.length) return '<p class="no-notes">No notes yet</p>';
        
        return this.todo.notes.map(note => `
            <div class="note-item">
                <p>${note.text}</p>
                <span class="note-date">${note.date}</span>
            </div>
        `).join('');
    }

    attachEventListeners() {
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        const editBtn = this.element.querySelector('.edit-btn');
        const deleteBtn = this.element.querySelector('.delete-btn');
        const notesBtn = this.element.querySelector('.notes-btn');
        const notesSection = this.element.querySelector('.todo-notes');
        const addNoteBtn = this.element.querySelector('.add-note-btn');
        const noteInput = this.element.querySelector('.note-input');

        this.element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', `${this.panelId}-${this.todo.id}`);
            this.element.classList.add('dragging');
        });

        this.element.addEventListener('dragend', () => {
            this.element.classList.remove('dragging');
        });

        checkbox.addEventListener('change', () => {
            TodoService.toggleTodo(this.panelId, this.todo.id);
            this.element.classList.toggle('completed');
        });

        editBtn.addEventListener('click', () => {
            this.showEditModal();
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                TodoService.deleteTodo(this.panelId, this.todo.id);
                this.element.remove();
            }
        });

        notesBtn.addEventListener('click', () => {
            notesSection.style.display = notesSection.style.display === 'none' ? 'block' : 'none';
        });

        addNoteBtn.addEventListener('click', () => {
            const noteText = noteInput.value.trim();
            if (noteText) {
                const note = TodoService.addNote(this.panelId, this.todo.id, noteText);
                if (note) {
                    noteInput.value = '';
                    notesSection.querySelector('.notes-list').innerHTML = this.renderNotes();
                    notesBtn.textContent = `Notes (${this.todo.notes.length})`;
                }
            }
        });
    }

    showEditModal() {
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Task</h3>
                <input type="text" value="${this.todo.text}" class="edit-text">
                <textarea class="edit-description" placeholder="Description">${this.todo.description || ''}</textarea>
                <div class="edit-meta">
                    <input type="date" class="edit-due-date" value="${this.todo.dueDate || ''}">
                    <select class="edit-priority">
                        ${Object.entries(TodoService.priorities).map(([key, value]) => `
                            <option value="${key}" ${this.todo.priority === key ? 'selected' : ''}>
                                ${value.label}
                            </option>
                        `).join('')}
                    </select>
                    <select class="edit-category">
                        <option value="">No Category</option>
                        ${TodoService.categories.map(category => `
                            <option value="${category}" ${this.todo.category === category ? 'selected' : ''}>
                                ${category}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const saveBtn = modal.querySelector('.save-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        saveBtn.addEventListener('click', () => {
            const updates = {
                text: modal.querySelector('.edit-text').value.trim(),
                description: modal.querySelector('.edit-description').value.trim(),
                dueDate: modal.querySelector('.edit-due-date').value,
                priority: modal.querySelector('.edit-priority').value,
                category: modal.querySelector('.edit-category').value
            };

            TodoService.editTodo(this.panelId, this.todo.id, updates);
            Object.assign(this.todo, updates);
            
            const newElement = this.render();
            this.element.replaceWith(newElement);
            this.element = newElement;
            this.attachEventListeners();
            
            modal.remove();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
    }
}