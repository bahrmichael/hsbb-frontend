<script>
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let copied = false;

	function copyToClipboard() {
		navigator.clipboard.writeText($page.data.skinCode).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

<svelte:head>
	<title>Redemption Successful</title>
</svelte:head>

<div id="container" class="container mx-auto">
	<Navbar />

	<div class="container mx-auto px-4 py-8 max-w-2xl">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-4">🎉 Redemption Successful!</h1>
		</div>

		<div class="alert alert-warning">
			<div>
				<span class="font-semibold">⚠️ Important:</span>
				<p>
					Save this code immediately! Your redeem code has been consumed and this page cannot be
					accessed again.
				</p>
			</div>
		</div>

		<div class="card mb-6">
			<div class="card-body">
				<div class="p-6 rounded-lg mb-4">
					<div class="font-mono text-3xl font-bold text-center select-all mb-4">
						{$page.data.skinCode}
					</div>
					<div class="text-center">
						<button
							class="btn btn-outline btn-sm"
							on:click={copyToClipboard}
							class:btn-success={copied}
						>
							{#if copied}
								✓ Copied!
							{:else}
								📋 Copy Code
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>
