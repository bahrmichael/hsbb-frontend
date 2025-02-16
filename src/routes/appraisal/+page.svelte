<script lang="ts">
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import ErrorIcon from '$lib/icons/Error.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FeedbackDialog from '$lib/FeedbackDialog.svelte';

	let showFeedbackDialog = false;

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

	let appraisalResult: AppraisalResult | undefined;

	let isLoadingAppraisal = false;
	let appraisalError: string | null;

	let calculatorInput: string = '';

	let pendingRequest: Promise<AppraisalResult> | null = null;
	let debounceTimer: number | undefined;

	let previousLength = 0;

	$: {
		const hasAtLeast3Letters = calculatorInput.match(/[A-Za-z]{3,}/g);
		if (hasAtLeast3Letters) {
			const manualEditAdded = calculatorInput.length === previousLength + 1;
			const manualEditRemoved = calculatorInput.length < previousLength;
			if (manualEditAdded || manualEditRemoved) {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					pendingRequest = fetchAppraisal(calculatorInput);
				}, 200);
			} else {
				// Used pasted input, submit an appraisal immediately
				pendingRequest = fetchAppraisal(calculatorInput);
			}
		}

		previousLength = calculatorInput.length;
	}

	// Extract the fetch logic into a separate function
	async function fetchAppraisal(input: string): Promise<AppraisalResult> {
		const formData = new FormData();
		formData.append('raw_textarea', input);

		const response = await fetch('/api/appraise', {
			method: 'POST',
			body: formData
		});

		const data = await response.json();
		if (data.code === 'too_many_items') {
			throw new Error('Too many lines. Maximum 500 allowed.');
		} else if (data.code || response.status !== 200) {
			throw new Error(`Unhandled error: ${data.code} (${response.status})`);
		}
		return data;
	}

	// Modify the submit function to use pending request
	async function submit() {
		appraisalError = null;
		if (!calculatorInput || calculatorInput.length < 3) {
			appraisalError = 'Enter at least 3 characters into the calculator';
			return;
		}

		isLoadingAppraisal = true;
		try {
			// Use pending request if available, otherwise make a new request
			if (pendingRequest) {
				appraisalResult = await pendingRequest;
			} else {
				appraisalResult = await fetchAppraisal(calculatorInput);
			}
		} catch (e) {
			appraisalError = e instanceof Error ? e.message : 'Failed to appraise the items. Please try again in 5 minutes or later.';
		} finally {
			isLoadingAppraisal = false;
			pendingRequest = null;
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

	let copyBuyToClipboard = false;
	onMount(() => {
		copyBuyToClipboard = localStorage.getItem('copy-buy-to-clipboard') === 'true'
	})
	$: if (appraisalResult && copyBuyToClipboard) {
		navigator.clipboard.writeText(appraisalResult.totals.buy.toString());
		showCheck.buy = true;
		setTimeout(() => showCheck.buy = false, 1000);
	}

</script>

<style>
		/*always show the scrollbar so that the content doesn't jump*/
    :global(html) {
        overflow-y: scroll;
    }

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

	<div class="lg:mx-32 xl:mx-48">

		<div role="alert" class="alert alert-info mb-10">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
			<span>We're building the fastest and most reliable appraisal for EVE Online. This tool is still in beta, and we welcome any feedback and bug reports!</span>
		</div>

		<a
			href="/appraisal"
			class="no-underline"
			on:click={() => {
    calculatorInput = '';
    appraisalResult = undefined;
    appraisalError = null;
  }}
		><span class="font-bold text-2xl text-center block mb-5">HSBB Appraisal</span>
		</a>
		<textarea class="textarea textarea-bordered w-full" placeholder="Enter list of items to be appraised.

Tritanium 22222
Pyerite 8000
Mexallon 2444
Isogen 500
Nocxium 2
Zydrine 4" rows="9"
							bind:value={calculatorInput}></textarea>
		<div class="card-actions justify-end">
			{#if appraisalResult}
				<button
					class="btn btn-ghost"
					on:click={() => showFeedbackDialog = true}>
					Report Issue
				</button>
			{/if}
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
		{#if !!appraisalResult}
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
						<div class="stat-value text-2xl">{(Math.ceil(appraisalResult.totals.volume * 100) / 100).toLocaleString()} m³</div>
					</div>
				</div>

				<div class="overflow-x-auto mt-4">
					<table class="table">
						<thead>
						<tr>
							<th>Item</th>
							<th>Name</th>
							<th>Quantity</th>
							<th>Buy Price</th>
							<th>Sell Price</th>
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
								<td>{item.prices.buy.percentile.toLocaleString()} ISK</td>
								<td>{item.prices.sell.percentile.toLocaleString()} ISK</td>
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

	<FeedbackDialog
		show={showFeedbackDialog}
		calculatorInput={calculatorInput}
		appraisalResultJson={JSON.stringify(appraisalResult)}
		onClose={() => showFeedbackDialog = false}
	/>
</div>
