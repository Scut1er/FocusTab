// Управление списком задач
class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
    }

    // Загрузка задач из localStorage
    loadTasks() {
        this.tasks = loadTasks();
        this.render();
    }

    // Сохранение задач в localStorage
    save() {
        saveTasks(this.tasks);
    }

    // Добавление новой задачи
    addTask(text) {
        if (!text || text.trim() === '') {
            return false;
        }

        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task); // Добавляем в начало списка
        this.save();
        this.render();
        return true;
    }

    // Отметка задачи как выполненной
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    }

    // Удаление задачи
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    }

    // Отрисовка списка задач
    render() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        if (this.tasks.length === 0) {
            tasksList.innerHTML = '<li class="task-empty">Нет задач. Добавьте первую задачу!</li>';
            return;
        }

        // Сортируем: сначала невыполненные, потом выполненные
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return b.id - a.id; // Новые сверху
            }
            return a.completed ? 1 : -1;
        });

        tasksList.innerHTML = sortedTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    aria-label="Отметить задачу как выполненную"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button 
                    class="task-delete" 
                    aria-label="Удалить задачу"
                    title="Удалить задачу"
                >×</button>
            </li>
        `).join('');

        // Добавляем обработчики событий
        tasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTask(taskId);
            });
        });

        tasksList.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    // Экранирование HTML для безопасности
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Класс TaskManager экспортируется для использования в app.js

