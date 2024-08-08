<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let selectedImage = '';
	export let compact = false;

	const plexSaleUntil = '2024-06-19';
	const isPlexSale = new Date() <= new Date(plexSaleUntil);
	let showEveStore = isPlexSale;

	const storeSelect = $page.data.characterId % 8 == 0 ? 'partner' : 'markee';

	if (!showEveStore) {
		// If the token was issued at least 30 days ago
		if ($page.data.iat && $page.data.iat * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 7) {
			showEveStore = true;
		}
	}

	onMount(async () => {
		if (showEveStore) {
			if (isPlexSale && !compact) {
				selectedImage = '/store-event-equinox-plex.jpg';
			} else if (new Date() < new Date('2024-06-20') && !compact) {
				selectedImage = '/store-event-equinox-pack.jpg';
			} else {
				await fetch(`/api/store/view?store=${storeSelect}&compact=${compact}`);
			}
		}
	});
</script>

{#if compact}
	<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
		<div class="card-body">
			{#if storeSelect === "partner" }
				<h2 class="card-title">Get your PLEX on the <span class="text-accent">official Eve store</span>!</h2>
				<p class="mb-2 text-lg">You can buy bundles, plex, omega time, and many
					other items through the official EVE store, and support us at the same time.</p>
				<div class="card-actions justify-end">
					<a class="btn btn-accent text-neutral"
						 href={`/eve-store?store=partner&compact=${compact}`} target="_blank">Visit
						Official Eve Store</a>
				</div>
			{:else }
				<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many
					other items.</p>
				<div class="card-actions justify-end">
					<a class="btn btn-accent text-neutral"
						 href={`/eve-store?store=markee&compact=${compact}`} target="_blank">Visit
						Markee Dragon Store</a>
				</div>
			{/if}
		</div>
	</div>
{:else if showEveStore}
	<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
		{#if selectedImage}
			<figure>
				<a href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">
					<img
						class="overflow-hidden object-cover"
						src={selectedImage}
						alt="Store Event" />
				</a>
			</figure>
		{/if}
		<div class="card-body">
			{#if isPlexSale}
				<h2 class="card-title"><span class="text-accent">Rare PLEX sale!</span>3% cheaper with the code <span
					class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">A rare PLEX sale is happening! You can get another 3% discount by using the
					code <span class="text-accent">hsbb</span>, and magically support us with your purchase.</p>
				<p class="mb-2 text-xs">The sale lasts until {new Date(plexSaleUntil).toLocaleDateString()}.</p>
				<div class="card-actions justify-end">
					<a class="btn btn-accent text-neutral"
						 href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">Visit
						Markee Dragon Store</a>
				</div>
			{:else}
				{#if storeSelect === "partner" }
					<h2 class="card-title">Get your PLEX on the <span class="text-accent">official EVE store</span>!</h2>
					<p class="mb-2 text-lg">You can buy bundles, plex, omega time, and many
						other items through the official EVE store, and support us at the same time.</p>
					<div class="card-actions justify-end">
						<a class="btn btn-accent text-neutral"
							 href={`/eve-store?store=partner&compact=${compact}`} target="_blank">Visit
							Official Eve Store</a>
					</div>
				{:else }
					<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
					<p class="mb-2 text-lg">Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many
						other items.</p>
					<div class="card-actions justify-end">
						<a class="btn btn-accent text-neutral"
							 href={`/eve-store?store=markee&compact=${compact}`} target="_blank">Visit
							Markee Dragon Store</a>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}