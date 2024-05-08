<script lang="ts">
	export let items: {
		typeId: number;
		typeName: string;
		quantity: number;
		buybackPrice: number;
		effectiveRate: number;
		pricingReasons: string[];
	}[] = [];
</script>

<table class="table">
	<thead>
	<tr>
		<th>Name</th>
		<th>Buyback Price</th>
		<th>Effective Rate</th>
	</tr>
	</thead>
	<tbody>
	{#each items.sort((a, b) => b.buybackPrice - a.buybackPrice) as item}
		<tr>
			<td class="text-lg">
				<div class="flex items-center gap-3">
					<div class="avatar">
						<div class="mask mask-squircle w-12 h-12">
							<img src={`https://images.evetech.net/types/${item.typeId}/icon?size=64`}
									 alt={item.typeName} />
						</div>
					</div>
					<div>
						<div class="font-bold">{item.typeName}</div>
						<div class="text-sm opacity-50">{item.quantity.toLocaleString()}x</div>
					</div>
				</div>
			</td>
			<td
				class={"text-lg" + (item.effectiveRate < 60 ? (item.effectiveRate < 30 ? " text-error" : " text-warning") : "")}>
				{item.buybackPrice.toLocaleString()} ISK
			</td>
			<td
				class={"text-lg" + (item.effectiveRate < 60 ? (item.effectiveRate < 30 ? " text-error" : " text-warning") : "")}>
				{item.effectiveRate}% Jita Buy
				{#if item.effectiveRate < 90 && item.pricingReasons?.length > 0}
					<button class="btn btn-ghost text-neutral-content ml-4" on:click={()=>document.getElementById(`modal-${item.typeId}`)?.showModal()}>Why?</button>
					<dialog id={`modal-${item.typeId}`} class="modal">
						<div class="modal-box text-neutral-content">
							<h3 class="font-bold text-lg mb-4">Effective Rate</h3>
							<p class="my-2">Some items diverge from our base rate of 90% Jita Buy. T1 Industrials for example are difficult to haul efficiently.</p>
							<p class="my-2">Below are the reasons why we price {item.typeName} at {item.effectiveRate}% Jita Buy.</p>
							<div class="my-2">
								<ul>
									{#each item.pricingReasons as reason}
										<li class="list-disc ml-4">{reason}</li>
									{/each}
								</ul>
							</div>
							<div class="modal-action">
								<form method="dialog">
									<button class="btn">Close</button>
								</form>
							</div>
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
				{/if}
			</td>
		</tr>
	{/each}
	</tbody>
</table>