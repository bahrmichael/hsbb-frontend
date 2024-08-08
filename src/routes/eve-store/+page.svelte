<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const store = $page.params.store;
	const link = store === 'partner' ?
		'https://store.eveonline.com/?code=hsbb' :
		'https://store.markeedragon.com/affiliate.php?id=1011&redirect=index.php?cat=4';

	onMount(() => {
		fetch(`/api/store/click?store=${store}`)
			.finally(() => {
				window.location.replace(link);
			});
	});
</script>

<div id="container" class="container mx-auto">
	Redirecting to store ...
</div>
