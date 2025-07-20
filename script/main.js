import {$, $$} from './util.js';
import {Game} from './game.js';

window.addEventListener('load', e => {
	const canvas = $('#game-canvas');
	const game = new Game(canvas);
	game.addCloud();
	game.selected = game.clouds.at(-1);
	game.start();
});
