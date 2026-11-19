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
	// Based on David's stupid request for multiple choices for digits
	// Like one-humber-multiplication
	function buildMultChoice(multchoice, array1, array2, array1h, array2h) {
		for (let i=-1; i<10; i++) {
			const tr = document.createElement('tr');
			if (i == -1) {
				const th1 = document.createElement('th');
				const th2 = document.createElement('th');
				th1.innerText = array1h;
				th2.innerText = array2h;
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
				array1[i] = cb1.checked;
			});
			cb2.addEventListener('change', e => {
				array2[i] = cb2.checked;
			});
			td1.appendChild(cb1);
			td1.appendChild(span1);
			td2.appendChild(cb2);
			td2.appendChild(span2);
			tr.appendChild(td1);
			tr.appendChild(td2);
			multchoice.appendChild(tr);
		}
	}
	
	buildMultChoice($('#multchoice'), game.multChoice1, game.multChoice2, 'Num 1', 'Num 2');
	buildMultChoice($('#multchoice-num1'), game.multChoice3, game.multChoice4, 
		'Num 1 *' + String.fromCharCode(0x5501) + String.fromCharCode(0x5500),
		'Num 1 *' + String.fromCharCode(0x5501));
	buildMultChoice($('#multchoice-num2'), game.multChoice5, game.multChoice6,
		'Num 2 *' + String.fromCharCode(0x5501) + String.fromCharCode(0x5500),
		'Num 2 *' + String.fromCharCode(0x5501));

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
