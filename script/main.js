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

	// Build mult choice table
	const multchoice = $('#multchoice');
	for (let i=-1; i<10; i++) {
		const tr = document.createElement('tr');
		if (i == -1) {
			const th1 = document.createElement('th');
			const th2 = document.createElement('th');
			th1.innerText = 'Num 1';
			th2.innerText = 'Num 2';
			tr.appendChild(th1);
			tr.appendChild(th2);
			multchoice.appendChild(tr);
			continue;
		}
		const td1 = document.createElement('td');
		const td2 = document.createElement('td');
		const cb1 = document.createElement('input');
		const cb2 = document.createElement('input');
		cb1.type = 'checkbox';
		cb2.type = 'checkbox';
		cb1.checked = true;
		cb2.checked = true;
		const span1 = document.createElement('span');
		const span2 = document.createElement('span');
		span1.innerText = numToHunString(i*10) + "-" + numToHunString((i+1)*10-i);
		span2.innerText = numToHunString(i*10) + "-" + numToHunString((i+1)*10-i);
		cb1.addEventListener('change', e => {
			game.multChoice1[i] = cb1.checked;
		});
		cb2.addEventListener('change', e => {
			game.multChoice2[i] = cb2.checked;
		});
		td1.appendChild(cb1);
		td1.appendChild(span1);
		td2.appendChild(cb2);
		td2.appendChild(span2);
		tr.appendChild(td1);
		tr.appendChild(td2);
		multchoice.appendChild(tr);
	}

	// Clear/set all mult choices
	$('#clearAllChoices').addEventListener('click', e => {
		e.preventDefault();
		$$('#multchoice input').forEach(cb => {
			cb.checked = false;
			cb.dispatchEvent(new Event('change'));
		});
	});
	$('#setAllChoices').addEventListener('click', e => {
		e.preventDefault();
		$$('#multchoice input').forEach(cb => {
			cb.checked = true;
			cb.dispatchEvent(new Event('change'));
		});
	});
});
