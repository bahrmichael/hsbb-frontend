<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import ErrorIcon from '$lib/icons/Error.svelte';
	import { page } from '$app/stores';

	$: requiresSignIn = $page.data.requiresSignIn || !$page.data.token;

	interface PricePoint {
		'avg': number,
		'max': number,
		'median': number,
		'min': number,
		'percentile': number,
		'stddev': number,
		'volume': number,
		'order_count': number,
	}

	interface AppraisalResult {
		totals: {
			buy: number,
			sell: number,
			volume: number,
		},
		items: {
			typeID: number,
			typeName: string,
			typeVolume: number,
			quantity: number,
			prices: {
				all: PricePoint,
				buy: PricePoint,
				sell: PricePoint,
			}
		}[],
		unparsed: any,
	}

	let appraisalResult: AppraisalResult;

	let isLoadingAppraisal = false;
	let appraisalError: string | null;

	let calculatorInput: string = '';

	async function submit() {
		appraisalError = null;
		if (!calculatorInput || calculatorInput.length < 3) {
			appraisalError = 'Enter at least 3 characters into the calculator';
			return;
		}

		isLoadingAppraisal = true;
		try {
			const formData = new FormData();
			formData.append('raw_textarea', calculatorInput);

			const response = await fetch('/api/appraise', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();
			if (data.code === 'too_many_items') {
				appraisalError = 'Too many lines. Maximum 500 allowed.';
			} else if (data.code || response.status !== 200) {
				appraisalError = `Unhandled error: ${data.code} (${response.status})`;
			} else {
				appraisalResult = data;
			}
		} catch (e) {
			appraisalError = 'Failed to appraise the items. Please try again in 5 minutes or later.';
		} finally {
			isLoadingAppraisal = false;
		}
	}

	let showCheck = {
		buy: false,
		sell: false
	};

	const copyToClipboard = (value: number, type: 'buy' | 'sell') => {
		navigator.clipboard.writeText(value.toString());
		showCheck[type] = true;
		setTimeout(() => showCheck[type] = false, 1000);
	};

</script>

<style>
    .fade-out {
        animation: fadeOut 2s forwards;
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

</style>

<div id="container" class="container mx-auto">
	<Navbar />
	<div class="card-body">
		<span class="font-bold text-2xl">Appraise your items</span>
		<textarea class="textarea textarea-bordered w-full" placeholder="Enter list of items to be appraised.

Tritanium 22222
Pyerite 8000
Mexallon 2444
Isogen 500
Nocxium 2
Zydrine 4" rows="9"
							bind:value={calculatorInput}></textarea>
		<div class="flex justify-between">
			{#if appraisalResult != null && !appraisalError }
				<span class="text-sm text-success">Appraisal succeeded. Scroll down to see the result.</span>
			{/if}
		</div>
		<div class="card-actions justify-end">
			{#if appraisalError}
				<div role="alert" class="alert alert-error w-3/4">
					<ErrorIcon />
					<span>{appraisalError}</span>
				</div>
			{/if}
			{#if !requiresSignIn}
				<button class="btn btn-primary text-gray-100" on:click={submit} disabled={isLoadingAppraisal}>
					{#if isLoadingAppraisal}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Submit
				</button>
			{:else}
<!--				<div class="tooltip tooltip-info" data-tip="We require sign in to protect our server from malicious scripts.">-->
<!--					<button class="btn btn-primary text-gray-100" on:click={signin}>Sign in to enable the calculator</button>-->
<!--				</div>-->
			{/if}
		</div>
		{#if appraisalResult}
			<div class="mt-8">
				<div class="stats shadow w-full">
					<div class="stat">
						<div class="stat-title">Total Buy Value</div>
						<div class="stat-value text-info text-2xl">
							<div class="tooltip tooltip-info" data-tip={`Exact: ${appraisalResult.totals.buy.toLocaleString()} ISK`}>
								<button
									class="cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
									on:click={() => copyToClipboard(appraisalResult.totals.buy, 'buy')}
								>
									{appraisalResult.totals.buy.toLocaleString(undefined, {maximumSignificantDigits: 6})} ISK
									<span class="w-4">
                    {#if showCheck.buy}
                        <span class="fade-out">✓</span>
                    {/if}
                </span>
								</button>
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">Total Sell Value</div>
						<div class="stat-value text-success text-2xl">
							<div class="tooltip tooltip-success" data-tip={`Exact: ${appraisalResult.totals.sell.toLocaleString()} ISK`}>
								<button
									class="cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
									on:click={() => copyToClipboard(appraisalResult.totals.sell, 'sell')}
								>
									{appraisalResult.totals.sell.toLocaleString(undefined, {maximumSignificantDigits: 6})} ISK
									<span class="w-4">
										{#if showCheck.sell}
												<span class="fade-out">✓</span>
										{/if}
								</span>
								</button>
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="stat-title">Total Volume</div>
						<div class="stat-value text-2xl">{appraisalResult.totals.volume.toLocaleString()} m³</div>
					</div>
				</div>

				<div class="overflow-x-auto mt-4">
					<table class="table">
						<thead>
						<tr>
							<th>Item</th>
							<th>Name</th>
							<th>Quantity</th>
							<th>Sell Price</th>
							<th>Buy Price</th>
							<th>Volume</th>
						</tr>
						</thead>
						<tbody>
						{#each appraisalResult.items as item}
							<tr>
								<td>
									<div class="avatar">
										<div class="mask mask-squircle w-12 h-12">
											<img src={`https://images.evetech.net/types/${item.typeID}/icon?size=64`}
													 alt={item.typeName} />
										</div>
									</div>
								</td>
								<td>{item.typeName}</td>
								<td>{item.quantity.toLocaleString()}</td>
								<td>{item.prices.sell.percentile.toLocaleString()} ISK</td>
								<td>{item.prices.buy.percentile.toLocaleString()} ISK</td>
								<td>{(item.typeVolume * item.quantity).toLocaleString()} m³</td>
							</tr>
						{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

	</div>
	<Footer />
</div>
