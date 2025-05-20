<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let selectedImage = '';
	export let compact = false;

	const storeSelect = $page.data.characterId % 4 == 0 ? 'partner' : 'markee';

	let showEveStore = false;
	// Show an ad if the token was issued at least 30 days ago
	if ($page.data.iat && $page.data.iat * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 7) {
		showEveStore = true;
	}

	onMount(async () => {
		if (showEveStore) {
			selectedImage = '/store-event-omega-december.jpg';
			await fetch(`/api/store/view?store=${storeSelect}&compact=${compact}`);
		}
	});
</script>

{#if compact}
	<div class={'card card-compact bg-accent-content shadow-xl mb-4'}>
		<div class="card-body">
			{#if storeSelect === 'partner'}
				<h2 class="card-title">
					Get your PLEX on the <span class="text-accent">official Eve store</span>!
				</h2>
				<p class="mb-2 text-lg">
					You can buy bundles, plex, omega time, and many other items through the official EVE
					store, and support us at the same time.
				</p>
				<div class="card-actions justify-end">
					<a
						class="btn btn-accent text-neutral"
						href={`/eve-store?store=partner&compact=${compact}`}
						target="_blank">Visit Official Eve Store</a
					>
				</div>
			{:else}
				<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">
					Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many other
					items.
				</p>
				<div class="card-actions justify-end">
					<a
						class="btn btn-accent text-neutral"
						href={`/eve-store?store=markee&compact=${compact}`}
						target="_blank">Visit Markee Dragon Store</a
					>
				</div>
			{/if}
		</div>
	</div>
{:else if showEveStore}
	<div class={'card card-compact bg-accent-content shadow-xl mb-4'}>
		{#if selectedImage}
			<figure>
				<a href={`/eve-store?store=${storeSelect}&compact=${compact}`} target="_blank">
					<img class="overflow-hidden object-cover" src={selectedImage} alt="Store Event" />
				</a>
			</figure>
		{/if}
		<div class="card-body">
			{#if storeSelect === 'partner'}
				<h2 class="card-title">
					Get your PLEX on the <span class="text-accent">official EVE store</span>!
				</h2>
				<p class="mb-2 text-lg">
					You can buy bundles, plex, omega time, and many other items through the official EVE
					store, and support us at the same time.
				</p>
				<div class="card-actions justify-end">
					<a
						class="btn btn-accent text-neutral"
						href={`/eve-store?store=partner&compact=${compact}`}
						target="_blank">Visit Official Eve Store</a
					>
				</div>
			{:else}
				<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">
					Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many other
					items.
				</p>
				<div class="card-actions justify-end">
					<a
						class="btn btn-accent text-neutral"
						href={`/eve-store?store=markee&compact=${compact}`}
						target="_blank">Visit Markee Dragon Store</a
					>
				</div>
			{/if}
		</div>
	</div>
{/if}
