// Главный файл приложения
let appTimer = null;
let appTaskManager = null;

// Инициализация приложения
function initApp() {
    // Инициализация менеджера звуков
    soundManager = new SoundManager();

    // Инициализация таймера
    appTimer = new PomodoroTimer();
    appTimer.updateDisplay();

    // Инициализация менеджера задач
    appTaskManager = new TaskManager();

    // Отображение цитаты
    displayQuote();

    // Настройка обработчиков событий
    setupEventListeners();
    
    // Инициализация настроек
    initSettings();

    // Проверка поддержки localStorage
    if (!isLocalStorageSupported()) {
        showNotification('Ваш браузер не поддерживает сохранение данных. Некоторые функции могут быть недоступны.', 'warning');
    }
    
    // Проверка статуса уведомлений
    checkNotificationPermission();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Таймер
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            appTimer.start();
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            appTimer.pause();
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            appTimer.reset();
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            // Обновление цитаты при сбросе таймера
            const newQuote = getNewQuote();
            displayQuote(newQuote);
        });
    }

    // Задачи
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Поддержка Esc для очистки поля
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                taskInput.value = '';
                taskInput.blur();
            }
        });
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }

    // Цитаты
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', () => {
            const newQuote = getNewQuote();
            displayQuote(newQuote);
        });
    }
    
    // Настройки
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.style.display = 'flex';
            }
        });
    }
    
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }
    
    // Закрытие модального окна при клике вне его
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    // Тест звука
    const testSoundBtn = document.getElementById('testSoundBtn');
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', () => {
            if (soundManager) {
                // Принудительно воспроизводим звук для теста (рабочий интервал)
                soundManager.playSound('work', true);
            }
        });
    }
    
    // Включение/выключение звука
    const soundEnabled = document.getElementById('soundEnabled');
    if (soundEnabled) {
        soundEnabled.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            if (soundManager) {
                soundManager.setEnabled(enabled);
            }
            const settings = loadSettings();
            settings.soundEnabled = enabled;
            saveSettings(settings);
        });
    }
    
    // Запрос разрешения на уведомления
    const requestNotificationBtn = document.getElementById('requestNotificationBtn');
    if (requestNotificationBtn) {
        requestNotificationBtn.addEventListener('click', requestNotificationPermission);
    }
    
    // Статистика
    const statsBtn = document.getElementById('statsBtn');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const statsModal = document.getElementById('statsModal');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            if (statsModal) {
                statsModal.style.display = 'flex';
                loadAndDisplayStats();
            }
        });
    }
    
    if (closeStatsBtn && statsModal) {
        closeStatsBtn.addEventListener('click', () => {
            statsModal.style.display = 'none';
        });
    }
    
    if (statsModal) {
        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                statsModal.style.display = 'none';
            }
        });
    }
    
    // Получаем элементы дат один раз
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            if (validateDateRange()) {
                loadAndDisplayStats();
            }
        });
    }
    
    // Валидация дат при изменении
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', validateDateRange);
        endDateInput.addEventListener('change', validateDateRange);
        
        // Инициализация дат по умолчанию (последние 30 дней)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
}

// Добавление задачи
function addTask() {
    const taskInput = document.getElementById('taskInput');
    if (!taskInput || !appTaskManager) return;

    const text = taskInput.value.trim();
    if (text) {
        if (appTaskManager.addTask(text)) {
            taskInput.value = '';
            taskInput.focus();
        }
    }
}

// Отображение цитаты
function displayQuote(quote = null) {
    const quoteText = document.getElementById('quoteText');
    if (quoteText) {
        const quoteToShow = quote || getSessionQuote();
        quoteText.textContent = quoteToShow;
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker зарегистрирован:', registration);
                
                // Проверка обновлений Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Новый Service Worker установлен, перезагружаем страницу
                            window.location.reload();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Ошибка регистрации Service Worker:', error);
            });
        
        // Проверка обновлений при фокусе на вкладке
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);

// Обработка видимости страницы
document.addEventListener('visibilitychange', () => {
    if (document.hidden && appTimer && appTimer.isRunning) {
        // Таймер продолжает работать в фоне согласно спецификации
    }
});

// Инициализация настроек
function initSettings() {
    const settings = loadSettings();
    
    // Установка чекбокса звука
    const soundEnabled = document.getElementById('soundEnabled');
    if (soundEnabled) {
        const soundEnabledValue = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        soundEnabled.checked = soundEnabledValue;
        if (soundManager) {
            soundManager.setEnabled(soundEnabledValue);
        }
    }
    
    // Установка чекбокса уведомлений
    const notificationsEnabled = document.getElementById('notificationsEnabled');
    if (notificationsEnabled) {
        notificationsEnabled.checked = settings.notificationsEnabled || false;
        notificationsEnabled.addEventListener('change', (e) => {
            settings.notificationsEnabled = e.target.checked;
            saveSettings(settings);
            if (!e.target.checked) {
                updateNotificationStatus('Уведомления отключены');
            } else {
                checkNotificationPermission();
            }
        });
    }
}

// Проверка разрешения на уведомления
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        updateNotificationStatus('Браузер не поддерживает уведомления');
        return;
    }
    
    const requestBtn = document.getElementById('requestNotificationBtn');
    const statusEl = document.getElementById('notificationStatus');
    
    if (Notification.permission === 'granted') {
        if (requestBtn) requestBtn.style.display = 'none';
        updateNotificationStatus('Уведомления разрешены');
    } else if (Notification.permission === 'denied') {
        if (requestBtn) requestBtn.style.display = 'none';
        updateNotificationStatus('Уведомления заблокированы. Разрешите в настройках браузера.');
    } else {
        if (requestBtn) requestBtn.style.display = 'inline-block';
        updateNotificationStatus('Нажмите кнопку для запроса разрешения');
    }
}

// Запрос разрешения на уведомления
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showNotification('Ваш браузер не поддерживает уведомления', 'error');
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        const settings = loadSettings();
        
        if (permission === 'granted') {
            settings.notificationsEnabled = true;
            saveSettings(settings);
            showNotification('Уведомления разрешены!', 'success');
            checkNotificationPermission();
        } else if (permission === 'denied') {
            settings.notificationsEnabled = false;
            saveSettings(settings);
            showNotification('Уведомления заблокированы', 'warning');
            checkNotificationPermission();
        }
    } catch (error) {
        console.error('Ошибка запроса разрешения:', error);
        showNotification('Ошибка при запросе разрешения', 'error');
    }
}

// Обновление статуса уведомлений
function updateNotificationStatus(message) {
    const statusEl = document.getElementById('notificationStatus');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Валидация диапазона дат
function validateDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    
    if (!startDateInput || !endDateInput) {
        return true;
    }
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Если обе даты заполнены, проверяем что начальная <= конечной
    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('Дата "С" должна быть меньше или равна дате "По"', 'error');
            if (startDateInput) {
                startDateInput.style.borderColor = 'var(--danger-color)';
            }
            if (endDateInput) {
                endDateInput.style.borderColor = 'var(--danger-color)';
            }
            return false;
        }
    }
    
    // Убираем красную рамку при успешной валидации
    if (startDateInput) {
        startDateInput.style.borderColor = '';
    }
    if (endDateInput) {
        endDateInput.style.borderColor = '';
    }
    
    return true;
}

// Загрузка и отображение статистики
function loadAndDisplayStats() {
    const allStats = loadAllPomodoroStats();
    
    // Получаем фильтры дат
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startDate = startDateInput ? startDateInput.value : null;
    const endDate = endDateInput ? endDateInput.value : null;
    
    // Фильтруем статистику
    const filteredStats = filterStatsByDateRange(allStats, startDate, endDate);
    
    // Обновляем сводку
    updateStatsSummary(filteredStats);
    
    // Обновляем таблицу
    updateStatsTable(filteredStats);
}

// Обновление сводки статистики
function updateStatsSummary(stats) {
    const summaryEl = document.getElementById('statsSummary');
    if (!summaryEl) return;
    
    const totalPomodoros = stats.reduce((sum, stat) => sum + (stat.count || 0), 0);
    const totalMinutes = totalPomodoros * 25; // Каждый Pomodoro = 25 минут
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    summaryEl.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Всего Pomodoro:</span>
            <span class="summary-value">${totalPomodoros}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Всего времени:</span>
            <span class="summary-value">${totalHours} ч ${remainingMinutes} мин</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Дней с активностью:</span>
            <span class="summary-value">${stats.length}</span>
        </div>
    `;
}

// Обновление таблицы статистики
function updateStatsTable(stats) {
    const tableBody = document.getElementById('statsTableBody');
    const emptyEl = document.getElementById('statsEmpty');
    const tableContainer = document.querySelector('.stats-table-container');
    
    if (!tableBody) return;
    
    if (stats.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    
    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    
    tableBody.innerHTML = stats.map(stat => {
        const date = new Date(stat.date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const minutes = (stat.count || 0) * 25;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const timeStr = hours > 0 ? `${hours} ч ${remainingMinutes} мин` : `${remainingMinutes} мин`;
        
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${stat.count || 0}</td>
                <td>${timeStr}</td>
            </tr>
        `;
    }).join('');
}

// Показ браузерного уведомления
function showBrowserNotification() {
    const settings = loadSettings();
    
    if (!settings.notificationsEnabled) {
        return;
    }
    
    if (!('Notification' in window)) {
        return;
    }
    
    if (Notification.permission === 'granted') {
        let title = '';
        let body = '';
        
        // Определяем тип интервала по текущему состоянию таймера
        if (appTimer && appTimer.currentMode === 'work') {
            title = 'Рабочий интервал завершен!';
            body = 'Время для отдыха.';
        } else {
            title = 'Перерыв завершен!';
            body = 'Время возвращаться к работе.';
        }
        
        try {
            const notification = new Notification(title, {
                body: body,
                icon: './assets/icon-192.svg',
                badge: './assets/icon-192.svg',
                tag: 'pomodoro-timer',
                requireInteraction: false
            });
            
            // Автоматическое закрытие через 5 секунд
            setTimeout(() => {
                notification.close();
            }, 5000);
            
            // Обработка клика по уведомлению
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('Ошибка показа уведомления:', error);
        }
    }
}

