<script>
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { page } from '$app/stores';

	let selectedGiveaway = '';
</script>

<svelte:head>
	<title>Redeem Giveaway Code</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />

	<div class="container mx-auto px-4 py-8 max-w-2xl">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-4">Redeem Your Giveaway</h1>
		</div>

		<div class="font-mono text-center bg-base-200 p-2 rounded">
			{$page.data.redeemCode}
		</div>
		<p class="text-sm text-gray-500 text-center mt-2">
			This code will be invalidated when you click on Redeem Code.
		</p>

		<div class="card">
			<div class="card-body">
				<h2 class="card-title">Select Your Giveaway</h2>
				<p class="text-gray-400 mb-4">
					Choose which giveaway you'd like to claim a skin from. You can only use this redeem code
					once.
				</p>

				<div class="form-control mb-6">
					<label class="label" for="giveaway">
						<span class="label-text font-semibold">Available Giveaways</span>
					</label>
					{#each $page.data.giveawayNames as giveaway}
						<label class="label cursor-pointer border rounded-lg p-4 mb-2 hover:bg-base-200">
							<div class="flex-1">
								<span class="label-text text-lg font-medium">{giveaway.name}</span>
								<div class="text-sm text-gray-600">
									{giveaway.availableCount} codes available
								</div>
							</div>
							<input
								type="radio"
								name="giveaway"
								value={giveaway.name}
								class="radio radio-primary"
								bind:group={selectedGiveaway}
							/>
						</label>
					{/each}
				</div>

				<div class="card-actions justify-center">
					<button
						type="button"
						class="btn btn-primary btn-lg"
						disabled={!selectedGiveaway}
						on:click={() =>
							(window.location = `/giveaway/redeemed?redeemCode=${$page.data.redeemCode}&selectedGiveaway=${encodeURIComponent(selectedGiveaway)}`)}
					>
						Redeem Code
					</button>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>
