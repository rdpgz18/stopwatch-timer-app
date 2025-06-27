document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    // Tab Elements
    const tabStopwatchButton = document.getElementById('tab-stopwatch');
    const tabTimerButton = document.getElementById('tab-timer');
    const stopwatchContent = document.getElementById('stopwatch-content');
    const timerContent = document.getElementById('timer-content');
    const tabButtons = document.querySelectorAll('.tab-button');

    // Stopwatch Elements
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const lapList = document.getElementById('lap-list');

    // Timer Elements
    const timerInputH = document.getElementById('timer-input-h');
    const timerInputM = document.getElementById('timer-input-m');
    const timerInputS = document.getElementById('timer-input-s');
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const alarmAudio = document.getElementById('alarm-audio');
    const alarmSoundSelect = document.getElementById('alarm-sound');
    const alarmVolumeInput = document.getElementById('alarm-volume');
    const alarmLoopCheckbox = document.getElementById('alarm-loop');

    // --- Variabel Stopwatch ---
    let stopwatchInterval;
    let stopwatchTime = 0;
    let isStopwatchRunning = false;
    let lapCounter = 0;

    // --- Variabel Timer ---
    let timerInterval;
    let timerRemainingTime = 0; // Waktu tersisa dalam milidetik
    let isTimerRunning = false;
    let timerInitialSetTime = 0; // Untuk reset

    // --- Fungsi Utilitas ---
    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        let milliseconds = Math.floor((ms % 1000) / 10); // Ambil dua digit milidetik

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${ms >= 1000 ? '' : `.${String(milliseconds).padStart(2, '0')}`}`;
    }

    // --- Mode Gelap/Terang ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.classList.remove('dark', 'light'); // Hapus yang ada
        html.classList.add(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
    } else {
        html.classList.add('light');
    }

    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            html.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.remove('light');
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Fungsi Tab Navigasi ---
    function showTab(tabName) {
        tabButtons.forEach(button => {
            button.classList.remove('active', 'border-blue-600', 'dark:border-blue-400', 'text-blue-600', 'dark:text-blue-400');
            button.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        });

        stopwatchContent.classList.add('hidden');
        timerContent.classList.add('hidden');

        if (tabName === 'stopwatch') {
            tabStopwatchButton.classList.add('active', 'border-blue-600', 'dark:border-blue-400', 'text-blue-600', 'dark:text-blue-400');
            tabStopwatchButton.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            stopwatchContent.classList.remove('hidden');
        } else if (tabName === 'timer') {
            tabTimerButton.classList.add('active', 'border-blue-600', 'dark:border-blue-400', 'text-blue-600', 'dark:text-blue-400');
            tabTimerButton.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            timerContent.classList.remove('hidden');
        }
    }

    tabStopwatchButton.addEventListener('click', () => showTab('stopwatch'));
    tabTimerButton.addEventListener('click', () => showTab('timer'));

    // --- Logika Stopwatch ---
    function updateStopwatch() {
        stopwatchTime += 10; // Update setiap 10ms
        stopwatchDisplay.textContent = formatTime(stopwatchTime);
    }

    stopwatchStartBtn.addEventListener('click', () => {
        if (!isStopwatchRunning) {
            stopwatchInterval = setInterval(updateStopwatch, 10); // Update setiap 10ms
            isStopwatchRunning = true;
            stopwatchStartBtn.classList.add('hidden');
            stopwatchPauseBtn.classList.remove('hidden');
        }
    });

    stopwatchPauseBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchStartBtn.classList.remove('hidden');
        stopwatchPauseBtn.classList.add('hidden');
    });

    stopwatchResetBtn.addEventListener('click', () => {
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        isStopwatchRunning = false;
        stopwatchDisplay.textContent = '00:00:00.00';
        lapList.innerHTML = ''; // Hapus daftar lap
        lapCounter = 0;
        stopwatchStartBtn.classList.remove('hidden');
        stopwatchPauseBtn.classList.add('hidden');
    });

    stopwatchLapBtn.addEventListener('click', () => {
        if (isStopwatchRunning) {
            lapCounter++;
            const lapTime = formatTime(stopwatchTime);
            const li = document.createElement('li');
            li.className = 'py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0';
            li.textContent = `Lap ${lapCounter}: ${lapTime}`;
            lapList.prepend(li); // Tambahkan lap terbaru di atas
        }
    });

    // --- Logika Timer ---
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timerRemainingTime);
        if (timerRemainingTime <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerRemainingTime = 0;
            timerDisplay.textContent = '00:00:00';
            playAlarm();
            timerStartBtn.classList.remove('hidden');
            timerPauseBtn.classList.add('hidden');
            // Notifikasi Browser
            if (Notification.permission === 'granted') {
                new Notification('Waktu Habis!', {
                    body: 'Timer Anda telah selesai.',
                    icon: './assets/icons/alarm-icon.png' // Pastikan Anda memiliki ikon ini
                });
            }
        }
    }

    function playAlarm() {
        alarmAudio.play();
        if (alarmLoopCheckbox.checked) {
            alarmAudio.loop = true;
        } else {
            alarmAudio.loop = false;
        }
    }

    // Set initial timer display based on inputs
    function setTimerFromInputs() {
        const hours = parseInt(timerInputH.value) || 0;
        const minutes = parseInt(timerInputM.value) || 0;
        const seconds = parseInt(timerInputS.value) || 0;
        timerInitialSetTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        timerRemainingTime = timerInitialSetTime;
        timerDisplay.textContent = formatTime(timerRemainingTime);
    }

    timerInputH.addEventListener('input', setTimerFromInputs);
    timerInputM.addEventListener('input', setTimerFromInputs);
    timerInputS.addEventListener('input', setTimerFromInputs);
    alarmSoundSelect.addEventListener('change', () => {
        alarmAudio.src = alarmSoundSelect.value;
        alarmAudio.load(); // Memuat suara baru
    });
    alarmVolumeInput.addEventListener('input', () => {
        alarmAudio.volume = alarmVolumeInput.value;
    });

    timerStartBtn.addEventListener('click', () => {
        if (!isTimerRunning && timerRemainingTime > 0) {
            // Hentikan alarm jika sedang berbunyi
            alarmAudio.pause();
            alarmAudio.currentTime = 0;

            timerInterval = setInterval(() => {
                timerRemainingTime -= 1000; // Kurangi setiap detik
                updateTimerDisplay();
            }, 1000); // Update setiap 1 detik

            isTimerRunning = true;
            timerStartBtn.classList.add('hidden');
            timerPauseBtn.classList.remove('hidden');
        }
    });

    timerPauseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerStartBtn.classList.remove('hidden');
        timerPauseBtn.classList.add('hidden');
    });

    timerResetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerRemainingTime = timerInitialSetTime; // Kembali ke waktu awal yang diatur
        updateTimerDisplay();
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        timerStartBtn.classList.remove('hidden');
        timerPauseBtn.classList.add('hidden');
    });

    // Inisialisasi tampilan timer saat halaman dimuat
    setTimerFromInputs();

    // Permintaan izin notifikasi
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Izin notifikasi diberikan.');
                }
            });
        }
    }

    // --- Custom Scrollbar untuk Lap List (hanya CSS) ---
    // Tambahkan kelas ini di style.css atau di blok style HTML jika ingin cepat
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #4a5568; /* bg-gray-700 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a0aec0; /* text-gray-400 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e0; /* text-gray-300 */
        }

        /* Styling for timer input */
        .timer-input {
            @apply w-20 text-center text-4xl md:text-5xl font-mono tracking-wider bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
        }
        /* Custom button styling */
        .btn-action {
            @apply px-6 py-3 rounded-full text-white font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800;
        }
        .btn-action.bg-green-500:focus\\:ring-green-500 { @apply focus:ring-green-500; }
        .btn-action.bg-yellow-500:focus\\:ring-yellow-500 { @apply focus:ring-yellow-500; }
        .btn-action.bg-red-500:focus\\:ring-red-500 { @apply focus:ring-red-500; }
        .btn-action.bg-blue-500:focus\\:ring-blue-500 { @apply focus:ring-blue-500; }
    `;
    document.head.appendChild(style);
});
