
import {numToHunString} from './util.js';
export {Game};

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
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

class Cloud {
	constructor(game, center) {
		this.center = center.clone();
		this.game = game;
		this.speed = game.speed;
		this.radius = game.CLOUD_RAD;
		this.colors = ['#cce', '#ddf', '#eef', '#fff', '#fff'];
		this.makeParts();
		this.makeQuestion();
		this.answer = 0;
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
		ctx.strokeRect(this.center.x+stats.width/2-20, this.center.y-30, 80, 60);
		if (this.answer != 0) {
			ctx.fillStyle = '#f00';
			ctx.fillText(numToHunString(this.answer), this.center.x+stats.width/2-15, this.center.y);
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
		this.answer = [];
		this.selectedCloud = null;
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
			this.selectedCloud = this.clouds.at(-1);
		}
	}

	addListeners() {
		this.canvas.addEventListener('keydown', e => {
			for (let i=0; i<10; i++) {
				if (e.key === i.toString()) {
					this.answer.push(i);
				}
			}
			if (e.key === 'Backspace') {
				this.answer.splice(this.answer.length-1, 1);
			}
			// Check answer
			const answerCopy = this.answer.slice(0);
			answerCopy.reverse();
			let answer = 0;
			let power = 1;
			for (let i=0; i<answerCopy.length; i++) {
				answer += power*answerCopy[i];
				power *= 10;
			}
			// Draw answer
			this.selectedCloud.answer = answer;
			// Check answer	
			const trueAnswer = this.selectedCloud.num1 * this.selectedCloud.num2;
			if (e.key === 'Enter') {
				if (answer === trueAnswer) {
					this.answer = [];
					this.score += 1;
					const keepClouds = [];
					for (let i=0; i<this.clouds.length; i++) {
						if (this.clouds[i] == this.selectedCloud) {
							continue;
						}
						keepClouds.push(this.clouds[i]);
					}
					this.clouds = keepClouds;
					if (this.clouds.length == 0) {
						this.addCloud();
					}
				}
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
