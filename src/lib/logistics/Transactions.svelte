<script lang="ts">
	import { formatIsk } from '$lib/isk-formatting.ts';
	import { mapTransactionType } from '$lib/logistics/utilities.ts';

	export let transactions: {
		transactionType: string,
		amount: number,
		balance?: number,
		collateral?: number,
		created: Date,
	}[] = [];
</script>

<table class="w-full table-auto">
	<thead>
	<tr class="border-b">
		<th class="px-4 py-2 text-left">Description</th>
		<th class="px-4 py-2 text-left">Date</th>
		<th class="px-4 py-2 text-right">Amount</th>
		<th class="px-4 py-2 text-right">Collateral</th>
		<th class="px-4 py-2 text-right">Balance</th>
	</tr>
	</thead>
	<tbody>
	{#each transactions as t}
		<tr class="">
			<td class="px-4 py-2">{mapTransactionType(t.transactionType)}</td>
			<td class="px-4 py-2">{new Date(t.created).toLocaleString()}</td>
			<td class="px-4 py-2 text-right"><span
				class={t.amount >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk(t.amount, true)}</span></td>
			<td
				class="px-4 py-2 text-right">
				{#if t.collateral !== undefined}
					<span class={t.collateral >= 0 ? "text-blue-400" : "text-red-400"}>{formatIsk(t.collateral, true)}</span>
				{/if}
			</td>
			<td
				class="px-4 py-2 text-right">
				{#if t.balance !== undefined}
					<span class={t.balance >= 0 ? "text-green-400" : "text-red-400"}>{formatIsk(t.balance, true)}</span>
				{/if}
			</td>
		</tr>
	{/each}
	</tbody>
</table>