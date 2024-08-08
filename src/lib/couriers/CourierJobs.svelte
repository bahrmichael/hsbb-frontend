<script lang="ts">
	import Filter from '$lib/couriers/Filter.svelte';
	import EveStore from '$lib/EveStore.svelte';
	import { page } from '$app/stores';
	import EllipsedName from '$lib/couriers/EllipsedName.svelte';
	import { onMount } from 'svelte';
	import SquareArrowIcon from '$lib/couriers/SquareArrowIcon.svelte';

	type Courier = {
		id: number;
		volume: number;
		distanceShort: number;
		distanceSafe: number;
		collateral: number;
		reward: number;
		from: string;
		to: string;
		fromRegion: string;
		toRegion: string;
	};

	let couriers: Courier[] = $page.data.couriers.map((c: any) => {
		return {
			id: c.id,
			volume: c.v,
			distanceShort: c.d1,
			distanceSafe: c.d2 ?? c.d1,
			collateral: c.c,
			reward: c.r,
			from: c.f,
			to: c.t,
			fromRegion: c.rf,
			toRegion: c.rt
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

	function filterRegion(expected: string, actual: string) {
		if (!expected) {
			return true;
		}
		return expected === actual;
	}

	let distanceFilteredCount = 0;
	let collateralFilteredCount = 0;
	let rewardFilteredCount = 0;
	let volumeFilteredCount = 0;

	let selectedStartRegion = '';
	let selectedEndRegion = '';

	let sortField: 'distance' | 'collateral' | 'volume' | 'reward' | 'from' | 'to' = 'reward';
	let isSortAscending = false;

	$: distanceFilteredCount = couriers.filter(courier => filterValue(distanceFilter, courier.volume > 62_500 ? courier.distanceSafe : courier.distanceShort)).length;
	$: collateralFilteredCount = couriers.filter(courier => filterValue(collateralFilter, courier.collateral)).length;
	$: rewardFilteredCount = couriers.filter(courier => filterValue(rewardFilter, courier.reward)).length;
	$: volumeFilteredCount = couriers.filter(courier => filterValue(volumeFilter, courier.volume)).length;

	function sort(a: Courier, b: Courier) {
		if (sortField == 'distance') {
			const aDistance = a.volume > 62_500 ? a.distanceSafe : a.distanceShort;
			const bDistance = b.volume > 62_500 ? b.distanceSafe : b.distanceShort;
			return aDistance - bDistance;
		} else if (['from', 'to'].includes(sortField)) {
			return a[sortField].toString().localeCompare(b[sortField].toString());
		} else {
			// @ts-ignore
			return a[sortField] - b[sortField];
		}
	}

	$: filteredCouriers = couriers.filter(courier => {
		const distanceValid = filterValue(distanceFilter, courier.volume > 62_500 ? courier.distanceSafe : courier.distanceShort);
		const collateralValid = filterValue(collateralFilter, courier.collateral);
		const rewardValid = filterValue(rewardFilter, courier.reward);
		const volumeValid = filterValue(volumeFilter, courier.volume);
		const fromRegionValid = filterRegion(selectedStartRegion, courier.fromRegion);
		const toRegionValid = filterRegion(selectedEndRegion, courier.toRegion);
		return distanceValid && collateralValid && rewardValid && volumeValid && fromRegionValid && toRegionValid;
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

	function shortNumber(n: number): string {
		if (n < 1_000) {
			return n.toString();
		} else if (n < 1_000_000) {
			const fixed = n % 1_000 === 0 ? 0 : 1;
			return (n / 1_000).toFixed(fixed) + 'k';
		} else if (n < 1_000_000_000) {
			const fixed = n % 1_000_000 === 0 ? 0 : 1;
			return (n / 1_000_000).toFixed(fixed) + 'm';
		} else {
			const fixed = n % 1_000_000_000 === 0 ? 0 : 1;
			return (n / 1_000_000_000).toFixed(fixed) + 'b';
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

	let regionStartNames: string[] = [];
	let regionEndNames: string[] = [];
	onMount(async () => {

		const response = await fetch('/region-names.json');
		const allRegionNames = await response.json();
		regionStartNames = allRegionNames.filter((r: string) => {
			return undefined != couriers.find(c => c.fromRegion === r);
		}).sort((a: string, b: string) => a.localeCompare(b));
		regionEndNames = allRegionNames.filter((r: string) => {
			return undefined != couriers.find(c => c.toRegion === r);
		}).sort((a: string, b: string) => a.localeCompare(b));

	});

	let showToast = false;

	async function openContractIngame(contractId: number) {
		await fetch(`/api/open-contract/?contractId=${contractId}`, {
			method: 'POST'
		});
		showToast = true;
		setTimeout(() => showToast = false, 3_000);
	}

	async function removeAuthToken() {
		await fetch(`/api/delete-cookie?cookieName=token-ingame`, {
			method: `POST`
		});
		window.location.reload();
	}
</script>

<div class="flex flex-row gap-16 mb-8">
	<div class="basis-2/3">
		<h1 class="text-xl font-bold mb-4">HSBB Courier Jobs</h1>
		<p class="mb-4">On this page you can see outstanding public couriers from HSBB. You can use the filters on the left
			to drill down.</p>
		<p>We update this information once per hour. Right now there are {couriers.length} couriers available.</p>
		{#if $page.data.characterName}
			<hr class="my-4" />
			<p class="mt-4">You signed in for opening couriers ingame as {$page.data.characterName}. You can sign out below to switch to a different character.</p>
			<button class="btn btn-outline mt-4" on:click={removeAuthToken}>Sign out</button>
		{/if}
	</div>
	<div class="basis-1/3">
		<EveStore compact={true} />
	</div>
</div>

<div class="flex flex-row gap-16 mb-8">
	<div class="basis-1/3">
		<h2 class="text-lg font-bold">Filters</h2>
		<div class="flex gap-2 m-6">
			<label class="basis-1/2 form-control">
				<span class="flex justify-between items-center font-bold">
					Start Region
				</span>
				<select bind:value={selectedStartRegion} class="select select-bordered w-full">
					<option value="" selected>None</option>
					{#each regionStartNames as region}
						<option value={region}>{region}
							({couriers.filter(courier => filterRegion(region, courier.fromRegion)).length})
						</option>
					{/each}
				</select>
			</label>
			<label class="basis-1/2 form-control">
				<span class="flex justify-between items-center font-bold">
					End Region
				</span>
				<select bind:value={selectedEndRegion} class="select select-bordered w-full">
					<option value="" selected>None</option>
					{#each regionEndNames as region}
						<option value={region}>{region} ({couriers.filter(courier => filterRegion(region, courier.toRegion)).length}
							)
						</option>
					{/each}
				</select>
			</label>
		</div>
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
	<div class="basis-2/3">

		<h2 class="text-lg font-bold">Results ({filteredCount})</h2>

		<table class="table m-6">
			<thead>
			<tr>
				<th>
					<button on:click={() => flipSort('distance')}>Distance</button>
				</th>
				<th>
					<button on:click={() => flipSort('volume')}>Volume</button>
				</th>
				<th>
					<button on:click={() => flipSort('collateral')}>Collateral</button>
				</th>
				<th>
					<button on:click={() => flipSort('reward')}>Reward</button>
				</th>
				<th>
					<button on:click={() => flipSort('from')}>From</button>
				</th>
				<th>
					<button on:click={() => flipSort('to')}>To</button>
				</th>
				<th>Open</th>
			</tr>
			</thead>
			<tbody>
			{#each filteredCouriers as courier}
				<tr>
					{#if courier.distanceShort === courier.distanceSafe}
						<td>{jumps({ short: courier.distanceShort })}</td>
					{:else}
						{#if courier.volume > 62_500}
							<td>
								<div class="tooltip"
										 data-tip="For freighter sized couriers we assume the safest route. The shortest route is shown in the brackets.">{@html jumps({
									short: courier.distanceShort,
									safe: courier.distanceSafe,
									highlight: 'safe'
								})}</div>
							</td>
						{:else}
							<td>
								<div class="tooltip"
										 data-tip="For couriers that don't need a freighter we assume the shortest route, which is shown in the brackets.">{@html jumps({
									short: courier.distanceShort,
									safe: courier.distanceSafe,
									highlight: 'short'
								})}</div>
							</td>
						{/if}
					{/if}
					<td>{shortNumber(courier.volume)} m3</td>
					<td>{shortNumber(courier.collateral)} ISK</td>
					<td>{shortNumber(courier.reward)} ISK</td>
					<td>
						<EllipsedName name={courier.from} region={courier.fromRegion} />
					</td>
					<td>
						<EllipsedName name={courier.to} region={courier.toRegion} />
					</td>
					<td>
						{#if $page.data.authenticated}
							<button class="btn btn-xs btn-ghost" on:click={() => openContractIngame(courier.id)}>
								<SquareArrowIcon />
							</button>
						{:else}
							<button class="btn btn-xs btn-ghost" on:click={()=>document.getElementById('my_modal_2')?.showModal()}>
								<SquareArrowIcon />
							</button>
							<dialog id="my_modal_2" class="modal">
								<div class="modal-box text-left">
									<h3 class="font-bold text-lg">Permission required</h3>
									<p class="py-4">To open couriers in the EVE client for you, you have to grant that permission. Click
										on the button below to sign in and grant it.</p>
									<a
										href={`https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${encodeURIComponent(`https://highsec.evebuyback.com/callback`)}&client_id=3247cabe27284ec9afc7c20971c45234&state=ingame&scope=esi-ui.open_window.v1`}
										class="btn btn-primary text-gray-100">Sign in</a>
								</div>
								<form method="dialog" class="modal-backdrop">
									<button>close</button>
								</form>
							</dialog>
						{/if}
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
	{#if showToast}
		<div class="toast">
			<div class="alert alert-success">
				<span>Contract opened.</span>
			</div>
		</div>
	{/if}
</div>

<style>
    td, th {
        text-align: right;
    }
</style>