
import {$, numToHunString} from './util.js';
import {Sounds} from './sounds.js';
export {Point, Game};

function answerToNumber(arr) {
	const answerCopy = arr.slice(0);
	answerCopy.reverse();
	let answer = 0;
	let power = 1;
	for (let i=0; i<answerCopy.length; i++) {
		answer += power*answerCopy[i];
		power *= 10;
	}
	return answer;
}

function getCheckedOps() {
	const addChecked = $('#addCb').checked;
	const subChecked = $('#subCb').checked;
	const multChecked = $('#multCb').checked;
	const divChecked = $('#divCb').checked;
	const ops = [];
	if (addChecked) {
		ops.push('add');
	}
	if (subChecked) {
		ops.push('sub');
	}
	if (multChecked) {
		ops.push('mult');
	}
	if (divChecked) {
		ops.push('div');
	}
	return ops;
}

class Rect {
	constructor(topLeft, dims) {
		this.topLeft = topLeft;
		this.dims = dims;
	}

	contains(p) {
		const inx = p.x >= this.topLeft.x && p.x <= (this.topLeft.x + this.dims.x);
		const iny = p.y >= this.topLeft.y && p.y <= (this.topLeft.y + this.dims.y);
		return inx && iny;
	}
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(p) {
		return new Point(this.x + p.x, this.y + p.y);
	}

	clone() {
		return new Point(this.x, this.y);
	}

	dist(p) {
		const dx = p.x-this.x;
		const dy = p.y-this.y;
		return Math.sqrt(dx*dx+dy*dy);
	}
}

class Subproblem {
	constructor(op, num1, num2, cloud, theta, overtext) {
		if (['add', 'sub', 'mult', 'div'].indexOf(op) == -1) {
			throw `Bad operation: ${op}`;
		}
		this.op = op;
		this.num1 = num1;
		this.num2 = num2;
		let textop = '*';
		switch (this.op) {
			case 'add': textop = '+'; break;
			case 'sub': textop = '-'; break;
			case 'mul': textop = '*'; break;
			case 'div': textop = '/'; break;
		}
		this.text = `${numToHunString(this.num1)}${textop}${numToHunString(this.num2)} = `;
		if (overtext) {
			this.text = overtext;
		}
		this.cloud = cloud;
		this.theta = theta;
		this.dimensions = null;
	}

	get center() {
		const dx = 120*Math.cos(this.theta);
		const dy = 80*Math.sin(this.theta);
		return this.cloud.center.add(new Point(dx, dy));
	}

	click(p) {
		if (p == true) {
			this.cloud.game.selected = this;
			return;
		}
		if (this.solved) {
			return;
		}
		const rect = new Rect(
			new Point(
				this.center.x - this.dimensions.x/2, 
				this.center.y - this.dimensions.y/2
			),
			new Point(
				this.dimensions.x,
				this.dimensions.y));
		if (rect.contains(p)) {
			return true;
		}
	}

	draw(ctx) {
		if (this.cloud.solved && !this.answer) {
			return;
		}
		ctx.font = '38px HunimalSans';
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		const stats = ctx.measureText(this.text);
		if (this.dimensions == null) {
			this.dimensions = new Point(stats.width+40, 40);
		}
		if (!this.solved && this.cloud.game.selected != this) {
			ctx.strokeStyle = '#aaa';
			ctx.lineWidth = 5;
			ctx.lineJoin = 'bevel';
			ctx.strokeRect(
				this.center.x-this.dimensions.x/2, 
				this.center.y-this.dimensions.y/2, 
				this.dimensions.x,
				this.dimensions.y);
			ctx.fillStyle = '#33b';
			ctx.fillRect(
				this.center.x-this.dimensions.x/2, 
				this.center.y-this.dimensions.y/2, 
				this.dimensions.x,
				this.dimensions.y);
			ctx.fillStyle = '#33b';
			ctx.fillStyle = "#fff";
			ctx.font = "18px HunimalSans";
			const stats2 = ctx.measureText("Subproblem");
			ctx.fillText("Subproblem", this.center.x-stats2.width/2, this.center.y);
		} else {
			ctx.fillStyle = "#000";
			ctx.font = "24px HunimalSans";
			if (this.text[0] == 'F') {
				ctx.fillText(this.text, this.center.x-stats.width/2+20, this.center.y);
			} else {
				ctx.fillText(this.text, this.center.x-stats.width/2-20, this.center.y);
			}
			ctx.lineWidth = 2;
			ctx.strokeRect(this.center.x+stats.width/2-60, this.center.y-20, 60, 40);
			if (this.answer && this.answer.length > 0) {
				ctx.fillStyle = '#f00';
				if (this.solved) {
					ctx.fillStyle = '#0c0';
				}
				ctx.fillText(
					numToHunString(answerToNumber(this.answer)), 
					this.center.x+stats.width/2-55, 
					this.center.y);
			}
		}
	}
}

class Cloud {
	constructor(game, center) {
		this.center = center.clone();
		this.game = game;
		this.radius = game.CLOUD_RAD;
		this.colors = ['#cce', '#ddf', '#eef', '#fff', '#fff'];
		this.makeParts();
		this.makeQuestion();
		if (this.op == 'mult') {
			this.showSubproblems = true;
			this.makeRoundedSubproblemParts();
		} else if (this.op == 'div') {
			this.showSubproblems = true;
			this.makeDivSubproblemParts();
		} else {
			this.showSubproblems = false;
			this.subproblems = [];
		}
	}

	click(p) {
		if (p == true) {
			this.game.selected = this;
			return;
		}
		if (this.center.dist(p) < 1.5*this.radius) {
			for (let i=0; i<this.subproblems.length; i++) {
				const inside = this.subproblems[i].click(p);
				if (inside) {
					this.game.selected = this.subproblems[i];
					return true;
				}
			}
			this.game.selected = this;
			return true;
		}
		return false;
	}

	draw(ctx) {
		if (this.solved) {
			ctx.globalAlpha = 0.3;
		}
		const ncolors = this.colors.length;
		if (this.game.selected == this) {
			ctx.fillStyle = '#f00';
			for (let i=0; i<this.parts.length; i++) {
				const part = this.parts[i];
				ctx.beginPath();
				ctx.arc(part.x, part.y, this.radius+2, 0, 2*Math.PI);
				ctx.fill();
			}
		}
		for (let j=0; j<ncolors; j++) {
			ctx.fillStyle = this.colors[j];
			for (let i=0; i<this.parts.length; i++) {
				const part = this.parts[i];
				ctx.beginPath();
				ctx.arc(part.x, part.y, this.radius*(ncolors-j)/ncolors, 0, 2*Math.PI);
				ctx.fill();
			}
		}
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(this.center.x, this.center.y, 50, 0, 2*Math.PI);
		ctx.fill();
		ctx.font = '38px HunimalSans';
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		const stats = ctx.measureText(this.text);
		ctx.fillText(this.text, this.center.x-stats.width/2-20, this.center.y);
		ctx.strokeStyle = '#aaa';
		ctx.lineWidth = 5;
		ctx.lineJoin = 'bevel';
		ctx.strokeRect(this.center.x+stats.width/2-20, this.center.y-30, 80, 60);
		if (this.answer && this.answer.length > 0) {
			ctx.fillStyle = '#f00';
			if (this.solved) {
				ctx.fillStyle = "#0c0";
			}
			ctx.fillText(
				numToHunString(answerToNumber(this.answer)), 
				this.center.x+stats.width/2-15, 
				this.center.y);
		}
		if (this.showSubproblems && this.subproblems.length > 0) {
			this.subproblems.forEach(prob => prob.draw(ctx));
		}
		ctx.globalAlpha = 1;
	}

	makeParts() {
		this.parts = [];
		const NPARTS = 6;
		for (let i=0; i<NPARTS; i++) {
			const d = 40+Math.floor(50*Math.random());
			const theta = 2*Math.PI*i/NPARTS;
			const x = this.center.x + d*Math.cos(theta);
			const y = this.center.y + d*Math.sin(theta)/2;
			this.parts.push(new Point(x, y));
		}
	}

	makeQuestion() {
		const ops = getCheckedOps();
		this.op = ops[Math.floor(ops.length*Math.random())];
		this.num1 = Math.floor(99*Math.random())+1;
		this.num2 = Math.floor(99*Math.random())+1;
		let opString = '*';
		let ans = this.num1*this.num2;
		switch (this.op) {
			case 'add': 
				this.num1 = Math.floor(5000*Math.random())+1;
				this.num2 = Math.floor(5000*Math.random())+1;
				opString = '+';
				ans = this.num1+this.num2;
				break;
			case 'sub':
				this.num1 = Math.floor(9999*Math.random())+1;
				this.num2 = Math.floor(this.num1*Math.random())+1;
				opString = '-';
				ans = this.num1-this.num2;
				break;
			case 'div':
				ans = Math.floor(100*Math.random())+1;
				this.num2 = Math.floor(100*Math.random())+1;
				this.num1 = ans*this.num2;
				opString = '/';
				break;
		}
		this.text = `${numToHunString(this.num1)}${opString}${numToHunString(this.num2)} = `;
		console.log('Answer: ' + ans);
	}

	makeRoundedSubproblemParts() {
		let num1round = Math.round(this.num1/10)*10;
		let num2round = Math.round(this.num2/10)*10;
		let d1 = num1round === 0 ? 1000 : num1round-this.num1;
		let d2 = num2round === 0 ? 1000 : num2round-this.num2;
		let num1 = this.num1;
		let num2 = this.num2;
		this.subproblems = [];
		const theta = Math.PI/4+Math.random()*Math.PI/2;
		if (Math.abs(d1) > Math.abs(d2)) {
			num1round = num2round;
			d1 = d2;
			num2 = num1;
		}
		if (d1 == 0) {
			// Too easy
			this.subproblems.push(new Subproblem('mult', num1, num2round, this, theta));
			this.subproblems.push(new Subproblem('mult', num1, Math.abs(d2), this, theta+Math.PI));
			return;
		}
		this.subproblems.push(new Subproblem('mult', num1round, num2, this, theta));
		this.subproblems.push(new Subproblem('mult', Math.abs(d1), num2, this, theta+Math.PI));
	}

	makeDivSubproblemParts() {
		this.subproblems = [];
		let num1sig = Math.floor(this.num1/100);
		let num1round = num1sig * 100;
		if (num1sig / this.num2 < 1) {
			num1sig = Math.floor(this.num1/10);
			num1round = num1sig * 10;
		}
		// Too easy
		if (num1sig / this.num2 < 1) {
			return;
		}
		const ans = Math.floor(num1sig / this.num2);
		const theta = Math.PI/4+Math.random()*Math.PI/2;
		this.subproblems.push(new Subproblem('div', num1sig, this.num2, this, theta, 
			`Floor(${numToHunString(num1sig)}/${numToHunString(this.num2)})=`));
		// Assume num1/num2 always integer
		if (this.num1 / this.num2 > 9) {
			this.subproblems.at(-1).cb = _ => {
				this.subproblems.push(new Subproblem('mult', this.num2, 10*ans, this, theta+3/4*Math.PI));
				if ((this.num2 * 10 * ans) != this.num1) {
					this.subproblems.at(-1).cb = _ => {
						this.subproblems.push(new Subproblem('sub', this.num1, this.num2*10*ans, this,
							theta+5/4*Math.PI));
					}
				}
			}
		}
	}

	tick() {
		this.center.y += this.game.speed;
		this.parts.forEach(part => {
			part.y += this.game.speed;
		});
	}
}

class Raindrop {
	constructor(game) {
		const x = Math.floor(game.canvas.width*Math.random());
		this.pos = new Point(x, 0);
		this.game = game;
		this.length = Math.floor(5+15*Math.random());
		this.speed = 8+5*Math.random();
		const colors = ['#448', '#339', '#44b', '#22a'];
		this.color = colors[Math.floor(4*Math.random())];
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x, this.pos.y, 1, this.length);
	}

	tick() {
		this.pos.y += this.speed;
	}
}

		
class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.clouds = [];
		this.prev = 0;
		this.FPS = 30;
		this.CLOUD_RAD = 100;
		this.CLOUD_PAD = 200;
		this.running = false;
		this.loadImages();
		this.score = 0;
		this.attempted = 0;
		this.speed = 0.1;
		this.lives = 5;
		this.tickCount = 0;
		this.raindrops = [];
		this.sounds = new Sounds();
		this.sounds.loadMusic('1', './sound/Arithmetic1.mp3');
		this.sounds.loadMusic('2', './sound/Arithmetic2.mp3');
		this.sounds.loadMusic('3', './sound/Arithmetic3.mp3');
		this.sounds.loadMusic('4', './sound/Arithmetic4.mp3');
		this.sounds.loadMusic('5', './sound/Arithmetic5.mp3');
		this.started = false;
		this.currentMusic = 1;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	get level() {
		return Math.round(this.speed*10);
	}

	addCloud() {
		if (this.cloudAddTimeoutSet) {
			return;
		}
		if (getCheckedOps().length == 0) {
			this.cloudAddTimeoutSet = true;
			setTimeout(e => {
				this.cloudAddTimeoutSet = false;
				let updateSel = true;
				for (let i=0; i<this.clouds.length; i++) {
					if (!this.clouds[i].solved) {
						updateSel = false;
						break;
					}
				}
				this.addCloud();
				if (updateSel) {
					this.selected = this.clouds.at(-1);
				}
			}, 1000);
			return;
		}
		const centers = [];
		const dists = [];
		const w = this.width-2*this.CLOUD_PAD;
		if (this.clouds.length == 0) {
			const x = this.CLOUD_PAD + Math.floor(Math.random()*w);
			const y = 100;
			const center = new Point(x,y);
			const cloud = new Cloud(this, center);
			this.clouds.push(cloud);
			this.attempted += 1;
			return;
		}
		for (let i=0; i<10; i++) {
			centers.push(new Point(this.CLOUD_PAD + i/10*w, 100));
			dists.push(1000);
			this.clouds.forEach(cloud => {
				const d = centers.at(-1).dist(cloud.center);
				if (d < dists.at(-1)) {
					dists[dists.length-1] = d;
				}
			});
		}
		let maxidx = 0;
		for (let i=0; i<dists.length; i++) {
			if (dists[i] > dists[maxidx]) {
				maxidx = i;
			}
		}
		const center = centers[maxidx];
		const cloud = new Cloud(this, center);
		this.clouds.push(cloud);
		this.attempted += 1;
	}

	addListeners() {
		this.canvas.addEventListener('keydown', e => {
			if (!this.selected) {
				return;
			}
			if (!this.selected.answer) {
				this.selected.answer = [];
			}
			if (this.selected.solved) {
				return;
			}
			for (let i=0; i<10; i++) {
				if (e.key === i.toString()) {
					this.selected.answer.push(i);
				}
			}
			if (e.key === 'Backspace') {
				this.selected.answer.splice(this.selected.answer.length-1, 1);
			}
			// Check answer	
			let trueAnswer = this.selected.num1 * this.selected.num2;
			switch (this.selected.op) {
				case 'add': trueAnswer = this.selected.num1 + this.selected.num2; break;
				case 'sub': trueAnswer = this.selected.num1 - this.selected.num2; break;
				case 'div': trueAnswer = Math.floor(this.selected.num1 / this.selected.num2); break;
			}
			if (answerToNumber(this.selected.answer) === trueAnswer) {
				if (this.selected instanceof Subproblem) {
					this.score += 0.3;
					this.selected.solved = true;
					// Make second, third, etc. subproblem
					if (this.selected.cb) {
						this.selected.cb();
					}
					if (!this.selected.cloud.subproblems.at(-1).sovled) {
						this.selected.cloud.subproblems.at(-1).click(true);
					} else {
						this.selected.cloud.click(true);
					}
				} else {
					let solvedSubproblem = false;
					this.selected.subproblems.forEach(sub => {
						if (sub.solved) {
							this.score -= 0.3;
							solvedSubproblem = true;
						}
					});
					if (solvedSubproblem) {
						this.score += 0.9;
					} else {
						this.score += 1;
					}
					this.selected.solved = true;
					// Check if all clouds have been solved
					let allSolved = true;
					let unsolved = null;
					for (let i=0; i<this.clouds.length; i++) {
						if (!this.clouds[i].solved) {
							allSolved = false;
							unsolved = this.clouds[i];
							break;
						}
					}
					if (allSolved) {
						this.addCloud();
					}
					if (unsolved != null) {
						this.selected = unsolved;
					} else {
						this.selected = this.clouds.at(-1);
					}
				}
			}
		});
		this.canvas.addEventListener('click', e => {
			const p = new Point(e.offsetX, e.offsetY);
			if (!this.started) {
				this.started = true;
				this.sounds.playMusic(this.currentMusic.toString());
				this.selected = this.clouds.at(-1);
				return;
			}
			this.clouds.forEach(c => c.click(p));
		});
		$('#changeMusic').addEventListener('click', e => {
			e.preventDefault();
			this.musicPaused = false;
			this.currentMusic = (this.currentMusic+1)%5+1;
			this.sounds.playMusic(this.currentMusic.toString());
			$('#stopMusic').innerHTML = 'Stop Music';
		});
		$('#stopMusic').addEventListener('click', e => {
			e.preventDefault();
			if (this.musicPaused) {
				this.sounds.playMusic(this.currentMusic.toString());
				this.musicPaused = false;
				$('#stopMusic').innerHTML = 'Stop Music';
			} else {
				this.sounds.stopMusic(this.currentMusic.toString());
				this.musicPaused = true;
				$('#stopMusic').innerHTML = 'Play Music';
			}
		});

	}

	loadImages() {
		this.images = {};
		function loadImage(images, name, url) {
			const img = new Image();
			img.src = url;
			img.addEventListener('load', e => {
				images[name] = img;
			});
		}
		loadImage(this.images, 'background', './image/background2.png');
		loadImage(this.images, 'heart', './image/heart.png');
	}

	loop(now) {
		if (!this.running) {
			this.tick();
			this.repaint();
			return;
		}
		if ((this.prev === 0) || (now > (this.prev + 1000/this.FPS))) {
			this.prev = now;
			this.tick();
			this.repaint();
		}
		requestAnimationFrame(next => this.loop(next));
	}

	repaint() {
		const ctx = this.canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, this.width, this.height);
		if (this.lives <= 0 || !this.started) {
			ctx.globalAlpha = 0.3;
			this.selected = null;
		}
		// Draw everything after background
		if (this.images['background']) {
			/*const scale = this.images['background'].width / this.canvas.width / 2;
			const height = this.images['background'].height * scale;
			const y = this.canvas.height - height;
			ctx.drawImage(this.images['background'], 0, y, this.canvas.width, height);*/
			ctx.drawImage(this.images['background'], 0, 0, this.canvas.width, this.canvas.height);
		}
		this.raindrops.forEach(rain => rain.draw(ctx));
		for (let i=0; i<this.clouds.length; i++) {
			this.clouds[i].draw(ctx);
		}
		ctx.globalAlpha = 1;
		// Draw score
		ctx.fillStyle = '#eef';
		ctx.fillRect(10, 10, this.canvas.width-20, 40);
		ctx.strokeRect(10, 10, this.canvas.width-20, 40);
		ctx.font = '24px HunimalSans';
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		ctx.fillText(`Score: ${this.score.toFixed(1)}`, 20, 30);    
		ctx.fillText(`Attempted: ${this.attempted}`, 300, 30);
		ctx.fillText(`Level: ${this.level}`, 650, 30);
		if (this.images['heart']) {
			for (let i=0; i<this.lives; i++) {
				ctx.drawImage(this.images['heart'], this.canvas.width-40-40*i, 60, 30, 30);
			}
		}
		if (!this.started) {
			ctx.font = '88px HunimalSans';
			ctx.fillText('Click to Start', 120, 300);
		}
		if (this.lives <= 0) {
			ctx.font = '88px HunimalSans';
			ctx.fillText('Game Over!', 150, 300);
		}
	}

	start() {
		this.running = true;
		requestAnimationFrame(next => this.loop(next));
		this.addListeners();
		this.canvas.focus();
	}

	stop() {
		this.running = false;
	}

	tick() {
		this.tickCount += 1;
		if (this.tickCount % 1 == 0) {
			this.raindrops.push(new Raindrop(this));
			this.raindrops.push(new Raindrop(this));
		}
		const keepRaindrops = [];
		for (let i=0; i<this.raindrops.length; i++) {
			this.raindrops[i].tick();
			if (this.raindrops[i].pos.y > this.canvas.height) {
				continue;
			}
			keepRaindrops.push(this.raindrops[i]);
		}
		this.raindrops = keepRaindrops;
		const keep = [];
		let updateSelected = false;
		for (let i=0; i<this.clouds.length; i++) {
			const cloud = this.clouds[i];
			if (this.lives > 0) {
				cloud.tick();
			}
			if (cloud.center.y + cloud.radius > this.height) {
				if (!cloud.solved) {
					this.lives -= 1;
					for (let j=0; j<cloud.subproblems.length; j++) {
						if (this.selected == cloud.subproblems[j]) {
							updateSelected = true;
						}
					}
					if (this.selected = cloud) {
						updateSelected = true;
					}
				}
				continue;
			}
			keep.push(cloud);
		}
		this.clouds = keep;
		if (this.lives <= 0) {
			return;
		}
		// Add clouds
		let addCloud = true;
		for (let i=0; i<this.clouds.length; i++) {
			if (this.clouds[i].center.y < 300) {
				addCloud = false;
				break;
			}
		}
		if (addCloud) {
			this.addCloud();
		}
		// Increase level
		if (this.score.toFixed(1) >= 5*this.level) {
			this.speed += 0.1;
			// Change music
			this.currentMusic = ((this.currentMusic+1) % 5) + 1
			this.sounds.playMusic(this.currentMusic.toString());
		}
		if (updateSelected) {
			for (let i=0; i<this.clouds.length; i++) {
				if (!this.clouds[i].solved) {
					this.selected = this.clouds[i];
					break;
				}
			}
		}
	}
}
