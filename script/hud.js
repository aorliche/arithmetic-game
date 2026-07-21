// Functions for drawing the hud
export {Label, Button, TextField, WeeklyChallengeScreen};

class Label {
	constructor(params) {
		this.text = params.text;
		this.font = params.font;
		this.x = params.x;
		this.y = params.y;
		this.color = params.color ?? 'white';
	}

	draw(ctx) {
		ctx.font = this.font;
		ctx.fillStyle = this.color;
		ctx.fillText(this.text, this.x, this.y);
	}
}

class Button {
	constructor(params) {
		this.label = params.label;
		this.labelColorSav = this.label.color;
		this.color = params.color;
		this.colorSav = this.color;
		this.x = params.x;
		this.y = params.y;
		this.w = params.w;
		this.h = params.h;
		this.onClick = params.onClick;
		this.hovering = false;
	}

	click(p) {
		if (p.x >= this.x &&
			p.x <= this.x + this.w &&
			p.y >= this.y &&
			p.y <= this.y + this.h) {
			this.onClick();
		}
	}

	mousemove(p) {
		if (p.x < this.x || 
			p.x > this.x + this.w || 
			p.y < this.y ||
			p.y > this.y + this.h) {
			if (this.hovering) {
				this.mouseout();
			}
		} else {
			this.label.color = this.colorSav;
			this.color = this.labelColorSav;
			this.hovering = true;
		}
	}

	mouseout(p) {
		this.label.color = this.labelColorSav;
		this.color = this.colorSav;
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.strokeStyle = this.label.color;
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		this.label.draw(ctx);
	}
}

class TextField {
	constructor(params) {
		this.onEnter = params.onEnter;
		this.color = params.color;
		this.bgColor = params.bgColor;
		this.font = params.font;
		this.x = params.x;
		this.y = params.y;
		this.w = params.w;
		this.h = params.h;
		this.tx = params.tx;
		this.ty = params.ty;
		this.onEnter = params.onEnter;
		this.text = '';
	}

	draw(ctx) {
		ctx.font = this.font;
		ctx.fillStyle = this.bgColor;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.lineWidth = 3;
		ctx.strokeStyle = this.color;
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.fillStyle = this.color;
		ctx.fillText(this.text, this.tx, this.ty);
	}

	keydown(e) {
		// Alphanumeric only
		if (e.key.length == 1) {
			this.text += e.key;
		}
		if (e.key == 'Enter') {
			this.onEnter();
		}
	}
}

class WeeklyChallengeScreen {
	constructor(params) {
		this.yes = params.yes;
		this.no = params.no;
		this.state = 'yes-no';
		this.label1 = new Label({
			text: 'Would you like to try the weekly challenge?',
			font: '36px HunimalSans',
			x: 40,
			y: 260,
			color: '#303',
		});
		this.buttonYes = new Button({
			label: new Label({
				text: 'Yes',
				font: '48px HunimalSans',
				x: 300,
				y: 350,
			}),
			color: '#303',
			x: 290,
			y: 300,
			w: 100,
			h: 70,
			onClick: () => {
				this.state = 'enter-name';
			},
		});
		this.buttonNo = new Button({
			label: new Label({
				text: 'No',
				font: '48px HunimalSans',
				x: 420,
				y: 350,
			}),
			color: '#303',
			x: 410,
			y: 300,
			w: 80,
			h: 70,
			onClick: () => {
				this.state = 'hidden';
				this.no();
			},
		});
		this.label2 = new Label({
			text: 'Type your name and hit enter:',
			font: '42px HunimalSans',
			x: 100,
			y: 260,
			color: '#303',
		});
		this.field = new TextField({
			font: '42px HunimalSans',
			x: 200,
			y: 300,
			w: 400,
			h: 70,
			tx: 215,
			ty: 350,
			color: '#303',
			bgColor: '#fff',
			onEnter: () => {
				this.state = 'hidden';
				this.yes();
			},
		});
	}

	click(p) {
		if (this.state == 'yes-no') {
			this.buttonYes.click(p);
			this.buttonNo.click(p);
		} 
	}

	draw(ctx) {
		if (this.state == 'hidden') {
			return;
		}
		ctx.save();
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#303';
		ctx.lineWidth = 3;
		ctx.globalAlpha = 0.4;
		ctx.fillRect(0, 200, 800, 200);
		ctx.globalAlpha = 1;
		ctx.strokeRect(0, 200, 800, 200);
		if (this.state == 'yes-no') {
			this.label1.draw(ctx);
			this.buttonYes.draw(ctx);
			this.buttonNo.draw(ctx);
		}
		if (this.state == 'enter-name') {
			this.label2.draw(ctx);
			this.field.draw(ctx);
		}
		ctx.restore();
	}

	keydown(e) {
		if (this.state == 'enter-name') {
			this.field.keydown(e);
		}
	}

	mousemove(p) {
		this.buttonYes.mousemove(p);
		this.buttonNo.mousemove(p);
	}

	mouseout() {
		this.buttonYes.mouseout();
		this.buttonNo.mouseout();
	}
}
