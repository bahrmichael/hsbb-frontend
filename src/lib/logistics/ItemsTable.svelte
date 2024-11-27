<script lang="ts">
	import { formatValue } from '$lib/isk-formatting.ts';
	import { countDays, getDaysClass } from '$lib/logistics/utilities.ts';

	export let items: {
		typeName: string,
		typeId: number,
		amount: number,
		updated: Date,
		volume: number,
	}[] = [];

	const totalVolume = items
		.map((i) => i.amount * i.volume)
		.reduce((a, b) => a + b, 0);
	const roundedTotalVolume = Math.floor(totalVolume * 100) / 100
</script>

<table class="w-full table-auto">
	<thead>
	<tr class="border-b">
		<th colspan="2" class="px-4 py-2 text-left">Item</th>
		<th class="px-4 py-2 text-right">Quantity</th>
		<th class="px-4 py-2 text-right">Volume (total)</th>
		<th class="px-4 py-2 text-right">Days Held</th>
	</tr>
	</thead>
	<tbody class="border-b">
	{#each items as item}
		<tr class="">
			<td class="px-4 py-2 w-24">
				<img src={`https://images.evetech.net/types/${item.typeId}/icon?size=32`} alt={item.typeName}
						 class="w-8 h-8" />
			</td>
			<td class="px-4 py-2">{item.typeName}</td>
			<td class="px-4 py-2 text-right">{formatValue(item.amount, true)}</td>
			<td class="px-4 py-2 text-right">{formatValue(item.amount * item.volume, true)} m3</td>
			<td class="px-4 py-2 text-right">
				<span class={getDaysClass(countDays(item.updated))}>
					{countDays(item.updated)}
				</span>
			</td>
		</tr>
	{/each}
	</tbody>
	<tfoot>
		<tr class="">
			<td class="px-4 py-2"></td>
			<td class="px-4 py-2"></td>
			<td class="px-4 py-2"></td>
			<td class="px-4 py-2 text-right">{formatValue(roundedTotalVolume, true)} m3</td>
			<td class="px-4 py-2"></td>
		</tr>
	</tfoot>
</table>