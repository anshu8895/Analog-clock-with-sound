document.addEventListener('DOMContentLoaded', function() {
	// Sound functionality
	let sound;
	let audioContext;
	let currentSoundFile = 'assets/clock-sound.mp3';
	let isPlaying = false;
	let soundType = 'file'; // 'file' or 'generated'
	let tickInterval;
	let button = document.getElementById('playButton');
	let soundOptions = document.getElementById('sound-options');

	// Alarm functionality
	let alarmTime = null;
	let alarmTimeout;
	let alarmSound;
	let isAlarmSet = false;
	
	// Timer functionality
	let timerInterval;
	let timerSeconds = 0;
	let timerRunning = false;
	let timerPaused = false;
	
	// Stopwatch functionality
	let stopwatchInterval;
	let stopwatchTime = 0;
	let stopwatchRunning = false;
	let lapCounter = 0;
	
	// DOM elements
	const digitalClock = document.getElementById('digital-clock');
	const dateDisplay = document.getElementById('date-display');
	const themeOptions = document.getElementById('theme-options');
	const timezoneOptions = document.getElementById('timezone-options');
	const fullscreenButton = document.getElementById('fullscreenButton');
	const modal = document.getElementById('modal');
	const closeModal = document.querySelector('.close');
	const stopAlarmButton = document.getElementById('stopAlarm');
	const setAlarmButton = document.getElementById('setAlarm');
	const clearAlarmButton = document.getElementById('clearAlarm');
	const alarmTimeInput = document.getElementById('alarm-time');
	const alarmStatus = document.getElementById('alarm-status');
	
	// Timer elements
	const timerHoursInput = document.getElementById('timer-hours-input');
	const timerMinutesInput = document.getElementById('timer-minutes-input');
	const timerSecondsInput = document.getElementById('timer-seconds-input');
	const timerHoursDisplay = document.getElementById('timer-hours');
	const timerMinutesDisplay = document.getElementById('timer-minutes');
	const timerSecondsDisplay = document.getElementById('timer-seconds');
	const startTimerButton = document.getElementById('start-timer');
	const pauseTimerButton = document.getElementById('pause-timer');
	const resetTimerButton = document.getElementById('reset-timer');
	const timerModal = document.getElementById('timer-modal');
	const timerCloseButton = document.querySelector('.timer-close');
	const stopTimerAlarmButton = document.getElementById('stop-timer-alarm');
	
	// Stopwatch elements
	const stopwatchMinutesDisplay = document.getElementById('stopwatch-minutes');
	const stopwatchSecondsDisplay = document.getElementById('stopwatch-seconds');
	const stopwatchMillisecondsDisplay = document.getElementById('stopwatch-milliseconds');
	const startStopwatchButton = document.getElementById('start-stopwatch');
	const lapStopwatchButton = document.getElementById('lap-stopwatch');
	const resetStopwatchButton = document.getElementById('reset-stopwatch');
	const lapList = document.getElementById('lap-list');
	
	// Tab navigation
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabPanes = document.querySelectorAll('.tab-pane');
	
	tabButtons.forEach(button => {
		button.addEventListener('click', function() {
			const tabId = this.getAttribute('data-tab');
			
			// Remove active class from all buttons and panes
			tabButtons.forEach(btn => btn.classList.remove('active'));
			tabPanes.forEach(pane => pane.classList.remove('active'));
			
			// Add active class to current button and pane
			this.classList.add('active');
			document.getElementById(tabId).classList.add('active');
		});
	});
	
	// Initialize Web Audio API
	function initAudioContext() {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}
		return audioContext;
	}
	
	// Generate different types of tick sounds
	function generateTickSound(type) {
		const context = initAudioContext();
		
		if (type === 'soft') {
			// Generate a soft tick sound
			const oscillator = context.createOscillator();
			const gainNode = context.createGain();
			
			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime(800, context.currentTime);
			
			gainNode.gain.setValueAtTime(0, context.currentTime);
			gainNode.gain.linearRampToValueAtTime(0.03, context.currentTime + 0.005);
			gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);
			
			oscillator.connect(gainNode);
			gainNode.connect(context.destination);
			
			oscillator.start(context.currentTime);
			oscillator.stop(context.currentTime + 0.1);
			
		} else if (type === 'digital') {
			// Generate a digital beep sound
			const oscillator = context.createOscillator();
			const gainNode = context.createGain();
			
			oscillator.type = 'square';
			oscillator.frequency.setValueAtTime(1200, context.currentTime);
			
			gainNode.gain.setValueAtTime(0, context.currentTime);
			gainNode.gain.linearRampToValueAtTime(0.05, context.currentTime + 0.001);
			gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.05);
			
			oscillator.connect(gainNode);
			gainNode.connect(context.destination);
			
			oscillator.start(context.currentTime);
			oscillator.stop(context.currentTime + 0.05);
		}
	}
	
	// Sound playback functionality
	button.addEventListener('click', function () {
		if (soundType === 'file') {
			if (!sound || sound.src.indexOf(currentSoundFile) === -1) {
				sound = new Audio(currentSoundFile);
				sound.loop = true; 
			}

			if (!isPlaying) {
				sound.play();
				isPlaying = true;
				button.innerHTML = '<i class="fas fa-pause"></i>&nbsp&nbspPause clock sound';
			} else {
				sound.pause();
				isPlaying = false;
				button.innerHTML = '<i class="fas fa-play"></i>&nbsp&nbspPlay clock sound';
			}
		} else {
			// Handle generated sounds
			if (!isPlaying) {
				// Start the tick interval based on the current sound type
				if (currentSoundFile === 'generated-soft') {
					tickInterval = setInterval(() => generateTickSound('soft'), 1000);
				} else if (currentSoundFile === 'generated-digital') {
					tickInterval = setInterval(() => generateTickSound('digital'), 1000);
				}
				isPlaying = true;
				button.innerHTML = '<i class="fas fa-pause"></i> Pause clock sound';
			} else {
				// Stop the tick interval
				clearInterval(tickInterval);
				isPlaying = false;
				button.innerHTML = '<i class="fas fa-play"></i> Play clock sound';
			}
		}
	});
	
	// Sound selection
	soundOptions.addEventListener('change', function() {
		const wasPlaying = isPlaying;
		
		if (isPlaying) {
			if (soundType === 'file' && sound) {
				sound.pause();
			} else if (tickInterval) {
				clearInterval(tickInterval);
			}
			isPlaying = false;
			button.innerHTML = '<i class="fas fa-play"></i> Play clock sound';
		}
		
		// Set the sound type and source based on selection
		if (this.value === 'generated-soft' || this.value === 'generated-digital') {
			soundType = 'generated';
			currentSoundFile = this.value;
		} else {
			soundType = 'file';
			// Fix: Use the value directly since it already contains the assets/ prefix
			currentSoundFile = this.value;
			sound = new Audio(currentSoundFile);
			sound.loop = true;
		}
		
		if (wasPlaying) {
			if (soundType === 'file') {
				sound.play();
				button.innerHTML = '<i class="fas fa-pause"></i> Pause clock sound';
			} else {
				// Start the tick interval based on the current sound type
				if (currentSoundFile === 'generated-soft') {
					tickInterval = setInterval(() => generateTickSound('soft'), 1000);
				} else if (currentSoundFile === 'generated-digital') {
					tickInterval = setInterval(() => generateTickSound('digital'), 1000);
				}
				button.innerHTML = '<i class="fas fa-pause"></i> Pause clock sound';
			}
			isPlaying = true;
		}
	});
	
	// Timer spinner buttons
	const spinnerButtons = document.querySelectorAll('.spinner-btn');
	spinnerButtons.forEach(button => {
		button.addEventListener('click', function() {
			const target = this.getAttribute('data-target');
			const direction = this.classList.contains('up') ? 1 : -1;
			let input;
			let max;
			
			if (target === 'timer-hours') {
				input = timerHoursInput;
				max = 23;
			} else if (target === 'timer-minutes') {
				input = timerMinutesInput;
				max = 59;
			} else if (target === 'timer-seconds') {
				input = timerSecondsInput;
				max = 59;
			}
			
			let value = parseInt(input.value) + direction;
			if (value < 0) value = max;
			if (value > max) value = 0;
			
			input.value = value;
			updateTimerDisplay(
				parseInt(timerHoursInput.value),
				parseInt(timerMinutesInput.value),
				parseInt(timerSecondsInput.value)
			);
		});
	});
	
	// Timer input change event
	[timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(input => {
		input.addEventListener('change', function() {
			let value = parseInt(this.value);
			const max = this === timerHoursInput ? 23 : 59;
			
			if (isNaN(value) || value < 0) value = 0;
			if (value > max) value = max;
			
			this.value = value;
			updateTimerDisplay(
				parseInt(timerHoursInput.value),
				parseInt(timerMinutesInput.value),
				parseInt(timerSecondsInput.value)
			);
		});
	});
	
	// Update timer display
	function updateTimerDisplay(hours, minutes, seconds) {
		timerHoursDisplay.textContent = hours.toString().padStart(2, '0');
		timerMinutesDisplay.textContent = minutes.toString().padStart(2, '0');
		timerSecondsDisplay.textContent = seconds.toString().padStart(2, '0');
	}
	
	// Start timer
	startTimerButton.addEventListener('click', function() {
		if (timerRunning) return;
		
		const hours = parseInt(timerHoursInput.value) || 0;
		const minutes = parseInt(timerMinutesInput.value) || 0;
		const seconds = parseInt(timerSecondsInput.value) || 0;
		
		// Return if all inputs are 0
		if (hours === 0 && minutes === 0 && seconds === 0) return;
		
		timerSeconds = hours * 3600 + minutes * 60 + seconds;
		
		timerInterval = setInterval(function() {
			timerSeconds--;
			
			if (timerSeconds <= 0) {
				clearInterval(timerInterval);
				timerRunning = false;
				timerPaused = false;
				
				// Reset inputs
				timerHoursInput.value = 0;
				timerMinutesInput.value = 0;
				timerSecondsInput.value = 0;
				
				// Update display
				updateTimerDisplay(0, 0, 0);
				
				// Enable/disable buttons
				startTimerButton.disabled = false;
				pauseTimerButton.disabled = true;
				resetTimerButton.disabled = true;
				
				// Show the timer modal
				timerModal.style.display = 'block';
				
				// Play the alarm sound
				const timerAlarmSound = new Audio('assets/alarm-sound.mp3');
				timerAlarmSound.loop = true;
				timerAlarmSound.play();
				
				// Save the sound so it can be stopped later
				alarmSound = timerAlarmSound;
				
				return;
			}
			
			const h = Math.floor(timerSeconds / 3600);
			const m = Math.floor((timerSeconds % 3600) / 60);
			const s = timerSeconds % 60;
			
			updateTimerDisplay(h, m, s);
		}, 1000);
		
		timerRunning = true;
		
		// Enable/disable buttons
		startTimerButton.disabled = true;
		pauseTimerButton.disabled = false;
		resetTimerButton.disabled = false;
	});
	
	// Pause timer
	pauseTimerButton.addEventListener('click', function() {
		if (!timerRunning) return;
		
		if (timerPaused) {
			// Resume timer
			timerInterval = setInterval(function() {
				timerSeconds--;
				
				if (timerSeconds <= 0) {
					clearInterval(timerInterval);
					timerRunning = false;
					timerPaused = false;
					
					// Update display
					updateTimerDisplay(0, 0, 0);
					
					// Enable/disable buttons
					startTimerButton.disabled = false;
					pauseTimerButton.disabled = true;
					resetTimerButton.disabled = true;
					
					return;
				}
				
				const h = Math.floor(timerSeconds / 3600);
				const m = Math.floor((timerSeconds % 3600) / 60);
				const s = timerSeconds % 60;
				
				updateTimerDisplay(h, m, s);
			}, 1000);
			
			timerPaused = false;
			pauseTimerButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
		} else {
			// Pause timer
			clearInterval(timerInterval);
			timerPaused = true;
			pauseTimerButton.innerHTML = '<i class="fas fa-play"></i> Resume';
		}
	});
	
	// Reset timer
	resetTimerButton.addEventListener('click', function() {
		clearInterval(timerInterval);
		timerRunning = false;
		timerPaused = false;
		
		// Reset inputs to initial state
		timerHoursInput.value = 0;
		timerMinutesInput.value = 0;
		timerSecondsInput.value = 0;
		
		// Update display
		updateTimerDisplay(0, 0, 0);
		
		// Enable/disable buttons
		startTimerButton.disabled = false;
		pauseTimerButton.disabled = true;
		resetTimerButton.disabled = true;
		pauseTimerButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
	});
	
	// Timer modal close button
	timerCloseButton.addEventListener('click', function() {
		timerModal.style.display = 'none';
		if (alarmSound) {
			alarmSound.pause();
			alarmSound = null;
		}
	});
	
	// Stop timer alarm
	stopTimerAlarmButton.addEventListener('click', function() {
		timerModal.style.display = 'none';
		if (alarmSound) {
			alarmSound.pause();
			alarmSound = null;
		}
	});
	
	// Update stopwatch display
	function updateStopwatchDisplay(timeInMs) {
		const minutes = Math.floor(timeInMs / 60000);
		const seconds = Math.floor((timeInMs % 60000) / 1000);
		const milliseconds = Math.floor((timeInMs % 1000) / 10);
		
		stopwatchMinutesDisplay.textContent = minutes.toString().padStart(2, '0');
		stopwatchSecondsDisplay.textContent = seconds.toString().padStart(2, '0');
		stopwatchMillisecondsDisplay.textContent = milliseconds.toString().padStart(2, '0');
	}
	
	// Start/Stop stopwatch
	startStopwatchButton.addEventListener('click', function() {
		if (!stopwatchRunning) {
			// Start the stopwatch
			const startTime = Date.now() - stopwatchTime;
			
			stopwatchInterval = setInterval(function() {
				stopwatchTime = Date.now() - startTime;
				updateStopwatchDisplay(stopwatchTime);
			}, 10);
			
			stopwatchRunning = true;
			startStopwatchButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
			startStopwatchButton.classList.add('stop');
			lapStopwatchButton.disabled = false;
			resetStopwatchButton.disabled = true;
		} else {
			// Stop the stopwatch
			clearInterval(stopwatchInterval);
			stopwatchRunning = false;
			startStopwatchButton.innerHTML = '<i class="fas fa-play"></i> Start';
			startStopwatchButton.classList.remove('stop');
			lapStopwatchButton.disabled = true;
			resetStopwatchButton.disabled = false;
		}
	});
	
	// Record lap time
	lapStopwatchButton.addEventListener('click', function() {
		if (!stopwatchRunning) return;
		
		lapCounter++;
		const lapTime = stopwatchTime;
		
		// Format lap time
		const minutes = Math.floor(lapTime / 60000);
		const seconds = Math.floor((lapTime % 60000) / 1000);
		const milliseconds = Math.floor((lapTime % 1000) / 10);
		
		const formattedTime = 
			`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
		
		// Create lap list item
		const li = document.createElement('li');
		li.innerHTML = `<span>Lap ${lapCounter}</span><span>${formattedTime}</span>`;
		
		// Insert at beginning of list for chronological order
		lapList.insertBefore(li, lapList.firstChild);
	});
	
	// Reset stopwatch
	resetStopwatchButton.addEventListener('click', function() {
		clearInterval(stopwatchInterval);
		stopwatchTime = 0;
		stopwatchRunning = false;
		lapCounter = 0;
		
		// Update display
		updateStopwatchDisplay(0);
		
		// Clear lap list
		lapList.innerHTML = '';
		
		// Reset buttons
		startStopwatchButton.innerHTML = '<i class="fas fa-play"></i> Start';
		startStopwatchButton.classList.remove('stop');
		lapStopwatchButton.disabled = true;
		resetStopwatchButton.disabled = true;
	});
	
	// Theme selection
	themeOptions.addEventListener('change', function() {
		const theme = this.value;
		document.body.className = theme !== 'default' ? `${theme}-theme` : '';
	});
	
	// Fullscreen functionality
	fullscreenButton.addEventListener('click', function() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().then(() => {
				document.body.classList.add('fullscreen-mode');
				fullscreenButton.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen().then(() => {
					document.body.classList.remove('fullscreen-mode');
					fullscreenButton.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
				});
			}
		}
	});
	
	// Timezone offsets in hours
	const timezoneOffsets = {
		'local': 0,
		'UTC': 0,
		'EST': -5,
		'PST': -8,
		'JST': 9,
		'IST': 5.5
	};
	
	// Clock functionality with timezone support
	function show_clock() {
		let date = new Date();
		let selectedTimezone = timezoneOptions.value;
		
		// For non-local timezones, adjust the date
		if (selectedTimezone !== 'local') {
			// Get user's local offset in hours
			const localOffset = -date.getTimezoneOffset() / 60;
			
			// Calculate the difference between selected timezone and local timezone
			const offsetDiff = timezoneOffsets[selectedTimezone] - localOffset;
			
			// Create a new date with the adjusted time
			date = new Date(date.getTime() + offsetDiff * 60 * 60 * 1000);
		}

		let hours = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();
		
		// Update analog clock
		let h = document.getElementsByClassName('hr')[0];
		let m = document.getElementsByClassName('mn')[0];
		let s = document.getElementsByClassName('ss')[0];

		h.style.transform = `rotate(${30 * hours + minutes / 2}deg)`;
		m.style.transform = `rotate(${6 * minutes}deg)`;
		s.style.transform = `rotate(${6 * seconds}deg)`;
		
		// Update digital clock
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = seconds.toString().padStart(2, '0');
		digitalClock.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
		
		// Update date display
		const options = { weekday: 'long', month: 'long', day: 'numeric' };
		dateDisplay.textContent = date.toLocaleDateString('en-US', options);
		
		// Check if alarm needs to be triggered
		if (isAlarmSet) {
			checkAlarm(hours, minutes);
		}
	}
	
	// Set the alarm
	setAlarmButton.addEventListener('click', function() {
		if (alarmTimeInput.value) {
			const [hours, minutes] = alarmTimeInput.value.split(':');
			alarmTime = { hours: parseInt(hours), minutes: parseInt(minutes) };
			
			isAlarmSet = true;
			setAlarmButton.disabled = true;
			clearAlarmButton.disabled = false;
			
			const ampm = alarmTime.hours >= 12 ? 'PM' : 'AM';
			const displayHours = alarmTime.hours % 12 || 12;
			alarmStatus.textContent = `Alarm set for ${displayHours}:${alarmTime.minutes.toString().padStart(2, '0')} ${ampm}`;
			alarmStatus.style.color = '#4CAF50';
		}
	});
	
	// Clear the alarm
	clearAlarmButton.addEventListener('click', function() {
		isAlarmSet = false;
		alarmTime = null;
		setAlarmButton.disabled = false;
		clearAlarmButton.disabled = true;
		alarmStatus.textContent = 'No alarm set';
		alarmStatus.style.color = '';
		
		if (alarmTimeout) {
			clearTimeout(alarmTimeout);
		}
	});
	
	// Check if alarm should be triggered
	function checkAlarm(currentHours, currentMinutes) {
		if (alarmTime && currentHours === alarmTime.hours && currentMinutes === alarmTime.minutes && modal.style.display !== 'block') {
			triggerAlarm();
		}
	}
	
	// Trigger the alarm
	function triggerAlarm() {
		modal.style.display = 'block';
		
		// Create and play alarm sound
		alarmSound = new Audio('assets/alarm-sound.mp3');
		alarmSound.loop = true;
		alarmSound.play();
		
		// Vibrate if supported
		if (navigator.vibrate) {
			navigator.vibrate([300, 100, 300, 100, 300]);
		}
	}
	
	// Stop the alarm
	stopAlarmButton.addEventListener('click', function() {
		modal.style.display = 'none';
		if (alarmSound) {
			alarmSound.pause();
			alarmSound = null;
		}
		
		// Reset alarm state to prevent it from triggering again
		isAlarmSet = false;
		alarmTime = null;
		
		// Update UI to reflect that alarm is no longer set
		setAlarmButton.disabled = false;
		clearAlarmButton.disabled = true;
		alarmStatus.textContent = 'No alarm set';
		alarmStatus.style.color = '';
	});
	
	// Close the modal
	closeModal.addEventListener('click', function() {
		modal.style.display = 'none';
		if (alarmSound) {
			alarmSound.pause();
			alarmSound = null;
		}
		
		// Reset alarm state to prevent it from triggering again
		isAlarmSet = false;
		alarmTime = null;
		
		// Update UI to reflect that alarm is no longer set
		setAlarmButton.disabled = false;
		clearAlarmButton.disabled = true;
		alarmStatus.textContent = 'No alarm set';
		alarmStatus.style.color = '';
	});
	
	// Initialize the clock
	show_clock();
	setInterval(show_clock, 1000);
	
	// Initialize the timer display
	updateTimerDisplay(0, 0, 0);
	
	// Initialize the stopwatch display
	updateStopwatchDisplay(0);
	
	// Initialize the alarm status
	alarmStatus.textContent = 'No alarm set';
	
	// Handle time input limitations
	alarmTimeInput.addEventListener('input', function() {
		if (alarmTimeInput.value) {
			setAlarmButton.disabled = false;
		} else {
			setAlarmButton.disabled = true;
		}
	});
	
	// Timezone change handler
	timezoneOptions.addEventListener('change', function() {
		// Call the show_clock function immediately when timezone changes
		show_clock();
	});
	
	// Listen for theme and fullscreen changes
	document.addEventListener('fullscreenchange', function() {
		if (!document.fullscreenElement) {
			document.body.classList.remove('fullscreen-mode');
			fullscreenButton.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
		}
	});
});