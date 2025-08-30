<script lang="ts">
	import ScopeGuard from '$lib/ScopeGuard.svelte';
	import { page } from '$app/stores';

	let data = $derived($page.data);
</script>

<svelte:head>
	<title>New Authentication Demo - HSBB</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold mb-6">New Authentication System Demo</h1>
		
		<div class="prose max-w-none mb-8">
			<p>
				This page demonstrates the new authentication system that replaces the 3rd party API. 
				It requires wallet reading permissions to access.
			</p>
		</div>

		<ScopeGuard requiredScopes={data.requiredScopes}>
			{#snippet children()}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title text-success">🎉 Authentication Successful!</h2>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Character Name</div>
								<div class="stat-value text-lg">{data.name}</div>
							</div>
							
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Character ID</div>
								<div class="stat-value text-lg">{data.characterId}</div>
							</div>
							
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Token Issued</div>
								<div class="stat-value text-sm">
									{new Date((data.iat || 0) * 1000).toLocaleString()}
								</div>
							</div>
							
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Required Scopes</div>
								<div class="stat-desc">
									{#each data.requiredScopes as scope}
										<div class="badge badge-sm badge-primary mr-1 mb-1">{scope}</div>
									{/each}
								</div>
							</div>
						</div>

						<div class="alert alert-info mt-6">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<div>
								<h3 class="font-bold">New Authentication Features</h3>
								<div class="text-sm mt-2">
									<ul class="list-disc list-inside space-y-1">
										<li>Direct EVE SSO integration (no 3rd party API)</li>
										<li>Scope-based access control</li>
										<li>Refresh token storage for persistent access</li>
										<li>Automatic scope checking and permission requests</li>
										<li>Secure JWT token management</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/snippet}
		</ScopeGuard>
	</div>
</div>
