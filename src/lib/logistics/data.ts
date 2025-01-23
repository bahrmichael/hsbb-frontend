import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import axios from 'axios';
import { error } from '@sveltejs/kit';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

export interface TypeInfo {
	type_id: number
	name: string
	packaged_volume: number
	volume: number
}

async function getItemInfo(typeId: number): Promise<TypeInfo> {
	const existingInfo = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `item`,
			sk: `typeId#${typeId}`
		}
	}))).Item;
	if (existingInfo) {
		return existingInfo as TypeInfo;
	}

	const d = (await axios.get(`https://esi.evetech.net/latest/universe/types/${typeId}/`)).data;

	const typeInfo: TypeInfo = {
		type_id: d.type_id,
		name: d.name,
		packaged_volume: d.packaged_volume,
		volume: d.volume,
	}

	await ddb.send(new PutCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Item: {
			...typeInfo,
			pk: `item`,
			sk: `typeId#${typeId}`,
			version: '2'
		}
	}));

	return typeInfo;
}

async function getLocationName(locationId: number) {
	const res = await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `location`,
			sk: `${locationId}`,
		},
	}));

	if (res.Item) {
		return res.Item.name;
	}

	const station = await axios.get(`https://esi.evetech.net/v2/universe/stations/${locationId}/`);

	await ddb.send(new PutCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Item: {
			pk: `location`,
			sk: `${locationId}`,
			name: station.data.name,
			version: '2'
		},
	}));

	return station.data.name;
}

export async function loadCharacterData(characterId: number, limitTransactionsRecentDays: number | undefined) {
	const records: any & {created: Date} = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					FilterExpression: '#version = :v',
					ExpressionAttributeValues: {
						':pk': `character#${characterId}`,
						':v': '2'
					},
					ExpressionAttributeNames: {
						'#version': 'version',
					}
				}
			}));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	}) ?? [];

	const transactions = records
		.filter((r: any) => r.sk.startsWith('transaction#'))
		.filter((r: any) => {
			if (!limitTransactionsRecentDays) {
				return true;
			} else {
				return new Date(r.created).getTime() > (new Date().getTime() - limitTransactionsRecentDays * 24 * 60 * 60 * 1000);
			}
		})
		.sort((a: any, b: any) => b.created - a.created)

	const remainingContractCollateral = transactions
		.filter((r: any) => r.transactionType.startsWith('contract') || r.transactionType === 'collateralTransfer' || r.transactionType === 'itemsCleared')
		.sort((a: any, b: any) => b.created - a.created)[0]?.collateral ?? 0;

	const outstandingContracts = records.find((r: any) => r.sk === 'outstandingContracts')?.contracts ?? [];
	for (const c of outstandingContracts ) {
		c.locationName = await getLocationName(c.start_location_id);
	}

	const balance: number = transactions
		.filter((r: any) => r.transactionType === 'reward' || r.transactionType === 'collateralTransfer' || r.transactionType === 'payout')
		.sort((a: any, b: any) => b.created - a.created)[0]?.balance ?? 0;

	let name = 'Unknown';
	try {
		const characters = (await axios.post(`https://esi.evetech.net/v3/universe/names`, [characterId])).data
			.filter((r: any) => r.category === 'character') ?? {};
		name = characters[0].name;
	} catch (e) {
		// noop
		console.log('failed to get character name', characterId);
	}

	const pendingItems = records
		.filter((r: any) => r.sk.startsWith('item#'))
		.filter((r: any) => r.amount !== 0)
		.sort((a: any, b: any) => a.typeName.localeCompare(b.typeName));

	const itemInfoPromises: Promise<any>[] = [];
	for (const i of pendingItems) {
		itemInfoPromises.push(getItemInfo(i.typeId));
	}

	const itemInfos = await Promise.all(itemInfoPromises);
	for (const pendingItem of pendingItems) {
		const item = itemInfos.find((i: any) => i.type_id === pendingItem.typeId);
		if (!item) {
			return error(500, `Failed to get item info for ${pendingItem.typeName}. Please reload.`);
		}
		pendingItem.volume = item.packaged_volume ?? item.volume;
	}

	return {
		name,
		outstandingContracts,
		balance,
		remainingContractCollateral,
		transactions,
		pendingItems,
	}
}

const getPaginatedResults = async (fn: any) => {
	const EMPTY = Symbol('empty');
	const res = [];
	for await (const lf of (async function* () {
		let NextMarker = EMPTY;
		let count = 0;
		while (NextMarker || NextMarker === EMPTY) {
			const { marker, results, count: ct } =
				await fn(NextMarker !== EMPTY ? NextMarker : undefined, count);

			yield* results;

			// if there's no marker, then we reached the end
			if (!marker) {
				break;
			}

			NextMarker = marker;
			count = ct;
		}
	})()) {
		// @ts-ignore
		res.push(lf);
	}

	return res;
};

export async function getRequestStatus(characterId: number | string) {
	const existingContractRequest = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `requests`,
			sk: `character#${characterId}`
		}
	}))).Item;

	const existingPayoutRequest = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `payoutRequests`,
			sk: `character#${characterId}`
		}
	}))).Item;

	return {
		hasContractRequest: !!existingContractRequest,
		hasPayoutRequest: !!existingPayoutRequest,
	}
}