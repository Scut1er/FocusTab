// Управление таймером Pomodoro
class PomodoroTimer {
    constructor() {
        this.workDuration = 0.1 * 60; // 25 минут в секундах
        this.shortBreakDuration = 0.1 * 60; // 5 минут в секундах
        this.longBreakDuration =  0.1 * 60; // 15 минут в секундах
        this.currentTime = this.workDuration;
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'work'; // 'work' или 'break'
        this.completedPomodoros = 0;
        this.intervalId = null;
    }

    // Запуск таймера
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateDisplay();
            } else {
                this.completeInterval();
            }
        }, 1000);
        
        this.updateDisplay();
    }

    // Пауза таймера
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = true;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateDisplay();
    }

    // Сброс таймера
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Сброс к начальному значению текущего интервала
        if (this.currentMode === 'work') {
            this.currentTime = this.workDuration;
        } else {
            this.currentTime = this.shortBreakDuration;
        }
        
        this.updateDisplay();
    }

    // Завершение интервала
    completeInterval() {
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.currentMode === 'work') {
            this.completedPomodoros++;
            incrementPomodoroCount();
            
            // Воспроизведение звука для рабочего интервала
            if (soundManager) {
                soundManager.playSound('work');
            }
            
            // Показ уведомления о завершении рабочего интервала
            showNotification('Рабочий интервал завершен! Время для отдыха.', 'success');
            showBrowserNotification();
            
            // Автоматический переход на перерыв
            if (this.completedPomodoros % 4 === 0) {
                this.currentMode = 'break';
                this.currentTime = this.longBreakDuration;
                showNotification('Долгий перерыв (15 минут)', 'info');
            } else {
                this.currentMode = 'break';
                this.currentTime = this.shortBreakDuration;
            }
        } else {
            // Воспроизведение звука для перерыва
            if (soundManager) {
                soundManager.playSound('break');
            }
            
            // Показ уведомления о завершении перерыва
            showNotification('Перерыв завершен! Время работать.', 'info');
            showBrowserNotification();
            
            this.currentMode = 'work';
            this.currentTime = this.workDuration;
        }
        
        this.updateDisplay();
    }

    // Обновление отображения таймера
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        const timerStatus = document.getElementById('timerStatus');
        
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }
        
        if (timerStatus) {
            if (this.isRunning) {
                timerStatus.textContent = this.currentMode === 'work' ? 'Работа' : 'Перерыв';
            } else if (this.isPaused) {
                timerStatus.textContent = 'На паузе';
            } else {
                timerStatus.textContent = this.currentMode === 'work' ? 'Готов к запуску' : 'Готов к перерыву';
            }
        }
    }

    // Получение текущего состояния
    getState() {
        return {
            currentTime: this.currentTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentMode: this.currentMode,
            completedPomodoros: this.completedPomodoros
        };
    }
}

// Класс PomodoroTimer экспортируется для использования в app.js

