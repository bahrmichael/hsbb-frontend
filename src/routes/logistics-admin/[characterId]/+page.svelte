<script lang="ts">
	import { page } from '$app/stores';
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { formatIsk } from '$lib/isk-formatting.ts';
	import ItemsTable from '$lib/logistics/ItemsTable.svelte';
	import Transactions from '$lib/logistics/Transactions.svelte';

	async function clearAllData() {
		await fetch(`/api/logistics/delete-character/?characterId=${$page.params.characterId}`, {
			method: 'DELETE'
		});
		alert('Done!');
		window.location.replace('/logistics-admin');
	}
</script>


<svelte:head>
	<title>HSBB Logistics Admin</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Overview for {$page.data.name}</h2>
			<div>
				<div class="w-3/3">
					<div class="flex gap-4">
						<!-- Request Form - Left Third -->
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-xl font-semibold">Balance: <span
								class={$page.data.balance >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk($page.data.balance, true)}</span>
								(<span
									class="text-blue-400">{formatIsk($page.data.remainingContractCollateral, true)}</span> Collateral)
							</h2>
							<!--										<button class="text-blue-600 hover:text-blue-800" on:click={exportToCsv}>-->
							<!--											Export to CSV-->
							<!--										</button>-->
						</div>
					</div>
					<div>Outstanding contracts: {$page.data.outstandingContracts?.length ?? 0}</div>
				</div>
			</div>

			{#if $page.data.transactions && $page.data.transactions.length > 0}
				<div class="overflow-x-auto">
					<Transactions transactions={$page.data.transactions} />
				</div>
			{:else}
				<p class="text-gray-400">No transactions yet.</p>
			{/if}
			<div>
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-semibold">Items Held</h2>
				</div>
				<p>
					{#if $page.data.janiceCalc?.startsWith('https')}
						<a href={$page.data.janiceCalc} target="_blank" class="text-blue-600 hover:text-blue-800">View on
							Janice</a>
					{:else}
						Janice: {$page.data.janiceCalc ?? 'Unknown'}
					{/if}
				</p>
				<div class="overflow-x-auto">
					<ItemsTable items={$page.data.pendingItems} />
				</div>
			</div>
			<button class="m-6 btn btn-error" on:click={clearAllData}>Clear all data</button>
		</div>
	</main>
	<Footer />
</div>
