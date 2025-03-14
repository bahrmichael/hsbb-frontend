<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	import { page } from '$app/stores';
	import ItemsTable from '$lib/logistics/ItemsTable.svelte';
	import Transactions from '$lib/logistics/Transactions.svelte';
	import { formatIsk } from '$lib/isk-formatting.ts';
	import { atLeast7Days } from '$lib/logistics/utilities.ts';

	const contractValues = [
		2_000_000_000,
		5_000_000_000,
		10_000_000_000,
		20_000_000_000
	];
	let selectedValue = contractValues[0];

	const handleContractRequest = async () => {
		await fetch(`/api/logistics/request-contract/`, {
			method: 'POST',
			body: JSON.stringify({
				value: selectedValue
			})
		});
		alert('Request received. You\'re now in the queue!');
	};

	const handlePayoutRequest = async () => {
		await fetch(`/api/logistics/request-payout/`, {
			method: 'POST'
		});
		alert('Request received!');
	};

	function handleLogin() {
		window.location.replace(`https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${encodeURIComponent(`https://highsec.evebuyback.com/callback`)}&client_id=7817dc406c90427db9d3570bb3cc495b&state=nah`);
	}
</script>

<svelte:head>
	<title>HSBB Logistics</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		{#if $page.data.requiresSignIn}
			<div class="max-w-2xl space-y-6">
				<h1 class="text-3xl font-bold">Welcome to the HSBB Logistics Program</h1>
				<p class="py-2">
					With the HSBB Logistics program you can help us sending assets to Jita or Amarr (whichever is closer),
					and profit while doing so. With HSBB becoming larger, we need to outsource more work. Creating couriers is one
					of those areas.
					The ideal way to participate in this program is more about admin work (i.e. creating public couriers) and less
					about hauling items yourself.
				</p>
				<p>
					Please pick a character you want to use for this program to get started. We only need a name, nothing more.
				</p>
				<button
					on:click={handleLogin}
					class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
				>
					Sign in with EVE Online
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				<h1 class="px-6 text-3xl font-bold">HSBB Logistics</h1>
				<p class="px-6">
					With the HSBB Logistics program you can help us sending assets to Jita or Amarr (whichever is closer),
					and profit while doing so. With HSBB becoming larger, we need to outsource more work. Creating couriers is one
					of those areas.
					The ideal way to participate in this program is more about admin work (i.e. creating public couriers) and less
					about hauling items yourself.
				</p>
				<p class="px-6">
				</p>
				<p class="px-6">
					<b>How does it work?</b>
					You can request contracts of 2b to 20b ISK, and receive 3% of the value as a reward when the items have been
					delivered
					to Jita or Amarr (whichever is closer). This should be enough so that you can use public couriers or hauling
					providers
					while still making a profit. That means you don't have to risk losing your own ship.</p>
				<p class="px-6">Contracts will be scattered across New Eden, but limited to highsec mainland (i.e. no islands).
					You're free to reject
					contracts, but that will move you to the end of the queue.</p>
				<p class="px-6">The process is simple: <b>Firstly</b>, use the request form below to request contracts. You
					should receive a
					contract within a couple days, and have 7 days to accept it. The contract is priced at Jita Buy as collateral,
					but
					we expect you to return all items. <b>Secondly</b>, you move the items to Jita or Amarr (whichever is closer).
					We recommend that you create public
					couriers to get the best match of safety and pricing. Use our <a href="/jobs/couriers" class="link">public
						data</a> to help with
					pricing your couriers. <b>Finally</b>, when all the items have arrived in to Jita or Amarr (whichever is
					closer)
					contract them to <a href="https://evewho.com/character/93475128" class="link">Lerso Nardieu</a> and price
					the contract at the Jita Buy value of all the items. Use the <a href="https://janice.e-351.com/" class="link">janice
						appraisal</a>
					to find the price for a list of items.</p>
				<div>
					<div class="flex gap-4">
						<!-- Request Form - Left Third -->
						<div class="w-1/3">
							<div class="rounded-lg p-6">
								<div class="text-lg font-bold mb-4">
									You're signed in as {$page.data.characterName}.
								</div>
								<p class="text-gray-400 mb-2">
									We expect that you return all items that you receive. If items are lost due to a gank,
									please reach out to us. If you collaterize your couriers properly, there should be no loss for you.
								</p>
								<div class="text-gray-400 mb-2">
									We calculate your balance automatically by tracking rewards, payouts and by clearing collateral.
									When you returned all items and have no more pending items, we clear the collateral by transferring
									the remaining value to your balance. If you returned items for less ISK than you received them, we
									add a positive amount to your balance. This amount will be paid out with your next payout request.

									Here are two examples:
									<ul class="m-4">
										<li class="list-disc">You accept a contract for <span class="text-blue-400">10b ISK</span>, and
											return it for <span class="text-blue-400">10b ISK</span>. You receive a 3% reward
											of <span class="text-green-400">300m ISK</span>.
										</li>
										<li class="list-disc">You accept a contract for <span class="text-blue-400">2b ISK</span>. While
											moving
											the items you accept another contract for <span class="text-blue-400">5b ISK</span>. You wait for
											all
											items to arrive in Jita, and return all of them for <span class="text-blue-400">7b ISK</span>.
											Your 3% reward is <span class="text-green-400">210m ISK</span>.
										</li>
									</ul>
								</div>
							</div>
						</div>

						<!-- Contracts Table - Right Two Thirds -->
						<div class="w-2/3">
							<div class="rounded-lg p-6">
								<div class="mb-4">
									<div class="flex justify-between items-center mb-4">
										<h2 class="text-xl font-semibold">Your Balance: <span
											class={$page.data.balance >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk($page.data.balance, true)}</span>
											(<span
												class="text-blue-400">{formatIsk($page.data.remainingContractCollateral, true)}</span>
											Collateral)
										</h2>
										{#if $page.data.transactions?.length > 0}
											<a class="text-blue-600 hover:text-blue-800" href="/logistics/download-transactions">
												Export to CSV
											</a>
										{/if}
										<button
											type="submit"
											class="bg-blue-600 text-white px-4 py-2 rounded-md transition-colors {($page.data.hasPayoutRequest || $page.data.balance <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}"
											disabled={$page.data.hasPayoutRequest || $page.data.balance <= 0}
											on:click={handlePayoutRequest}
										>
											Request payout
										</button>
									</div>
								</div>
								{#if $page.data.balance < 0}
									<p class="mb-4">Your balance may be negative if the collateral for returned items was higher than the
										recent reward plus collateral for received items.</p>
								{/if}
								{#if $page.data.transactions && $page.data.transactions.length > 0}
									<p class="text-gray-400 mb-4">
										Here are your recent transactions:
									</p>
									<div class="overflow-x-auto">
										<Transactions transactions={$page.data.transactions} />
									</div>
								{:else}
									<p class="text-gray-400">Your transactions will appear here.</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<div>
					<div class="flex gap-4">
						<!-- Request Form - Left Third -->
						<div class="w-1/3">
							<div class="rounded-lg p-6">
								<h2 class="text-xl font-semibold mb-4">
									Request contracts for {$page.data.characterName}
								</h2>
								<p class="text-gray-400 mb-2">
									You can request more contracts. It may take us a couple days to contract new items to you, please be
									patient.
									Below you can select the total value of the items that you want to receive.
								</p>
								<p class="text-gray-400 mb-4">
									You will receive contracts for the character that you're signed in with, and probably want to hand
									those
									items to your alts. We may add support for multiple characters in the future, but have no immediate
									plans to do so.
								</p>
								<form class="space-y-4" on:submit|preventDefault={handleContractRequest}>
									<div>
										<label for="value" class="block text-sm font-medium text-gray-400 mb-2">
											Contract Value
										</label>
										<select
											id="value"
											bind:value={selectedValue}
											class="w-full p-2 rounded-md"
										>
											{#each contractValues as value}
												<option value={value}>{formatIsk(value)}</option>
											{/each}
										</select>
									</div>
									<button
										type="submit"
										class="w-full bg-blue-600 text-white px-4 py-2 rounded-md transition-colors {($page.data.outstandingContracts?.length || $page.data.hasContractRequest) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}"
										disabled={$page.data.outstandingContracts?.length > 0 || $page.data.hasContractRequest}
									>
										Request contracts
									</button>
									{#if $page.data.outstandingContracts?.length > 0}
										<p class="text-gray-500">
											Please accept all outstanding contracts first.
										</p>
									{/if}
									{#if $page.data.hasContractRequest}
										<p class="text-gray-500">
											You already requested a contract.
										</p>
									{/if}
								</form>
							</div>
						</div>

						<!-- Contracts Table - Right Two Thirds -->
						<div class="w-2/3">
							<div class="rounded-lg p-6">
								<h2 class="text-xl font-semibold mb-4">Outstanding Contracts</h2>
								<p class="text-gray-400 mb-4">
									You will receive contracts from Highsec Buyback to {$page.data.characterName}. Each of them is priced
									a Jita Buy using
									the <a href="https://janice.e-351.com/" class="link" target="_blank">janice appraisal</a>. The pricing
									helps us get
									a fair collateral on the items. You don't need to travel to the location of the items, but can use
									your remote inventory ingame to pick items and create public couriers. You can see your outstanding
									contracts below.
								</p>
								{#if $page.data.outstandingContracts?.length > 0}
									<div class="overflow-x-auto">
										<table class="w-full table-auto">
											<thead>
											<tr class="border-b">
												<th class="px-4 py-2 text-left">Date Issued</th>
												<th class="px-4 py-2 text-left">Contract Value</th>
												<th class="px-4 py-2 text-left">Location</th>
											</tr>
											</thead>
											<tbody>
											{#each $page.data.outstandingContracts as contract}
												<tr class="">
													<td class="px-4 py-2">{new Date(contract.issued).toLocaleDateString()}</td>
													<td class="px-4 py-2">{formatIsk(contract.price)}</td>
													<td class="px-4 py-2 truncate max-w-xs" title={contract.locationName}>
														<a href={`https://evemaps.dotlan.net/station/${contract.locationName.replaceAll(" ", "_")}`}
															 target="_blank" class="link">{contract.locationName}</a>
													</td>
												</tr>
											{/each}
											</tbody>
										</table>
									</div>
								{:else}
									<p class="text-gray-400">There are no outstanding contracts. You can request a new contract on the
										left. It may take up to an hour for changes to appear here.</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<div class="flex gap-4">
					<!-- Status Panel - Left Third -->
					<div class="w-1/3">
						<div class="rounded-lg p-6">
							<h2 class="text-xl font-semibold mb-4">Status Overview</h2>
							{#if $page.data.pendingItems.filter(atLeast7Days).length > 0}
								<div class="space-y-4">
									<div class="flex items-center text-red-600">
										<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6z" />
										</svg>
										<span>{$page.data.pendingItems.filter(atLeast7Days).length} items held for more than 7 days</span>
									</div>
									<p class="text-sm text-gray-600">
										Total value of overdue
										items: {formatIsk($page.data.pendingItems.filter(atLeast7Days).map((i: any) => i.amount * i.price).reduce((a: number, b: number) => a + b, 0))}
									</p>
								</div>
							{:else}
								<p class="text-gray-400">
									If you contracted too many items or lost some, just contact Lerso Nardieu. We'll credit them
									accordingly'.
								</p>
							{/if}
						</div>
					</div>

					<!-- Items Table - Right Two Thirds -->
					<div class="w-2/3">
						<div class="rounded-lg p-6">
							<div class="flex justify-between items-center mb-4">
								<h2 class="text-xl font-semibold">Items Held</h2>
								<!--								<button class="text-blue-600 hover:text-blue-800" on:click={exportToCsv}>-->
								<!--									Export to CSV-->
								<!--								</button>-->
							</div>
							<p class="text-gray-400 mb-4">
								When you have the items in Jita IV 4, you can appraise them with <a href="https://janice.e-351.com/"
																																										class="link"
																																										target="_blank">janice</a>
								and send a contract to Lerso Nardieu.
							</p>
							{#if $page.data.pendingItems?.length > 0 }
								<div class="overflow-x-auto">
									<div class="overflow-x-auto">
										<ItemsTable items={$page.data.pendingItems} />
									</div>
								</div>
							{:else}
								No items held. Please request a contract, or accept an outstanding one. It may take up to an hour for
								changes to appear here.
							{/if}
						</div>
					</div>
				</div>
				<!-- More dashboard content will go here -->
			</div>
		{/if}
	</main>
	<Footer />
</div>