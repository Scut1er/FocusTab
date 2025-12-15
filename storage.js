// Утилиты для работы с localStorage
const STORAGE_PREFIX = 'ft_';

// Сохранение задач
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showNotification('Ошибка: недостаточно места для сохранения данных. Очистите старые данные.', 'error');
        } else {
            console.error('Ошибка сохранения задач:', error);
        }
    }
}

// Загрузка задач
function loadTasks() {
    try {
        const tasksJson = localStorage.getItem(STORAGE_PREFIX + 'tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        return [];
    }
}

// Сохранение статистики Pomodoro
function savePomodoroStats(date, count) {
    try {
        const key = STORAGE_PREFIX + 'stats_' + date;
        localStorage.setItem(key, JSON.stringify({
            date: date,
            count: count,
            timestamp: Date.now()
        }));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showNotification('Ошибка: недостаточно места для сохранения статистики.', 'error');
        } else {
            console.error('Ошибка сохранения статистики:', error);
        }
    }
}

// Загрузка статистики Pomodoro за дату
function loadPomodoroStats(date) {
    try {
        const key = STORAGE_PREFIX + 'stats_' + date;
        const statsJson = localStorage.getItem(key);
        return statsJson ? JSON.parse(statsJson) : { date: date, count: 0 };
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        return { date: date, count: 0 };
    }
}

// Увеличение счетчика завершенных Pomodoro за сегодня
function incrementPomodoroCount() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const stats = loadPomodoroStats(today);
    stats.count = (stats.count || 0) + 1;
    savePomodoroStats(today, stats.count);
    return stats.count;
}

// Сохранение настроек
function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
    }
}

// Загрузка настроек
function loadSettings() {
    try {
        const settingsJson = localStorage.getItem(STORAGE_PREFIX + 'settings');
        return settingsJson ? JSON.parse(settingsJson) : {
            theme: 'light',
            soundEnabled: true,
            notificationsEnabled: false
        };
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        return {
            theme: 'light',
            soundEnabled: true,
            notificationsEnabled: false
        };
    }
}

// Загрузка всей статистики Pomodoro
function loadAllPomodoroStats() {
    const stats = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX + 'stats_')) {
                try {
                    const statData = JSON.parse(localStorage.getItem(key));
                    if (statData && statData.date && statData.count) {
                        stats.push(statData);
                    }
                } catch (e) {
                    console.warn('Ошибка парсинга статистики для ключа:', key);
                }
            }
        }
        // Сортируем по дате (обратный хронологический порядок)
        stats.sort((a, b) => new Date(b.date) - new Date(a.date));
        return stats;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        return [];
    }
}

// Фильтрация статистики по диапазону дат
function filterStatsByDateRange(stats, startDate, endDate) {
    if (!startDate && !endDate) {
        return stats;
    }
    
    return stats.filter(stat => {
        const statDate = new Date(stat.date);
        if (startDate && statDate < new Date(startDate)) {
            return false;
        }
        if (endDate && statDate > new Date(endDate)) {
            return false;
        }
        return true;
    });
}

// Проверка поддержки localStorage
function isLocalStorageSupported() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

