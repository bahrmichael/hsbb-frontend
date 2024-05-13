<script>
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
	<title>HSBB Jobs</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<div class="flex gap-4">
		<div class="flex-1">
			<div class="card bg-neutral shadow-xl">
				<figure><img src="/hauler.png" alt="Hauling Ship"/></figure>
				<div class="card-body">
					<h2 class="card-title">Hauler</h2>
					<p>Most of our couriers are available publicly though the ingame couriers. If you can fly a jump freighter, you may reach out to our partner <a href="https://forums.eveonline.com/t/service-ghsol-a-simple-flat-rate-any-distance-jf-courier-service-moving-your-cargo-anywhere-for-the-last-10-years/294052" class="text-info" target="_blank">GHSOL</a>.</p>
					<div class="card-actions justify-end">
						<a href="/jobs/couriers" class="btn btn-primary text-gray-100">View our open couriers</a>
					</div>
					<p class="mb-2 text-xs"><a href="https://www.reddit.com/r/eveporn/comments/1buj025/the_tayra_1920x1080/" target="_blank">Picture: u/phish_biscuit</a></p>
				</div>
			</div>
		</div>
		<div class="flex-1">
			<div class="card bg-neutral shadow-xl">
				<figure><img src="/station.png" alt="Station Interior" /></figure>
				<div class="card-body">
					<h2 class="card-title">Contract Manager</h2>
					<p>Contract managers accept contracts and get paid a percentage of the contract each time. We occasionally hire new contracts managers from our waitlist.</p>
					<div class="card-actions justify-end">
						<a href="/jobs/waitlist" class="btn btn-primary text-gray-100">Join the waitlist</a>
					</div>
					<p class="mb-2 text-xs"><a href="https://www.reddit.com/r/eveporn/comments/1bupzox/sitting_at_a_bar_looking_at_my_ship_1920x1080/" target="_blank">Picture: u/ChameleonCabal</a></p>
				</div>
			</div>
		</div>
	</div>
	<Footer />
</div>