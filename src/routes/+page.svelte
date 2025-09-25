<script>
	import Appraisal from '$lib/Appraisal.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { onMount } from 'svelte';

	let showNewAuthNotice = false;

	onMount(() => {
		showNewAuthNotice = !!localStorage.getItem('token-v2');
	});
</script>

<div id="container" class="container mx-auto">
	<Navbar />
	{#if showNewAuthNotice}
		<div role="alert" class="alert mb-10">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<span>We cleared all logins and need you to sign in again.</span>
		</div>
	{/if}
<!--	<Appraisal />-->

	<div class="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Left half - Shutdown notice -->
		<div class="card bg-neutral shadow-xl">
			<div class="card-body">
				<span class="font-bold text-2xl">HSBB and LSBB are shutting down</span>
				<p>Today I'm making the tough decision to shut down Highsec Buyback and Lowsec Buyback. Both projects are run by an incredible team of dedicated people, and I am very grateful for all the work they have done! However I'm the bottleneck for the software side and the asset consolidation, for which I don't have the capacity anymore.
				</p><p>
					Thank you for all your support, and business, and the help to grow this project so far and run it for so long ❤️
				</p><p>
					If this caught you red-handed and you still wanted to sell off some assets, please post a Janice link at 90% Jita Buy <a class="text-info" href="https://discord.gg/TC3ygpeKvk" target="_blank">on our Discord</a> in ⁠public-marketplace. I'll manually review them over the next weeks. Anyone is welcome to make an offer to outbid us.
				</p><p>
					I will not hand the corp or software over, but can give advice to anyone who wants to start their own buyback, and I will happily link to them on the shutdown notice.
				</p><p>
				  <a class="text-info" href="https://plex.evebuyback.com" target="_blank">Plex Buyback</a> is not affected, and will continue since it's much smaller and soooo much easier in terms of logistics and software required.
				</p>
			</div>
		</div>

		<!-- Right half - Alternatives -->
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Alternative Buyback Services</h2>
				<p class="">If you're looking for another buyback, check out the options below.</p>
				<p class="mb-2">Use only item exchange contracts! Don't use trades, as they are often used for scams.</p>

				<div class="space-y-3">
					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://plex.evebuyback.com/?r=hsbb" class="font-semibold text-info hover:underline">PLEX Buyback</a>
						<p class="text-sm opacity-70">HSBB owned PLEX only buyback</p>
					</div>

					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://forums.eveonline.com/t/quick-isk-buyback-service/497052" class="font-semibold text-info hover:underline">Quick-ISK Buyback</a>
						<p class="text-sm opacity-70">General buyback for HS/LS</p>
					</div>

					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://cash4trash.space/" class="font-semibold text-info hover:underline">Cash 4 Trash</a>
						<p class="text-sm opacity-70">General buyback</p>
					</div>

					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://jitarun.com/?r=hsbb" class="font-semibold text-info hover:underline">JitaRun</a>
						<p class="text-sm opacity-70">Universal buyback, covering High, Low, Null, Pochven, Zarzakh</p>
					</div>

					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://forums.eveonline.com/t/buyback-general-hangar-cleaner-general-buyback-buying-anything-anywhere/413484" class="font-semibold text-info hover:underline">Hangar Cleaner</a>
						<p class="text-sm opacity-70">Buying anything anywhere</p>
					</div>

					<div class="p-3 bg-base-100 rounded-lg">
						<a href="https://discord.gg/CHNQTjPDAS" class="font-semibold text-info hover:underline">Evework's Decentralised Buyback</a>
						<p class="text-sm opacity-70">Under Development</p>
					</div>

					<p class="text-sm mt-2">Any problems with the buybacks listed above? Please report them <a class="text-info" href="https://discord.gg/TC3ygpeKvk" target="_blank">on our Discord</a>.</p>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>
