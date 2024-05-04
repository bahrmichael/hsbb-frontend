<script lang="ts">
	import copy from 'copy-to-clipboard';
	import CopyToClipboardIcon from '$lib/icons/CopyToClipboard.svelte';
	export let total: number;
</script>

<div class="flex justify-between">
	<h2 class="card-title font-bold text-2xl">You get <span
		class="text-success">{total.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>ISK!</h2>
	<button class="btn btn-primary text-gray-100 justify-self-end"
					on:click={() => copy(total.toFixed(2))}>
		<CopyToClipboardIcon />
		Copy price
	</button>
</div>