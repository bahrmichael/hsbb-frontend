<script lang="ts">
	import ThemePicker from '$lib/ThemePicker.svelte';
	import { onMount } from 'svelte';
	import { getInstance } from '$lib/instance';

	let isHsbb = true;
	let name = 'Highsec Buyback';
	onMount(() => {
		isHsbb = getInstance() === 'highsec';
		name = isHsbb ? 'Highsec Buyback' : 'Lowsec Buyback';
	});
</script>

<div class="navbar mt-5 mb-10">
	<div class="flex-1">
		{#if isHsbb}
			<img src="/logo-transparent.png" width="64" alt="HSBB Logo" />
		{/if}
		<a class="btn btn-ghost text-xl font-bold mx-4" href="/">{name}</a>
		{#if isHsbb}
			<div class="text-xl hidden lg:block">The fastest buyback service in New Eden!</div>
		{/if}
	</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			{#if isHsbb}
				<li>
					<a href="/jobs">Jobs</a>
				</li>
				<li>
					<a href="/courier-stats">Courier Stats</a>
				</li>
				<li>
					<a href="/contract-stats">Contract Stats</a>
				</li>
			{/if}
			<li>
				<ThemePicker />
			</li>
		</ul>
	</div>
</div>
