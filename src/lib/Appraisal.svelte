<script lang="ts">
	import SellingPoints from '$lib/SellingPoints.svelte';
	import AppraisalInfo from '$lib/AppraisalInfo.svelte';
	import AppraisalTotals from '$lib/AppraisalTotals.svelte';
	import AppraisalWarnings from '$lib/AppraisalWarnings.svelte';
	import AppraisalTable from '$lib/AppraisalTable.svelte';
	import { onMount } from 'svelte';
	import { getInstance } from '$lib/instance';
	import Markee from '$lib/Markee.svelte';
	import ErrorIcon from '$lib/icons/Error.svelte';
	import * as jwt from 'jose';

	type RejectionCode = 'bad_isk_per_m3' | 'contains_capital';

	interface AppraisalResult {
		appraisalFailures: string | null;
		rejectionCodes: RejectionCode[] | null;
		items: {
			typeId: number;
			typeName: string;
			quantity: number;
			buybackPrice: number;
			effectiveRate: number;
			volumePerUnit: number;
			pricingReasons: string[];
		}[];
		total: number;
	}

	let appraisalResult: AppraisalResult;

	let calculatorInput: string;
	let isSignedIn: boolean = false
	let isHsbb = true;
	let showMarkee = false;

	onMount(() => {
		const token = localStorage.getItem('token-v1')
		isSignedIn = !!token;
		if (token) {
			try {
				const decoded = jwt.decodeJwt(token);
				// If the token was issued at least 30 days ago
				if (decoded.iat && decoded.iat * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 30) {
					showMarkee = true;
				}
			} catch (e) {
				// I don't want anything to crash if we can't decode the token.
				console.log('Failed to decode token', e);
			}
		}
		isHsbb = getInstance() === 'highsec';
		const rememberedText = localStorage.getItem('remember-text');
		if (rememberedText) {
			calculatorInput = rememberedText;
			localStorage.removeItem('remember-text');
		}
	})

	let isLoadingAppraisal = false;
	let appraisalError: string | null;

	async function submit() {
		appraisalError = null;
		if (!calculatorInput || calculatorInput.length < 3) {
			appraisalError = "Enter at least 3 characters into the calculator";
			return
		}
		const api = `https://5aa6btweli.execute-api.us-east-1.amazonaws.com/dev/appraise`;
		const token = localStorage.getItem('token-v1');
		isLoadingAppraisal = true;
		try {
			const payload: any = {subdomain: getInstance(), text: calculatorInput};
			const referrer = localStorage.getItem('referrer');
			if (referrer) {
				payload.referrer = referrer;
			}
			const headers: any = {
				Authorization: `Bearer ${token}`
			};
			const response = await fetch(api, {
				method: 'post',
				body: JSON.stringify(payload),
				headers,
			});
			const data = await response.json();
			if (data.code === 'too_many_items') {
				appraisalError = "Too many lines. Maximum 500 allowed.";
			} else if (data.code) {
				appraisalError = "Unhandled error: " + data.code;
			} else {
				appraisalResult = {
					appraisalFailures: data.appraisalFailures,
					rejectionCodes: data.rejectionCodes,
					total: data.total,
					items: data.items.map((item: any) => {
						return {
							typeId: item.typeId,
							typeName: item.typeName,
							quantity: item.quantity,
							buybackPrice: item.buybackPriceForStack,
							effectiveRate: item.buybackRate * 100,
							pricingReasons: item.pricingReasons,
							volumePerUnit: item.volumePerUnit,
						};
					}),
				};
			}
		} catch (e) {
			console.log({e});
			appraisalError = 'Failed to appraise the items. Please try again in 5 minutes or later.';
		} finally {
			isLoadingAppraisal = false;
		}
	}

	async function signin() {
		// remember text, and repopulate when coming back from login
		localStorage.setItem('remember-text', calculatorInput);
		// send to eve sso
		const instance = getInstance();
		let clientId;
		switch (instance) {
			case 'highsec':
				clientId = '7817dc406c90427db9d3570bb3cc495b';
				break;
			case 'lowsec':
				clientId = '542b75e8f71c4fb8aec7d58cdbc1fba5';
				break;
			default:
				throw Error('Unhandled instance. ClientId resolution.');
		}
		window.location.replace(`https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${encodeURIComponent(`https://${instance}.evebuyback.com/callback`)}&client_id=${clientId}&state=nah`);
	}
</script>

<div class="mb-6">
	<div class="card lg:card-side bg-neutral shadow-xl">
		<AppraisalInfo />
		<div class="card-body">
			<span class="font-bold text-2xl">Appraise your items</span>
			<textarea class="textarea textarea-bordered w-full" placeholder="Tritanium x10" rows="9"
								bind:value={calculatorInput}></textarea>
			<div class="flex justify-between">
				<span class="text-sm text-base-content">Paste the items from your inventory above.</span>
			</div>
			<div class="card-actions justify-end">
				{#if appraisalError}
					<div role="alert" class="alert alert-error w-3/4">
						<ErrorIcon />
						<span>{appraisalError}</span>
					</div>
				{/if}
				<button class="btn" on:click={() => calculatorInput = ""}>Clear</button>
				{#if isSignedIn}
					<button class="btn btn-primary text-gray-100" on:click={submit} disabled={isLoadingAppraisal}>
						{#if isLoadingAppraisal}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Submit
					</button>
				{:else}
					<div class="tooltip tooltip-info" data-tip="We require sign in to protect our server from malicious scripts.">
						<button class="btn btn-primary text-gray-100" on:click={signin}>Sign in to enable the calculator</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="grid grid-cols-3 gap-4 mt-4">
		<div class="col-span-1">
			<div>
				{#if showMarkee}
					<Markee />
				{/if}
				{#if isHsbb}
					<SellingPoints />
				{/if}
			</div>
		</div>
		<div class="col-span-2">
			{#if appraisalResult != null}
				<div class="card bg-neutral shadow-xl">
					<div class="card-body">
						<AppraisalTotals total={appraisalResult.total} />
						<AppraisalWarnings appraisalFailures={appraisalResult.appraisalFailures ?? ""}
															 rejectionCodes={appraisalResult.rejectionCodes ?? []} />
						<AppraisalTable items={appraisalResult.items ?? []} />
					</div>
				</div>
			{:else}
				<div class="card bg-neutral shadow-xl">
					<div class="card-body">
						<h2 class="card-title">Appraise your items to get a quote!</h2>
						<p>A quote and detailed list will appear here.</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>