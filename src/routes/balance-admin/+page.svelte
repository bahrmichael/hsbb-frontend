<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	function formatIsk(amount: number) {
		if (!amount) return '0.00 ISK';
		return (
			new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(amount) + ' ISK'
		);
	}

	let copiedStates: { [key: string]: boolean } = {};
	let payoutStates: { [key: string]: boolean } = {};

	function copyToClipboard(value: string, characterId: string) {
		navigator.clipboard.writeText(value);
		copiedStates[characterId] = true;
		setTimeout(() => {
			copiedStates[characterId] = false;
		}, 1000);
	}

	function handlePayout(characterId: string, balance: number) {
		// Copy to clipboard first
		copyToClipboard(formatIsk(balance), characterId);

		// Show processing state
		payoutStates[characterId] = true;

		// Submit form programmatically
		const form = document.getElementById(`payout-form-${characterId}`) as HTMLFormElement;
		form.requestSubmit();
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
													{#if balance.balance > 0}
														<button
															class="w-52 p-2 text-white rounded transition-colors duration-200 {payoutStates[
																balance.character_id
															]
																? 'bg-orange-500 hover:bg-orange-500'
																: copiedStates[balance.character_id]
																	? 'bg-green-500 hover:bg-green-500'
																	: 'bg-blue-500 hover:bg-blue-600'}"
															on:click={() => handlePayout(balance.character_id, balance.balance)}
														>
															{formatIsk(balance.balance)}
														</button>
													{:else}
														{formatIsk(balance.balance)}
													{/if}

													<form
														id="payout-form-{balance.character_id}"
														method="POST"
														action="?/payout"
														style="display: none;"
														use:enhance={() => {
															return async ({ result }) => {
																payoutStates[balance.character_id] = false;
																if (result.type === 'success') {
																	// Refresh the page to show updated balance
																	window.location.reload();
																}
															};
														}}
													>
														<input type="hidden" name="character_id" value={balance.character_id} />
														<input type="hidden" name="current_balance" value={balance.balance} />
													</form>
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
