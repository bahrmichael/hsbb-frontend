<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	import { page } from '$app/stores';

	$: requests = $page.data.requests;

	const deleteContractRequest = async (characterId: number) => {
		await fetch(`/api/logistics/delete-request/?characterId=${characterId}`, {
			method: 'DELETE'
		});
		alert('Done');
	};

	async function completePayoutRequest(characterId: number, value: number) {
		await fetch(`/api/logistics/complete-payout-request/?characterId=${characterId}&value=${value}`, {
			method: 'POST'
		});
		alert('Done');
	}

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
			<h2 class="px-6 text-2xl font-bold">Contract Requests</h2>
			<div>
				<div class="flex gap-4">
					<!-- Request Form - Left Third -->

					<!-- Contracts Table - Right Two Thirds -->
					<div class="w-3/3">
						<div class="rounded-lg p-6">
							<div class="overflow-x-auto">
								<table class="w-full table-auto">
									<thead>
									<tr class="border-b">
										<th class="px-4 py-2 text-left">Name</th>
										<th class="px-4 py-2 text-right">Value</th>
										<th class="px-4 py-2 text-right"></th>
									</tr>
									</thead>
									<tbody>
									{#each $page.data.contractRequests as r}
										<tr class="">
											<td
												class="px-4 py-2">{$page.data.characters.find((c) => c.id === r.characterId)?.name ?? r.characterId}</td>
											<td class="px-4 py-2 text-right">{formatIsk(r.value)}</td>
											<td class="px-4 py-2">
												<button class="btn btn-primary" on:click={() => deleteContractRequest(r.characterId)}>Done</button>
											</td>
										</tr>
									{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- More dashboard content will go here -->

			<h2 class="px-6 text-2xl font-bold">Payout Requests</h2>
			<div>
				<div class="flex gap-4">
					<!-- Request Form - Left Third -->

					<!-- Contracts Table - Right Two Thirds -->
					<div class="w-3/3">
						<div class="rounded-lg p-6">
							<div class="overflow-x-auto">
								<table class="w-full table-auto">
									<thead>
									<tr class="border-b">
										<th class="px-4 py-2 text-left">Name</th>
										<th class="px-4 py-2 text-right">Value</th>
										<th class="px-4 py-2 text-right"></th>
									</tr>
									</thead>
									<tbody>
									{#each $page.data.payoutRequests as r}
										<tr class="">
											<td
												class="px-4 py-2">{$page.data.characters.find((c) => c.id === r.characterId)?.name ?? r.characterId}</td>
											<td class="px-4 py-2 text-right">{Math.floor(r.value)} ({formatIsk(r.value)})</td>
											<td class="px-4 py-2">
												<button class="btn btn-primary" on:click={() => completePayoutRequest(r.characterId, Math.floor(r.value))}>Done</button>
											</td>
										</tr>
									{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>


			<h2 class="px-6 text-2xl font-bold">Characters</h2>
			<div>
				<div class="flex gap-4">
					<!-- Request Form - Left Third -->

					<!-- Contracts Table - Right Two Thirds -->
					<div class="w-3/3">
						<div class="rounded-lg p-6">
							<div class="overflow-x-auto">
								<table class="w-full table-auto">
									<thead>
									<tr class="border-b">
										<th class="px-4 py-2 text-left">Name</th>
									</tr>
									</thead>
									<tbody>
									{#each $page.data.characters as r}
										<tr class="">
											<td class="px-4 py-2"><a href={`/logistics-admin/${r.id}`} class="link">{r.name}</a></td>
										</tr>
									{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- More dashboard content will go here -->

		</div>
	</main>
	<Footer />
</div>