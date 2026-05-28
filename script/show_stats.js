const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)];

window.addEventListener('load', e => {
	const ops = ["add", "sub", "mult", "div"];

	function mean(arr) {
		if (arr.length == 0) {
			return 0;
		}
		let sum = 0;
		for (let i=0; i<arr.length; i++) {
			sum += arr[i];
		}
		return sum / arr.length;
	}

	function std(arr) {
		const m = mean(arr);
		let sumOfSquares = 0;
		for (let i=0; i<arr.length; i++) {
			const v = arr[i] - m;
			sumOfSquares += v*v;
		}
		return Math.sqrt(sumOfSquares/arr.length);
	}

	function createChartAndUI(json) {
		const cookie = json.cookie_value;
		const now = json.now;
		const times = json.times;

		const myBins = {add: [], sub: [], mult: [], div: []};
		const bins = {add: [], sub: [], mult: [], div: []};

		for (let i=0; i<times.length; i++) {
			if (times[i].cookie_id == cookie) {
				myBins[times[i].op].push(times[i].time_seconds);
			} else {
				bins[times[i].op].push(times[i].time_seconds);
			}
		}
		
		const myData = [];
		const data = [];

		ops.forEach(op => {
			myData.push(mean(myBins[op]));
			data.push(mean(bins[op]));
		});

		new Chart("op-times-canvas", {
			type: "bar",
			data: {
				labels: ops,
				datasets: [
					{
						label: "All User Times",
						data: data,
						backgroundColor: 'red',
					},
					{
						label: "My Times",
						data: myData,
						backgroundColor: 'blue',
					},
				],
			},
			options: {
				title: {
					text: 'Time to Answer Questions',
					display: true,
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Seconds',
						},
					},
				},
			},
		});
	}

	fetch('get_stats.php')
	.then(resp => resp.json())
	.then(json => createChartAndUI(json))
	.catch(err => console.log("Error: ", err));
});
