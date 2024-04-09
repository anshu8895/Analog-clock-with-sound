document.addEventListener('DOMContentLoaded', function() {
	let sound; 
	let isPlaying = false;
	let button = document.getElementById('playButton');

	button.addEventListener('click', function () {
		if (!sound) {
			sound = new Audio('clock-sound.mp3');
			sound.loop = true; 
		}

		if (!isPlaying) {
			sound.play();
			isPlaying = true;
			button.innerText = "Pause clock sound";
		} else {
			sound.pause();
			isPlaying = false;
			button.innerText = "Play clock sound";
		}
	});
});


function show_clock() {

	let h = document.getElementsByClassName('hr')[0];
	let m = document.getElementsByClassName('mn')[0];
	let s = document.getElementsByClassName('ss')[0];

	let date = new Date();

	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();

	h.style.transform = `rotate(${30 * hours + minutes / 2}deg)`;
	m.style.transform = `rotate(${6 * minutes}deg)`;
	s.style.transform = `rotate(${6 * seconds}deg)`;
}
setInterval(show_clock, 1000);