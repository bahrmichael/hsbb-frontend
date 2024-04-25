<script lang="ts">
	export let label: string;
	export let resultCount: number;
	export let filter: { min: number | null, max: number | null };
</script>

<div class="flex flex-col gap-4 m-6">
	<label class="flex flex-col gap-2">
		<span class="flex justify-between items-center font-bold">
			{label} ({resultCount})
		</span>
		<span class="flex gap-2">
			<input type="number" bind:value={filter.min} placeholder="Min" class="input input-bordered w-full max-w-xs" />
			<input type="number" bind:value={filter.max} placeholder="Max" class="input input-bordered w-full max-w-xs" />
		</span>
	</label>
	<slot />
</div>