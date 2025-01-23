<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	import { page } from '$app/stores';
	import { mapTransactionType } from '$lib/logistics/utilities.ts';

	const csvData = `Date;Type;Amount;Collateral;Balance` + $page.data.transactions.map(t => {
		return [
			new Date(t.created).toISOString(),
			mapTransactionType(t.type),
			t.amount ?? '',
			t.collateral ?? '',
			t.balance
		];
	}).map(r => r.join(';')).join('\n');
</script>

<svelte:head>
	<title>HSBB Logistics</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		<a
			class="btn btn-primary mt-2"
			download="hsbb-logistics-transactions.csv"
			href={`data:application/csv;charset=utf-8,${encodeURIComponent(csvData)}`}
		>
			Download CSV
		</a>
	</main>
	<Footer />
</div>