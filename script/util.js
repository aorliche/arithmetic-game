export {$, $$, circShift, drawText, numToHunString};

const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)];

function drawText(ctx, text, p, color, font, stroke) {
	ctx.save();
	if (font) ctx.font = font;
	const tm = ctx.measureText(text);
	ctx.fillStyle = color;
	if (p.ljust) 
		ctx.fillText(text, p.x, p.y);
	else if (p.rjust)
		ctx.fillText(text, p.x-tm.width, p.y);
	else
		ctx.fillText(text, p.x-tm.width/2, p.y);
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 1;
		ctx.strokeText(text, p.x-tm.width/2, p.y);
	}
	ctx.restore();
	return tm;
}

function circShift(arr, n) {
	n = n % arr.length;
	const narr = [];
	for (let i=0; i<arr.length; i++) {
		const j = (n + i)%arr.length;
		narr[i] = arr[j];
	}
	return narr;
}

function numToHunString(num) {
	if (num == 0) {
		return String.fromCharCode(0x5500);
	}
	const huns = [];
	while (num > 0) {
		const hun = num % 100;
		const tens = Math.floor(hun / 10);
		const digits = hun % 10;
		huns.push(String.fromCodePoint(0x5500 + 0x10*tens + digits));
		num = Math.floor(num/100);
	}
	return huns.reverse().join('');
}
