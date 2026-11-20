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
	// This is getting messy with David's repeated requests
	function buildMultChoice(multchoice, cbs1, cbs2, zero, array1, array2, array1h, array2h) {
		for (let i=-2; i<10; i++) {
			const tr = document.createElement('tr');
			if (i == -2) {
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
			cb1.checked = (i == -1) ? false : true;
			cb2.checked = (i == -1) ? false : true;
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');
			if (i == -1) {
				if (cbs1 === false) {
					continue;
				}
				span1.innerText = numToHunString(0);
				span2.innerText = numToHunString(0);
				cb1.addEventListener('change', e => {
					if (cb1.checked) {
						for (let j=0; j<cbs1.length; j++) {
							cbs1[j].checked = false;
							array1[j] = false;
						}
					}
				});
				cb2.addEventListener('change', e => {
					if (cb2.checked) {
						for (let j=0; j<cbs2.length; j++) {
							cbs2[j].checked = false;
							array2[j] = false;
						}
					}
				});
				zero.cb1 = cb1;
				zero.cb2 = cb2;
			} else {
				span1.innerText = numToHunString(i*10) + "-" + numToHunString((i+1)*10-i);
				span2.innerText = numToHunString(i*10) + "-" + numToHunString((i+1)*10-i);
				cb1.addEventListener('change', e => {
					array1[i] = cb1.checked;
					if (cb1.checked) {
						zero.cb1.checked = false;
					}
				});
				cb2.addEventListener('change', e => {
					array2[i] = cb2.checked;
					if (cb2.checked) {
						zero.cb2.checked = false;
					}
				});
				array1[i] = cb1.checked;
				array2[i] = cb2.checked;
				if (cbs1 !== false) {
					cbs1.push(cb1);
					cbs2.push(cb2);
				}
			}
			td1.appendChild(cb1);
			td1.appendChild(span1);
			td2.appendChild(cb2);
			td2.appendChild(span2);
			tr.appendChild(td1);
			tr.appendChild(td2);
			multchoice.appendChild(tr);
		}
	}

	const cbs3 = [];
	const cbs4 = [];
	const cbs5 = [];
	const cbs6 = [];
	const zero34 = {cb1: false, cb2: false};
	const zero56 = {cb1: false, cb2: false};
	
	buildMultChoice(
		$('#multchoice'), 
		false, false,
		false, 
		game.multChoice1, game.multChoice2, 
		'Num 1', 'Num 2');
	buildMultChoice(
		$('#multchoice-num1'), 
		cbs3, cbs4,
		zero34,
		game.multChoice3, game.multChoice4, 
		'Num 1 *' + String.fromCharCode(0x5501) + String.fromCharCode(0x5500),
		'Num 1 *' + String.fromCharCode(0x5501));
	buildMultChoice(
		$('#multchoice-num2'), 
		cbs5, cbs6,
		zero56,
		game.multChoice5, game.multChoice6,
		'Num 2 *' + String.fromCharCode(0x5501) + String.fromCharCode(0x5500),
		'Num 2 *' + String.fromCharCode(0x5501));

	if ($('#mult-two-digits').checked) {
		$('#multchoice-num1').style.display = 'inline-block';
		$('#multchoice-num2').style.display = 'inline-block';
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
