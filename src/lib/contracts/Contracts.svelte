<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import EveStore from '$lib/EveStore.svelte';

	Chart.register(...registerables);

	let countChart: HTMLCanvasElement;
	let acceptanceChart: HTMLCanvasElement;
	let iskChart: HTMLCanvasElement;

	interface ContractStat {
		date: number;
		averageDuration: number;
		iskPaid: number;
		volume: number;
		count: number;
	}

	function newChart(props: {
		canvas: HTMLCanvasElement,
		labels: string[],
		data: number[],
		color: string,
		isAcceptance?: boolean
	}) {

		const datasets: any[] = [{
			data: props.data,
			fill: false,
			borderColor: props.color,
			tension: 0.2
		}];

		if (props.isAcceptance) {
			datasets.push({
				data: props.data.map(() => 1),
				fill: true,
				borderColor: 'rgba(1,222,123,0.42)',
				tension: 0,
				pointRadius: 0,
				borderDash: [5, 5]
			});
		}

		new Chart(props.canvas.getContext('2d')!, {
			type: 'line',
			data: {
				labels: props.labels,
				datasets
			},
			options: {
				elements: {
					point: {
						radius: 5
					}
				},
				plugins: {
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	onMount(async () => {

		const response = await fetch('/contracts.json');
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		const raw: ContractStat[] = (await response.json()).sort((a: ContractStat, b: ContractStat) => new Date(a.date).getTime() - new Date(b.date).getTime());

		const labels = [];
		const acceptance = [];
		const isk = [];
		const count = [];

		for (const r of raw) {
			const date = new Date(r.date);
			labels.push(date.toLocaleDateString());
			acceptance.push(+(r.averageDuration / 60 / 60).toFixed(1));
			isk.push(Math.floor(r.iskPaid / 1_000_000_000));
			count.push(r.count);
		}

		newChart({
			canvas: countChart,
			labels,
			data: count,
			color: 'rgba(1,244,212,1)'
		});

		newChart({
			canvas: acceptanceChart,
			labels,
			data: acceptance,
			color: 'rgba(1,222,123,1)',
			isAcceptance: true
		});

		newChart({
			canvas: iskChart,
			labels,
			data: isk,
			color: 'rgba(254,255,47,1)'
		});
	});
</script>

<div class="flex flex-row gap-16">
	<div class="basis-2/3">
		<h1 class="text-2xl font-bold mb-4">Contract Stats</h1>

		<p class="mb-4">This page shows information about the contracts that we accept.</p>
		<p class="mb-4">We display the number of contracts, the average time we need to accept them, and how much ISK we're paying out.</p>
		<p class="mb-8">The data is updated manually from time to time.</p>
	</div>
	<div class="basis-1/3">
		<EveStore compact={true} />
	</div>
</div>

<h2 class="text-xl my-4">Contracts accepted per day</h2>
<canvas class="mb-8" bind:this={countChart} width={400} height={50} />
<h2 class="text-xl my-4">Average time to accept contracts in hours</h2>
<p class="mb-4">The dotted line shows our 1 hour goal.</p>
<canvas class="mb-8" bind:this={acceptanceChart} width={400} height={50} />
<h2 class="text-xl my-4">ISK paid out per day in billions</h2>
<canvas class="mb-8" bind:this={iskChart} width={400} height={50} />