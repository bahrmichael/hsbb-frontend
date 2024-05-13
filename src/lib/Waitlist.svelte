<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { getInstance } from '$lib/instance.ts';

	async function signin() {
		const instance = getInstance();
		if (instance !== 'highsec') {
			return;
		}
		const clientId = '7817dc406c90427db9d3570bb3cc495b';
		window.location.replace(`https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${encodeURIComponent(`https://${instance}.evebuyback.com/callback`)}&client_id=${clientId}&state=waitlist`);
	}
</script>

<div class="mb-6">
	<div class="card bg-neutral shadow-xl">
		<div class="card-body">
			{#if $page.data.requiresSignIn}
				<span class="font-bold text-2xl mb-8">Waitlist</span>
				<button on:click={signin} class="btn btn-primary text-gray-100">Sign in to join the waitlist</button>
			{:else}
				<span class="font-bold text-2xl mb-8">Waitlist for {$page.data.characterName}</span>
				<p>When we hire new contract managers we reach out to people on the waitlist. You can then pick any character to join our corporation with.</p>
				{#if $page.data.active}
					<p class="text-success">You are currently on the waitlist. We will send you an ingame mail when we hire new contract managers.</p>
					<form method="post" use:enhance>
						<button class="btn btn-error text-gray-100" type="submit">Leave the waitlist</button>
					</form>
				{:else}
					<form method="post" use:enhance>
						<button class="btn btn-primary text-gray-100" type="submit">Join the waitlist</button>
					</form>
				{/if}
				<p>You are currently signed in as {$page.data.characterName}. If you want to switch to a different character, you can <button class="text-info" on:click={signin}>sign in with a different character or account</button>.</p>
			{/if}
		</div>
	</div>
</div>