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
		<span>If this contract is on a highsec island, we will reject it. You can sell it to <a href="https://lowsec.evebuyback.com/" target="_blank">Lowsec Buyback</a> instead.</span>
	</div>
{/if}
{#if rejectionCodes.includes("contains_capital")}
	<div role="alert" class="alert alert-warning my-4">
		<WarningIcon />
		<span>If this contract is on a highsec island, we will reject it. It contains capital ships that are too large (Orca, Freighters) for safe extraction.</span>
	</div>
{/if}
{#if rejectionCodes.includes("contains_plex")}
	<div role="alert" class="alert alert-warning my-4">
		<WarningIcon />
		<span>Please sell PLEX through the <a href="https://plex.evebuyback.com"><b>Plex Buyback</b></a>.</span>
	</div>
{/if}