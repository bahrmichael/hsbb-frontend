<script lang="ts">
	import SignIn from './SignIn.svelte';
	import { page } from '$app/stores';

	interface Props {
		requiredScopes: string[];
		children?: any;
	}

	let { requiredScopes, children }: Props = $props();

	// Get auth data from page
	let authData = $derived($page.data);
	let requiresSignIn = $derived(authData?.requiresSignIn || !authData?.token);
	let missingScopes = $derived(authData?.missingScopes || []);
	let hasAllScopes = $derived(missingScopes.length === 0);

	// Get current URL for redirect
	let currentUrl = $derived($page.url.pathname + $page.url.search);
</script>

{#if requiresSignIn}
	<div class="card bg-base-200 shadow-xl max-w-md mx-auto">
		<div class="card-body text-center">
			<h2 class="card-title justify-center">Sign In Required</h2>
			<p>You must sign in with your EVE Online character to access this page.</p>
			<div class="card-actions justify-center mt-4">
				<SignIn scope={requiredScopes} redirectTo={currentUrl} />
			</div>
		</div>
	</div>
{:else if !hasAllScopes}
	<div class="card bg-warning bg-opacity-20 shadow-xl max-w-md mx-auto">
		<div class="card-body text-center">
			<h2 class="card-title justify-center">Additional Permissions Required</h2>
			<p>This page requires additional EVE Online permissions that you haven't granted yet.</p>
			<div class="mt-2">
				<p class="text-sm font-semibold">Missing scopes:</p>
				<ul class="text-xs list-disc list-inside mt-1">
					{#each missingScopes as scope}
						<li>{scope}</li>
					{/each}
				</ul>
			</div>
			<div class="card-actions justify-center mt-4">
				<SignIn 
					scope={requiredScopes} 
					redirectTo={currentUrl} 
					buttonText="Grant Additional Permissions"
					class="btn-warning"
				/>
			</div>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}
