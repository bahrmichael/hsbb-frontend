<script lang="ts">
	import { onMount } from 'svelte';
	import * as jwt from 'jose';

	export let selectedImage = '';

	const plexSaleUntil = '2024-05-09';
	const isPlexSale = new Date() <= new Date(plexSaleUntil);
	let showMarkee = isPlexSale;

	onMount(() => {
		if (!showMarkee) {
			const token = localStorage.getItem('token-v1');
			if (token) {
				try {
					const decoded = jwt.decodeJwt(token);
					// If the token was issued at least 30 days ago
					if (decoded.iat && decoded.iat * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 30) {
						showMarkee = true;
					}
				} catch (e) {
					// I don't want anything to crash if we can't decode the token.
					console.log('Failed to decode token', e);
				}
			}
		}

		if (showMarkee) {
			if (isPlexSale) {
				selectedImage = '/markee-event-plex.jpg';
			} else if (new Date() < new Date('2024-05-30')) {
				selectedImage = '/markee-event.jog';
			}
		}
	});
</script>

{#if showMarkee}
	<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
		{#if selectedImage}
			<figure>
				<img
					class="overflow-hidden object-cover"
					src={selectedImage}
					alt="Markee Event" />
			</figure>
		{/if}
		<div class="card-body">
			{#if isPlexSale}
				<h2 class="card-title"><span class="text-accent">Rare PLEX sale!</span>3% cheaper with the code <span class="text-accent">hsbb</span>!</h2>
				<p class="mb-2 text-lg">Rare PLEX sales only happen once a year! You can get another 3% discount by using the code <span class="text-accent">hsbb</span>, and magically support us with your purchase.</p>
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