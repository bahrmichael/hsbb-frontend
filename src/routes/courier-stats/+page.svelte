<script>
	import Navbar from '$lib/Navbar.svelte';
	import Couriers from '$lib/couriers/Couriers.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
	<title>HSBB Courier Stats</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<Couriers />
	<Footer />
</div>