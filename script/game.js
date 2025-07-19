
import {numToHunString} from './util.js';
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
	constructor(op, num1, num2, cloud, theta) {
		if (['plus', 'minus', 'times'].indexOf(op) == -1) {
			throw `Bad operation: ${op}`;
		}
		this.op = op;
		this.num1 = num1;
		this.num2 = num2;
		this.text = `${numToHunString(this.num1)}*${numToHunString(this.num2)} = `;
		this.cloud = cloud;
		this.theta = theta;
		this.dimensions = null;
	}

	get center() {
		const dx = 100*Math.cos(this.theta);
		const dy = 80*Math.sin(this.theta);
		return this.cloud.center.add(new Point(dx, dy));
	}

	click(p) {
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
			ctx.fillText(this.text, this.center.x-stats.width/2-20, this.center.y);
			ctx.lineWidth = 2;
			ctx.strokeRect(this.center.x+stats.width/2-60, this.center.y-20, 60, 40);
			if (this.answer) {
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
		this.speed = game.speed;
		this.radius = game.CLOUD_RAD;
		this.colors = ['#cce', '#ddf', '#eef', '#fff', '#fff'];
		this.makeParts();
		this.makeQuestion();
		this.showSubproblems = true;
		this.makeRoundedSubproblemParts();
	}

	click(p) {
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
		const ncolors = this.colors.length;
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
		if (this.answer) {
			ctx.fillStyle = '#f00';
			ctx.fillText(
				numToHunString(answerToNumber(this.answer)), 
				this.center.x+stats.width/2-15, 
				this.center.y);
		}
		if (this.showSubproblems && this.subproblems.length > 0) {
			this.subproblems.forEach(prob => prob.draw(ctx));
		}
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
		this.num1 = Math.floor(99*Math.random())+1;
		this.num2 = Math.floor(99*Math.random())+1;
		this.text = `${numToHunString(this.num1)}*${numToHunString(this.num2)} = `;
		console.log('Answer: ' + (this.num1*this.num2));
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
			this.subproblems.push(new Subproblem('times', num1, num2round, this, theta));
			this.subproblems.push(new Subproblem('times', num1, Math.abs(d2), this, theta+Math.PI));
			return;
		}
		this.subproblems.push(new Subproblem('times', num1round, num2, this, theta));
		this.subproblems.push(new Subproblem('times', Math.abs(d1), num2, this, theta+Math.PI));
	}

	tick() {
		this.center.y += this.speed;
		this.parts.forEach(part => {
			part.y += this.speed;
		});
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
		const MAX_TRIES = 10;
		let madeCloud = false;
		outer:
		for (let i=0; i<MAX_TRIES; i++) {
			const x = this.CLOUD_PAD + Math.floor(Math.random()*(this.width-2*this.CLOUD_PAD));
			const y = 100;
			const center = new Point(x,y);
			for (let j=0; j<this.clouds.length; j++) {
				const cloud = this.clouds[j];
				if (cloud.center.dist(center) < (this.CLOUD_RAD*2)) {
					continue outer;
				}
			}
			const cloud = new Cloud(this, center);
			this.clouds.push(cloud);
			madeCloud = true;
			break;
		}
		if (!madeCloud) {
			console.log('Failed to make cloud');
		} else {
			this.attempted += 1;
		}
	}

	addListeners() {
		this.canvas.addEventListener('keydown', e => {
			if (!this.selected) {
				return;
			}
			if (!this.selected.answer) {
				this.selected.answer = [];
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
			const trueAnswer = this.selected.num1 * this.selected.num2;
			if (answerToNumber(this.selected.answer) === trueAnswer) {
				if (this.selected instanceof Subproblem) {
					this.selected.solved = true;
					this.score += 0.3;
				} else {
					this.selected.subproblems.forEach(sub => {
						if (sub.solved) {
							this.score -= 0.3;
						}
					});
					this.score += 1;
				}
				const keepClouds = [];
				for (let i=0; i<this.clouds.length; i++) {
					if (this.clouds[i] == this.selected) {
						continue;
					}
					keepClouds.push(this.clouds[i]);
				}
				this.clouds = keepClouds;
				if (this.clouds.length == 0) {
					this.addCloud();
				}
			}
		});
		this.canvas.addEventListener('click', e => {
			const p = new Point(e.offsetX, e.offsetY);
			console.log(p);
			this.clouds.forEach(c => c.click(p));
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
		loadImage(this.images, 'background', '/image/background.png');
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
		if (this.images['background']) {
			const scale = this.images['background'].width / this.canvas.width / 2;
			const height = this.images['background'].height * scale;
			const y = this.canvas.height - height;
			ctx.drawImage(this.images['background'], 0, y, this.canvas.width, height);
		}
		for (let i=0; i<this.clouds.length; i++) {
			this.clouds[i].draw(ctx);
		}
		// Draw score
		ctx.fillStyle = '#eef';
		ctx.fillRect(10, 10, this.canvas.width-20, 40);
		ctx.strokeRect(10, 10, this.canvas.width-20, 40);
		ctx.font = '24px HunimalSans';
		ctx.fillStyle = '#000';
		ctx.textBaseline = 'middle';
		ctx.fillText(`Score: ${this.score}`, 20, 30);    
		ctx.fillText(`Attempted: ${this.attempted}`, 300, 30);
		ctx.fillText(`Level: ${this.level}`, 650, 30);
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
		const keep = [];
		for (let i=0; i<this.clouds.length; i++) {
			const cloud = this.clouds[i];
			cloud.tick();
			if (cloud.center.y + cloud.radius > this.height) {
				continue;
			}
			keep.push(cloud);
		}
		this.clouds = keep;
	}
}
