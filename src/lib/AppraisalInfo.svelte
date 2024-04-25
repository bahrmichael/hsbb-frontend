<script lang="ts">
	import { getInstance } from '$lib/instance';
	import { onMount } from 'svelte';

	let isLowSec: boolean, name: string, security: string, blockedItems: string[], stations: string;
	onMount(() => {
		isLowSec = getInstance() === 'lowsec';
		name = isLowSec ? 'Lowsec' : 'Highsec';
		security = isLowSec ? 'Low' : 'High';
		blockedItems = isLowSec ? ['blueprints', 'fitted rigs', 'used crystals'] : ['blueprints', 'proving filaments'];
		stations = isLowSec ? `ANY Lowsec Station (<a class="text-info" target="_blank" href="https://bit.ly/3kaEHLb">exceptions</a>)` : "NPC stations only (no citadels)";
	});
</script>

<div class="px-10 pt-10">
	<div class="font-bold text-2xl mb-4">3 easy steps!</div>
	<ol class="list-decimal ml-4 mb-4">
		<li>Appraise your items on the right</li>
		<li>Create a contract to {name} Buyback (corp)</li>
		<li>Get paid{isLowSec ? "" : " (usually within the hour)"}</li>
	</ol>
	<div class="mb-6">
		<a href="https://youtu.be/AEVrBXCbRj8" class="text-info">
			Let Rushlock show you how to do it.
		</a>
	</div>
	<div class="font-bold text-lg mb-4">Limitations</div>
	<ul class="list-disc ml-4 mb-4">
		<li><span class="font-bold">Regions</span>: {security} security space only</li>
		<li><span class="font-bold">Stations</span>: {@html stations}</li>
		<li><span class="font-bold">Items</span>: No {blockedItems?.join(", ")}</li>
	</ul>
	<p>If you're unsure, just send us a contract. You will<br/>get a mail within 10 minutes if something is wrong.</p>
</div>