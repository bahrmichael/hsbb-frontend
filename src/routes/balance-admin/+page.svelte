<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { page } from '$app/stores';

	function formatIsk(amount: number) {
		if (!amount) return '0.00 ISK';
		return (
			new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(amount) + ' ISK'
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};
</script>

<svelte:head>
	<title>HSBB Balance Admin</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		<div class="space-y-4">
			<h2 class="px-6 text-2xl font-bold">Character Balances</h2>
			<div>
				<div class="flex gap-4">
					<div class="w-full">
						<div class="rounded-lg p-6">
							<div class="overflow-x-auto">
								<table class="w-full table-auto">
									<thead>
										<tr class="border-b">
											<th class="px-4 py-2 text-left">Character</th>
											<th class="px-4 py-2 text-right">Balance</th>
											<th class="px-4 py-2 text-right">Last Transaction</th>
										</tr>
									</thead>
									<tbody>
										{#each $page.data.balances as balance}
											<tr class="">
												<td class="px-4 py-2">
													{balance.character_name ?? balance.character_id}
												</td>
												<td class="px-4 py-2 text-right">
													{formatIsk(balance.balance)}
												</td>
												<td class="px-4 py-2 text-right">
													{balance.last_transaction_date
														? formatDate(balance.last_transaction_date)
														: '-'}
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
		</div>
	</main>
	<Footer />
</div>
