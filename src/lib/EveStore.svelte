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

	interface Campaign {
		path: string;
		endDate: Date;
	}

	// Import all PNG files from store-events directory
	const campaignFiles = import.meta.glob('/static/store-events/*.png', { eager: true });

	const getAvailableCampaigns = (): Campaign[] => {
		const campaigns: Campaign[] = [];

		for (const path in campaignFiles) {
			// Extract filename from path
			const filename = path.split('/').pop() || '';

			// Check if filename matches date pattern (YYYY-MM-DD.png)
			if (/^\d{4}-\d{2}-\d{2}\.png$/.test(filename)) {
				const dateStr = filename.replace('.png', '');

				// Convert path from /static/... to /... for client-side use
				const publicPath = path.replace('/static', '');

				campaigns.push({
					path: publicPath,
					endDate: new Date(dateStr)
				});
			}
		}

		return campaigns;
	};

	const getNextCampaign = (campaigns: Campaign[]): Campaign | null => {
		if (!campaigns.length) return null;

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		// Filter campaigns that end at least tomorrow
		const validCampaigns = campaigns.filter((campaign) => campaign.endDate >= tomorrow);
		if (!validCampaigns.length) return null;

		// Sort by end date (ascending) and take the first one (soonest end date)
		validCampaigns.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
		return validCampaigns[0];
	};

	onMount(async () => {
		if (showEveStore) {
			const campaigns = getAvailableCampaigns();
			const nextCampaign = getNextCampaign(campaigns);

			if (nextCampaign) {
				selectedImage = nextCampaign.path;
			}

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
