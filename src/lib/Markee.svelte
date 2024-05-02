<script lang="ts">
	import { onMount } from 'svelte';

	export let showImage = true;

	onMount(() => {
		if (new Date('2024-05-30') < new Date()) {
			showImage = false;
		}
	});
</script>

<div class={"card card-compact bg-accent-content shadow-xl mb-4"}>
	{#if showImage}
		<figure>
			<img
				class="overflow-hidden object-cover"
				src="/markee-event.jpg"
				alt="Markee Event" />
		</figure>
	{/if}
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