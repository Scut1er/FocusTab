// Модуль управления звуками уведомлений
class SoundManager {
    constructor() {
        this.workSoundUrl = './assets/notification.mp3';
        this.breakSoundUrl = './assets/notification2.mp3';
        this.enabled = true;
    }

    // Воспроизведение звука уведомления
    playSound(soundType = 'work', force = false) {
        // Если звук отключен и не принудительное воспроизведение (для теста), не играем
        if (!this.enabled && !force) {
            return;
        }

        // Выбираем звук в зависимости от типа интервала
        const soundUrl = soundType === 'break' ? this.breakSoundUrl : this.workSoundUrl;

        try {
            const audio = new Audio(soundUrl);
            audio.volume = 0.6; // Уровень громкости
            audio.play().catch(error => {
                console.warn('Ошибка воспроизведения звука:', error);
            });
        } catch (error) {
            console.warn('Ошибка создания аудио элемента:', error);
        }
    }

    // Включение/выключение звука
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Проверка, включен ли звук
    isEnabled() {
        return this.enabled;
    }
}

// Глобальный экземпляр менеджера звуков
let soundManager = null;
