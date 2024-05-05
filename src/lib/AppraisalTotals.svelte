<script lang="ts">
	import copy from 'copy-to-clipboard';
	import CopyToClipboardIcon from '$lib/icons/CopyToClipboard.svelte';
	export let total: number;

	// We round up so that we can copy a number without commas and dots.
	// This caused issues with users who have a mix of English/German in their clients/OS.
	$: value = Math.ceil(total);
</script>

<div class="flex justify-between">
	<h2 class="card-title font-bold text-2xl">You get <span
		class="text-success">{value.toLocaleString()}</span>ISK!</h2>
	<button class="btn btn-primary text-gray-100 justify-self-end"
					on:click={() => copy(value.toFixed())}>
		<CopyToClipboardIcon />
		Copy price
	</button>
</div>