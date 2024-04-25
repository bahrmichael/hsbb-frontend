<script lang="ts">

	import WarningIcon from '$lib/icons/Warning.svelte';

	export let rejectionCodes: string[] = [];
	export let appraisalFailures: string = '';
</script>

{#if appraisalFailures}
	<div role="alert" class="alert alert-warning my-4">
		<WarningIcon />
		<span>The input "{appraisalFailures}" could not be parsed. This may happen when items are very new, or there are typos in the input.</span>
	</div>
{/if}
{#if rejectionCodes.includes("bad_isk_per_m3")}
	<div role="alert" class="alert alert-warning my-4">
		<WarningIcon />
		<span>If this contract is on a highsec island, we will reject it. The shipping cost far exceeds the value.</span>
	</div>
{/if}
{#if rejectionCodes.includes("contains_capital")}
	<div role="alert" class="alert alert-warning my-4">
		<WarningIcon />
		<span>If this contract is on a highsec island, we will reject it. It contains capital ships that are too large (Orca, Freighters) for safe extraction.</span>
	</div>
{/if}