import {$, $$, numToHunString} from './util.js';
import {Game} from './game.js';

window.addEventListener('load', e => {
	const canvas = $('#game-canvas');
	const game = new Game(canvas);
	game.addCloud();
	//game.selected = game.clouds.at(-1);
	game.start();
	
	// Build numpad
	const numpad = $('#numpad');
	for (let i=0; i<10; i++) {
		const tr = document.createElement('tr');
		numpad.appendChild(tr);
		for (let j=0; j<10; j++) {
			const td = document.createElement('td');
			tr.appendChild(td);
			td.innerText = numToHunString(i*10 + j);
			td.addEventListener('mouseenter', e => {
				td.classList.add('pink');
			});
			td.addEventListener('mouseout', e => {
				td.classList.remove('pink');
			});
			td.addEventListener('click', e => {
				canvas.dispatchEvent(new KeyboardEvent('keydown', {'key': i.toString()}));
				canvas.dispatchEvent(new KeyboardEvent('keydown', {'key': j.toString()}));
				canvas.focus();
			});
		}
	}

	const deleteButton = $('#delete');
	deleteButton.addEventListener('click', e => {
		e.preventDefault();
		canvas.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Backspace'}));
		canvas.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Backspace'}));
		canvas.focus();
	});
});
