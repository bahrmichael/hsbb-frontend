<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	export let form;

	let isSubmitting = false;
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold">Giveaway Administration</h1>
		<div class="text-sm text-gray-600">
			Logged in as: <span class="font-semibold">{$page.data.characterName}</span>
		</div>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-6">
			<span>{form.error}</span>
		</div>
	{/if}

	{#if form?.success}
		<div class="alert alert-success mb-6">
			<span>Successfully added {form.added} codes!</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Add Codes Form -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Add New Skin Codes</h2>
				<form
					method="POST"
					action="?/addCodes"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
							await invalidateAll();
						};
					}}
				>
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Giveaway Name</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="e.g., Summer Event 2024"
							class="input input-bordered"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div class="form-control mt-4">
						<label class="label" for="codes">
							<span class="label-text">Skin Codes (one per line)</span>
						</label>
						<textarea
							id="codes"
							name="codes"
							placeholder="SKIN-CODE-1&#10;SKIN-CODE-2&#10;SKIN-CODE-3"
							class="textarea textarea-bordered h-32"
							required
							disabled={isSubmitting}
						></textarea>
					</div>

					<div class="card-actions justify-end mt-6">
						<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-sm"></span>
								Adding...
							{:else}
								Add Codes
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Giveaway Overview -->
		<div class="card bg-base-100 shadow-xl mt-8">
			<div class="card-body">
				<h2 class="card-title">Giveaway Overview</h2>
				{#if $page.data.giveawayNames.length === 0}
					<p class="text-gray-500">No giveaways created yet.</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Giveaway Name</th>
									<th>Available Codes</th>
								</tr>
							</thead>
							<tbody>
								{#each $page.data.giveawayNames as giveaway}
									<tr>
										<td class="font-medium">{giveaway.name}</td>
										<td>
											<div class="badge badge-outline">
												{giveaway.availableCount}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Generate Redeem Code -->
	<div class="card bg-base-100 shadow-xl mt-8">
		<div class="card-body">
			<h2 class="card-title">Generate Redeem Code</h2>
			<p class="text-gray-600 mb-4">
				Generate a one-time redeem code that winners can use to select any available giveaway.
			</p>
			<form
				method="POST"
				action="?/generateRedeemCode"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<div class="card-actions justify-end">
					<button type="submit" class="btn btn-accent"> Generate Redeem Code </button>
				</div>
			</form>
			{#if form?.generatedRedeemCode}
				<div class="alert alert-success mb-6">
					<div>
						<div class="font-semibold">Redeem code generated:</div>
						<div class="font-mono text-lg p-2 rounded mt-2 select-all">
							{window.location.protocol}//{window.location
								.host}/giveaway?code={form.generatedRedeemCode}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
