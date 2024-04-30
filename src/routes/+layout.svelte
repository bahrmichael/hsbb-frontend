<script>
	import "../app.css";

	import { onMount } from "svelte";
	import { getInstance } from '$lib/instance.ts';

	let name = "Highsec Buyback";
	onMount(() => {
		if (getInstance() === 'lowsec') {
			name = "Lowsec Buyback";
		}
	});
</script>

<svelte:head>
	<title>{name}</title>
</svelte:head>

<slot />