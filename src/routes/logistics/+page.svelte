<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';

	import { page } from '$app/stores';

	const contractValues = [
		2_000_000_000,
		5_000_000_000,
		10_000_000_000,
		20_000_000_000
	];
	let selectedValue = contractValues[0];

	const handleContractRequest = () => {
		alert("This is not implemented yet. Just ping Lerso on Discord.")
	};

	function handleLogin() {
		window.location.replace(`https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${encodeURIComponent(`https://highsec.evebuyback.com/callback`)}&client_id=7817dc406c90427db9d3570bb3cc495b&state=nah`);
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
		alert("This is not implemented yet. Just ping Lerso on Discord.")
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

	function mapTransactionType(transactionType: string) {
		switch (transactionType) {
			case "contractOut":
				return "Contract accepted";
			default:
				return transactionType
		}
	}
</script>

<svelte:head>
	<title>HSBB Logistics</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<main class="min-h-screen p-4">
		{#if $page.data.requiresSignIn}
			<div class="max-w-2xl mx-auto space-y-6 text-center">
				<h1 class="text-3xl font-bold">Welcome to the HSBB Logistics Program (Beta)</h1>
				<p class="text-gray-600">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
					labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
					laboris nisi ut aliquip ex ea commodo consequat.
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
				<h1 class="px-6 text-3xl font-bold">HSBB Logistics (Beta)</h1>
				<p class="px-6">With the HSBB Logistics program you can help us move assets to <a
					href="https://universe.eveonline.com/lore/jita-iv-moon-4-caldari-navy-assembly-plant" class="link">Jita</a>,
					and profit while doing so. You
					can request contracts of 2b to 20b ISK, and receive 3% of the value as a reward when the items have been
					delivered
					to <a href="https://universe.eveonline.com/lore/jita-iv-moon-4-caldari-navy-assembly-plant"
								class="link">Jita</a>. This should be enough so that you can use public couriers or hauling providers
					while still making a
					profit. That means you don't have to risk losing your own ship.</p>
				<p class="px-6">Contracts will be scattered across New Eden, but we try to keep them somewhat close to Jita
					(i.e. no Khanid or islands). You're free to reject
					contracts, but that will move you to the end of the queue.</p>
				<p class="px-6">The process is simple: <b>Firstly</b>, use the request form below to request contracts. You
					should receive a
					contract within a couple days, and have 7 days to accept it. The contract is priced at Jita Buy as collateral,
					but
					we expect you to return all items. <b>Secondly</b>, you move the items to <a
						href="https://universe.eveonline.com/lore/jita-iv-moon-4-caldari-navy-assembly-plant" class="link">Jita</a>.
					We recommend that you create public
					couriers to get the best match of safety and pricing. Use our <a href="/jobs/couriers" class="link">public
						data</a> to help with
					pricing your couriers. <b>Finally</b>, when all the items have arrived in <a
						href="https://universe.eveonline.com/lore/jita-iv-moon-4-caldari-navy-assembly-plant" class="link">Jita</a>
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
									We calculate your balance automatically by taking the difference between outgoing and incoming
									collateral, and
									adding the reward for returned items. The price of items may change between when you accept and create
									a contract, but
									our system accounts for that. Here are two examples:
									<ul class="m-4">
										<li class="list-disc">You accept a contract for <span class="text-blue-400">10b ISK</span>, and
											return it for <span class="text-blue-400">9.5b ISK</span> because the items lost some value. That's a <span class="text-red-400">-500m ISK</span>
											difference. You receive a 3% reward of <span class="text-green-400">300m ISK</span>. In summary
											you'll receive a transfer of <span class="text-green-400">800m ISK</span>, yielding a profit of
											<span class="text-green-400">300m ISK</span>.
										</li>
										<li class="list-disc">You accept a contract for <span class="text-blue-400">2b ISK</span>, and
											return it for <span class="text-blue-400">2.1b ISK</span> because the items gained some value. That's a <span class="text-green-400">100m ISK</span>
											difference. Your 3% reward would be <span class="text-green-400">60m ISK</span>. In summary you'll
											have a profit of <span class="text-green-400">100m ISK</span> while having a balance of <span
												class="text-red-400">-40m ISK</span>. We will not require you to send ISK, but will wait for the
											next transactions to balance it out.
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
										<h2 class="text-xl font-semibold">Your Balance: <span class="text-green-600">{formatIsk($page.data.balance)}</span></h2>
<!--										<button class="text-blue-600 hover:text-blue-800" on:click={exportToCsv}>-->
<!--											Export to CSV-->
<!--										</button>-->
									</div>
								</div>
								{#if $page.data.transactions && $page.data.transactions.length > 0}
									<p class="text-gray-400 mb-4">
										Here are your recent transactions:
									</p>
									<div class="overflow-x-auto">
										<table class="w-full table-auto">
											<thead>
											<tr class="border-b">
												<th class="px-4 py-2 text-left">Description</th>
												<th class="px-4 py-2 text-left">Date</th>
												<th class="px-4 py-2 text-left">Amount</th>
												<th class="px-4 py-2 text-left">Balance</th>
											</tr>
											</thead>
											<tbody>
											{#each $page.data.transactions as t}
												<tr class="">
													<td class="px-4 py-2">{mapTransactionType(t.transactionType)}</td>
													<td class="px-4 py-2">{new Date(t.created).toLocaleDateString()}</td>
													<td class="px-4 py-2 text-right"><span
														class={t.amount >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk(t.amount)}</span></td>
													<td class="px-4 py-2 text-right"><span
														class={t.balance >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk(t.balance)}</span>
													</td>
												</tr>
											{/each}
											</tbody>
										</table>
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
										class="w-full bg-blue-600 text-white px-4 py-2 rounded-md transition-colors {$page.data.outstandingContracts?.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}"
										disabled={$page.data.outstandingContracts?.length > 0}
									>
										Request contracts
									</button>
									{#if $page.data.outstandingContracts?.length > 0}
										<p class="text-gray-500">
											Please accept all outstanding contracts first.
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
									You will receive contracts from Highsec Buyback to {$page.data.characterName}. Each of them is priced a Jita Buy using
									the <a href="https://janice.e-351.com/" class="link">janice appraisal</a>. The pricing helps us get
									a fair collateral on the items. You don't need to travel to the location of the items, but can use
									your remote inventory ingame to pick items and create public couriers. You can see your outstanding
									contracts below.
								</p>
								{#if $page.data.outstandingContracts && $page.data.outstandingContracts.length > 0}
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
														{contract.locationName}
													</td>
												</tr>
											{/each}
											</tbody>
										</table>
									</div>
								{:else}
									<p class="text-gray-400">No outstanding contracts.</p>
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
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
									et
									dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
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
								Explain how you send contracts and how to appraise them.
							</p>
							<div class="overflow-x-auto">
								<table class="w-full table-auto">
									<thead>
									<tr class="border-b">
										<th colspan="2" class="px-4 py-2 text-left">Item</th>
										<th class="px-4 py-2 text-right">Days Held</th>
										<th class="px-4 py-2 text-right">Quantity</th>
									</tr>
									</thead>
									<tbody>
									{#each $page.data.pendingItems as item}
										<tr class="">
											<td class="px-4 py-2">
												<img src={`https://images.evetech.net/types/${item.typeId}/icon?size=32`} alt={item.typeName}
														 class="w-8 h-8" />
											</td>
											<td class="px-4 py-2">{item.typeName}</td>
											<td class="px-4 py-2 text-right">
												<span class={getDaysClass(countDays(item.updated))}>
													{countDays(item.updated)}
												</span>
											</td>
											<td class="px-4 py-2 text-right">{formatValue(item.amount)}</td>
										</tr>
									{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<!-- More dashboard content will go here -->
			</div>
		{/if}
	</main>
	<Footer />
</div>