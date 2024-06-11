<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let selectedImage = '';
	export let compact = false;

	const plexSaleUntil = '2024-05-09';
	const isPlexSale = new Date() <= new Date(plexSaleUntil);
	let showMarkee = isPlexSale;

	onMount(() => {
		if (!showMarkee) {
					// If the token was issued at least 30 days ago
				if ($page.data.iat && $page.data.iat * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 7) {
					showMarkee = true;
				}
		}

		if (showMarkee) {
			if (isPlexSale) {
				selectedImage = '/markee-event-plex.jpg';
			} else if (new Date() < new Date('2024-06-20')) {
				selectedImage = '/markee-event.jpg';
			}
		}
	});
</script>

{#if compact}
	<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
		<div class="card-body">
			<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
			<p class="mb-2 text-lg">Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many
				other items.</p>
			<div class="card-actions justify-end">
				<a class="btn btn-accent text-neutral"
					 href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">Visit
					Markee Dragon Store</a>
			</div>
		</div>
	</div>
{:else if showMarkee}
	<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
		{#if selectedImage}
			<figure>
				<a href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">
					<img
						class="overflow-hidden object-cover"
						src={selectedImage}
						alt="Markee Event" />
				</a>
			</figure>
		{/if}
		<div class="card-body">
			{#if isPlexSale}
				<h2 class="card-title"><span class="text-accent">Rare PLEX sale!</span>3% cheaper with the code <span
					class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">Rare PLEX sales only happen once a year! You can get another 3% discount by using the
					code <span class="text-accent">hsbb</span>, and magically support us with your purchase.</p>
				<p class="mb-2 text-xs">The sale lasts until {new Date(plexSaleUntil).toLocaleDateString()}.</p>
				<div class="card-actions justify-end">
					<a class="btn btn-accent text-neutral"
						 href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">Visit
						Markee Dragon Store</a>
				</div>
			{:else}
				<h2 class="card-title">3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">Support Highsec Buyback while paying 3% less for bundles, plex, omega time, and many
					other items.</p>
				<div class="card-actions justify-end">
					<a class="btn btn-accent text-neutral"
						 href="https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4" target="_blank">Visit
						Markee Dragon Store</a>
				</div>
			{/if}
		</div>
	</div>
{/if}