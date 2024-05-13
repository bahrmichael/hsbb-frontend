<script>
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import Waitlist from '$lib/Waitlist.svelte';
</script>

<svelte:head>
	<title>HSBB Contract Manager Waitlist</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />
	<Waitlist />
	<Footer />
</div>