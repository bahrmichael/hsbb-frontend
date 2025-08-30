<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { page } from '$app/stores';

	function formatISK(amount: number) {
		if (!amount) return '0.00 ISK';
		return (
			new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(amount) + ' ISK'
		);
	}

	function formatISKChange(amount: number) {
		if (!amount) return '0.00 ISK';
		const formatted = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(Math.abs(amount));
		const prefix = amount >= 0 ? '+' : '-';
		return `${prefix}${formatted} ISK`;
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Balance - HSBB</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		{#if $page.data.requiresSignIn}
			<div class="max-w-2xl space-y-6">
				<h1 class="text-3xl font-bold">Balance</h1>
				<p class="py-2">Please sign in to view your balance.</p>
				<a href="/callback" class="btn btn-primary">Sign In with EVE Online</a>
			</div>
		{:else}
			<div class="max-w-4xl space-y-6">
				<h1 class="text-3xl font-bold">Your Balance</h1>
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title">Character: {$page.data.name}</h2>
						<div class="stat">
							<div class="stat-title">Current Balance</div>
							<div class="stat-value text-primary">{formatISK($page.data.balance)}</div>
						</div>
					</div>
				</div>

				{#if $page.data.transactions && $page.data.transactions.length > 0}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">Transaction History (Last 30 Days)</h2>
							<div class="overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Date</th>
											<th>Change</th>
											<th>Balance</th>
										</tr>
									</thead>
									<tbody>
										{#each $page.data.transactions as transaction}
											<tr>
												<td>{formatDate(transaction.date)}</td>
												<td class={transaction.reward >= 0 ? 'text-success' : 'text-error'}>
													{formatISKChange(transaction.reward)}
												</td>
												<td>{formatISK(transaction.balance)}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				{:else}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title">Transaction History</h2>
							<p class="text-gray-500">No transactions found for the last 30 days.</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>
	<Footer />
</div>
