<script lang="ts">
	import { page } from '$app/stores';
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';

	async function clearAllData() {
		await fetch(`/api/logistics/delete-character/?characterId=${$page.params.characterId}`, {
			method: 'DELETE'
		});
		alert('Done!');
	}


	function countDays(date: Date): number {
		const today = new Date();
		const timeDiff = Math.abs(today.getTime() - new Date(date).getTime());
		return Math.ceil(timeDiff / (1000 * 3600 * 24));
	}

	function atLeast7Days(item: { updated: Date }) {
		return countDays(item.updated) >= 7;
	}

	function exportToCsv() {
		alert('This is not implemented yet. Just ping Lerso on Discord.');
	}

	const getDaysClass = (days: number) => {
		if (days >= 14) return 'text-red-600 font-semibold';
		if (days >= 7) return 'text-yellow-600 font-semibold';
		return 'text-green-600 font-semibold';
	};

	const formatIsk = (value: number) => {
		return formatValue(value) + ' ISK';
	};

	function toF(v: number, d: number): string {
		if (v % 1 == 0) {
			return `${v}`;
		} else {
			return v.toFixed(d);
		}
	}

	const formatValue = (value: number) => {
		const v = Math.abs(value);
		if (v < 1000) {
			return toF(value, 2);
		}
		if (v < 1_000_000) {
			return toF(value / 1000, 2) + 'k';
		}
		if (v < 1_000_000_000) {
			return toF(value / 1_000_000, 2) + 'm';
		}
		return toF(value / 1_000_000_000, 2) + 'b';
	};
</script>


<svelte:head>
	<title>HSBB Logistics Admin</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		<div class="space-y-4">
			<h2 class="px-6 text-2xl font-bold">Overview for {$page.data.name}</h2>
			<div>
				<div class="flex gap-4">
					<!-- Request Form - Left Third -->


					<!-- Contracts Table - Right Two Thirds -->
					<div class="w-3/3">
						<div class="rounded-lg p-6">
							<div class="overflow-x-auto">
								<ul>
									{#each $page.data.records as r}
										<li>
											<pre>{JSON.stringify(r)}</pre>
										</li>
									{/each}
								</ul>
								<!--								<table class="w-full table-auto">-->
								<!--									<thead>-->
								<!--									<tr class="border-b">-->
								<!--										<th class="px-4 py-2 text-left">Name</th>-->
								<!--										<th class="px-4 py-2 text-right">Value</th>-->
								<!--										<th class="px-4 py-2 text-right"></th>-->
								<!--									</tr>-->
								<!--									</thead>-->
								<!--									<tbody>-->
								<!--									{#each $page.data.requests as r}-->
								<!--										<tr class="">-->
								<!--											<td-->
								<!--												class="px-4 py-2">{$page.data.characters.find((c) => c.id === r.characterId)?.name ?? r.characterId}</td>-->
								<!--											<td class="px-4 py-2 text-right">{formatIsk(r.value)}</td>-->
								<!--											<td class="px-4 py-2">-->
								<!--												<button class="btn" on:click={() => deleteContractRequest(r.characterId)}>Clear</button>-->
								<!--											</td>-->
								<!--										</tr>-->
								<!--									{/each}-->
								<!--									</tbody>-->
								<!--								</table>-->
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>

				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold">Items Held</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full table-auto">
						<thead>
						<tr class="border-b">
							<th colspan="2" class="px-4 py-2 text-left">Item</th>
							<th class="px-4 py-2 text-right">Quantity</th>
							<th class="px-4 py-2 text-right">Days Held</th>
						</tr>
						</thead>
						<tbody>
						{#each $page.data.pendingItems as item}
							<tr class="">
								<td class="px-4 py-2 w-24">
									<img src={`https://images.evetech.net/types/${item.typeId}/icon?size=32`} alt={item.typeName}
											 class="w-8 h-8" />
								</td>
								<td class="px-4 py-2">{item.typeName}</td>
								<td class="px-4 py-2 text-right">{formatValue(item.amount)}</td>
								<td class="px-4 py-2 text-right">
											<span class={getDaysClass(countDays(item.updated))}>
												{countDays(item.updated)}
											</span>
								</td>
							</tr>
						{/each}
						</tbody>
					</table>
				</div>
			</div>
			<button class="m-6 btn btn-error" on:click={clearAllData}>Clear all data</button>
		</div>
	</main>
	<Footer />
</div>
