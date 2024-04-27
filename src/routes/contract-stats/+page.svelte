<script>
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import Contracts from '$lib/contracts/Contracts.svelte';
</script>

<svelte:head>
	<title>HSBB Contract Stats</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<Contracts />
	<Footer />
</div>