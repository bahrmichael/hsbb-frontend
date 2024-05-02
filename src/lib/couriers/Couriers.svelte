<script lang="ts">
	import { onMount } from 'svelte';
	import Filter from '$lib/couriers/Filter.svelte';
	import Markee from '$lib/Markee.svelte';

	type Courier = {
		volume: number;
		distance: number;
		collateral: number;
		reward: number;
	};

	let couriers: Courier[] = [];
	let filteredCouriers: Courier[] = [];

	type Filter = {
		min: number | null;
		max: number | null;
	};

	let distanceFilter: Filter = { min: null, max: null };
	let collateralFilter: Filter = { min: null, max: null };
	let rewardFilter: Filter = { min: null, max: null };
	let volumeFilter: Filter = { min: null, max: null };

	onMount(async () => {
		const response = await fetch('/couriers.json');
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		couriers = (await response.json()).map((c: any) => {
			return {
				volume: c.v,
				distance: c.d,
				collateral: c.c,
				reward: c.r
			};
		});
	});

	function filterValue(filter: Filter, value: number) {
		return (filter.min === null || value >= filter.min) &&
			(filter.max === null || value <= filter.max);
	}

	let distanceFilteredCount = 0;
	let collateralFilteredCount = 0;
	let rewardFilteredCount = 0;
	let volumeFilteredCount = 0;

	let sortField: 'distance' | 'collateral' | 'volume' | 'reward' = 'distance';
	let isSortAscending = true;

	$: distanceFilteredCount = couriers.filter(courier => filterValue(distanceFilter, courier.distance)).length;
	$: collateralFilteredCount = couriers.filter(courier => filterValue(collateralFilter, courier.collateral)).length;
	$: rewardFilteredCount = couriers.filter(courier => filterValue(rewardFilter, courier.reward)).length;
	$: volumeFilteredCount = couriers.filter(courier => filterValue(volumeFilter, courier.volume)).length;

	$: filteredCouriers = couriers.filter(courier => {
		const distanceValid = filterValue(distanceFilter, courier.distance);
		const collateralValid = filterValue(collateralFilter, courier.collateral);
		const rewardValid = filterValue(rewardFilter, courier.reward);
		const volumeValid = filterValue(volumeFilter, courier.volume);
		return distanceValid && collateralValid && rewardValid && volumeValid;
	})
		.sort((a, b) => isSortAscending ? a[sortField] - b[sortField] : b[sortField] - a[sortField])
		.slice(0, 100);

	$: filteredCount = filteredCouriers.length >= 100 ? '99+' : filteredCouriers.length;

	function flipSort(field: typeof sortField) {
		if (sortField === field) {
			isSortAscending = !isSortAscending;
		} else {
			sortField = field;
			isSortAscending = true;
		}
	}
</script>

<div class="flex flex-row gap-16 mb-8">
	<div class="basis-2/3">
		<h1 class="text-xl font-bold mb-4">HSBB Courier Stats</h1>
		<p class="mb-4">Here we show you the public couriers we created, and were delivered successfully. You can use the filters on the left to drill down. Use the data to find an appropriate price for your own couriers.</p>
		<p>We update the data irregularly. Right now there are {couriers.length} couriers in the database.</p>
	</div>
	<div class="basis-1/3">
		<Markee compact={true} />
	</div>
</div>

<div class="flex">
	<div class="flex-1">
		<h2 class="text-lg font-bold">Filters</h2>
		<Filter bind:filter={volumeFilter} label="Volume" resultCount={volumeFilteredCount}>
				<span class="flex justify-left gap-2 items-center">
					<button on:click={() => volumeFilter = { min: 0, max: 12_250 }} class="btn">Small</button>
					<button on:click={() => volumeFilter = { min: 12_251, max: 62_500 }} class="btn">Medium</button>
					<button on:click={() => volumeFilter = { min: 62_501, max: null }} class="btn">Large</button>
					<button on:click={() => volumeFilter = { min: null, max: null }} class="btn btn-ghost">Reset</button>
				</span>
		</Filter>
		<Filter bind:filter={distanceFilter} label="Distance" resultCount={distanceFilteredCount}>
				<span class="flex justify-left gap-2 items-center">
					<button on:click={() => distanceFilter = { min: 0, max: 15 }} class="btn">0-15</button>
					<button on:click={() => distanceFilter = { min: 15, max: 30 }} class="btn">15-30</button>
					<button on:click={() => distanceFilter = { min: 30, max: 50 }} class="btn">30-50</button>
					<button on:click={() => distanceFilter = { min: 50, max: null }} class="btn">50+</button>
					<button on:click={() => distanceFilter = { min: null, max: null }} class="btn btn-ghost">Reset</button>
				</span>
		</Filter>
		<Filter bind:filter={collateralFilter} label="Collateral" resultCount={collateralFilteredCount}>
				<span class="flex justify-left gap-2 items-center">
					<button on:click={() => collateralFilter = { min: 0, max: 500_000_000 }} class="btn">&lt;500m</button>
					<button on:click={() => collateralFilter = { min: 500_000_000, max: 1_500_000_000 }}
									class="btn">500m-1.5b</button>
					<button on:click={() => collateralFilter = { min: 1_500_000_000, max: 3_000_000_000 }}
									class="btn">1.5b-3b</button>
					<button on:click={() => collateralFilter = { min: 3_000_000_000, max: null }} class="btn">3b+</button>
					<button on:click={() => collateralFilter = { min: null, max: null }} class="btn btn-ghost">Reset</button>
				</span>
		</Filter>
		<Filter bind:filter={rewardFilter} label="Reward" resultCount={rewardFilteredCount}>
				<span class="flex justify-left gap-2 items-center">
					<button on:click={() => rewardFilter = { min: 0, max: 15_000_000 }} class="btn">0-15m</button>
					<button on:click={() => rewardFilter = { min: 15_000_000, max: 30_000_000 }} class="btn">15-30m</button>
					<button on:click={() => rewardFilter = { min: 30_000_000, max: 50_000_000 }} class="btn">30-50m</button>
					<button on:click={() => rewardFilter = { min: 50_000_000, max: null }} class="btn">50m+</button>
					<button on:click={() => rewardFilter = { min: null, max: null }} class="btn btn-ghost">Reset</button>
				</span>
		</Filter>
	</div>
	<div class="flex-1">

		<h2 class="text-lg font-bold">Results ({filteredCount})</h2>

		<table class="table m-6">
			<thead>
			<tr>
				<th><button on:click={() => flipSort('distance')}>Distance</button></th>
				<th><button on:click={() => flipSort('volume')}>Volume</button></th>
				<th><button on:click={() => flipSort('collateral')}>Collateral</button></th>
				<th><button on:click={() => flipSort('reward')}>Reward</button></th>
			</tr>
			</thead>
			<tbody>
			{#each filteredCouriers as courier}
				<tr>
					<td>{courier.distance.toLocaleString()} jumps</td>
					<td>{courier.volume.toLocaleString()} m3</td>
					<td>{courier.collateral.toLocaleString()} ISK</td>
					<td>{courier.reward.toLocaleString()} ISK</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
    td, th {
        text-align: right;
    }
</style>