<script lang="ts">
	import Filter from '$lib/couriers/Filter.svelte';
	import EveStore from '$lib/EveStore.svelte';
	import { page } from '$app/stores';

	type Courier = {
		volume: number;
		distanceShort: number;
		distanceSafe: number;
		collateral: number;
		reward: number;
	};

	let couriers: Courier[] = $page.data.couriers.map((c: any) => {
		return {
			volume: c.v,
			distanceShort: c.d1,
			distanceSafe: c.d2 ?? c.d1,
			collateral: c.c,
			reward: c.r
		};
	});
	let filteredCouriers: Courier[] = [];

	type Filter = {
		min: number | null;
		max: number | null;
	};

	let distanceFilter: Filter = { min: null, max: null };
	let collateralFilter: Filter = { min: null, max: null };
	let rewardFilter: Filter = { min: null, max: null };
	let volumeFilter: Filter = { min: null, max: null };

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

	$: distanceFilteredCount = couriers.filter(courier => filterValue(distanceFilter, courier.volume > 62_500 ? courier.distanceSafe : courier.distanceShort)).length;
	$: collateralFilteredCount = couriers.filter(courier => filterValue(collateralFilter, courier.collateral)).length;
	$: rewardFilteredCount = couriers.filter(courier => filterValue(rewardFilter, courier.reward)).length;
	$: volumeFilteredCount = couriers.filter(courier => filterValue(volumeFilter, courier.volume)).length;

	function sort(a: Courier, b: Courier) {
		if (sortField == 'distance') {
			const aDistance = a.volume > 62_500 ? a.distanceSafe : a.distanceShort;
			const bDistance = b.volume > 62_500 ? b.distanceSafe : b.distanceShort;
			return aDistance - bDistance;
		} else {
			return a[sortField] - b[sortField];
		}
	}

	$: filteredCouriers = couriers.filter(courier => {
		const distanceValid = filterValue(distanceFilter, courier.volume > 62_500 ? courier.distanceSafe : courier.distanceShort);
		const collateralValid = filterValue(collateralFilter, courier.collateral);
		const rewardValid = filterValue(rewardFilter, courier.reward);
		const volumeValid = filterValue(volumeFilter, courier.volume);
		return distanceValid && collateralValid && rewardValid && volumeValid;
	})
		.sort((a, b) => isSortAscending ? sort(a, b) : sort(b, a))
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

	function jumps(p: { short: number, safe?: number, highlight?: 'short' | 'safe' }) {
		if (!p.safe) {
			return p.short > 1 ? `${p.short} jumps` : `${p.short} jump`;
		} else if (p.highlight === 'short') {
			return `${p.safe} (<span class="font-bold">${p.short}</span>) jumps`;
		} else {
			return `<span class="font-bold">${p.safe}</span> (${p.short}) jumps`;
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
		<EveStore compact={true} />
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
					{#if courier.distanceShort === courier.distanceSafe}
							<td>{jumps({short: courier.distanceShort})}</td>
					{:else}
						{#if courier.volume > 62_500}
							<td><div class="tooltip" data-tip="For freighter sized couriers we assume the safest route. The shortest route is shown in the brackets.">{@html jumps({short: courier.distanceShort, safe: courier.distanceSafe, highlight: 'safe'})}</div>
							</td>
						{:else}
							<td>
								<div class="tooltip" data-tip="For couriers that don't need a freighter we assume the shortest route, which is shown in the brackets.">{@html jumps({short: courier.distanceShort, safe: courier.distanceSafe, highlight: 'short'})}</div></td>
						{/if}
					{/if}
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