<script>
	import Navbar from '$lib/Navbar.svelte';
	import CourierJobs from '$lib/couriers/CourierJobs.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
	<title>HSBB Courier Stats</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<CourierJobs />
	<Footer />
</div>