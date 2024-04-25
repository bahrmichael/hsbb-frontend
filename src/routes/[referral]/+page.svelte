<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!localStorage.getItem('referrer') && $page.params.referral) {
			localStorage.setItem('referrer', $page.params.referral);
		}
		goto('/' , {replaceState: true})
	});
</script>

