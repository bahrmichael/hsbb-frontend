<script lang="ts">
	export let name: string = '';
	export let region: string = '';
	export let length: number = 30;

	let ellipsis = " ...";

	$: cutoff = length - ellipsis.length;
	$: text = `${region}: ${name}`;
</script>

{#if text.length > length}
	<div class="tooltip" data-tip={text}>
		{name.slice(0, cutoff)}{ellipsis}
	</div>
{:else}
	{text}
{/if}