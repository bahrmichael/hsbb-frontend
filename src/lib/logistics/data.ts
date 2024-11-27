import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import axios from 'axios';
import { error } from '@sveltejs/kit';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

async function getItemInfo(typeId: number) {
	const existingInfo = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `item`,
			sk: `typeId#${typeId}`
		}
	}))).Item;
	if (existingInfo) {
		return existingInfo;
	}

	const d = (await axios.get(`https://esi.evetech.net/latest/universe/types/${typeId}/`)).data;
	await ddb.send(new PutCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Item: {
			...d,
			pk: `item`,
			sk: `typeId#${typeId}`,
		}
	}));

	return d;
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
		},
	}));

	return station.data.name;
}

export async function loadCharacterData(characterId: number) {
	const records: any & {created: Date} = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `character#${characterId}`
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
		.filter((r: any) => r.amount !== 0)
		.sort((a: any, b: any) => b.created - a.created);

	const mostRecentRewardDate = (transactions
		.filter((r: any) => r.transactionType === 'reward')
		.sort((a: any, b: any) => b.created - a.created)[0])?.created ?? 0;

	const remainingContractCollateral = transactions
		.filter((r: any) => r.transactionType.startsWith('contract'))
		.filter((r: any) => r.created > mostRecentRewardDate)
		.map((r: any) => r.amount)
		.reduce((a: any, b: any) => a + b, 0);

	const outstandingContracts = records.find((r: any) => r.sk === 'outstandingContracts')?.contracts ?? [];
	for (const c of outstandingContracts ) {
		c.locationName = await getLocationName(c.start_location_id);
	}

	// @ts-ignore
	const balance = transactions[0]?.balance ?? 0;

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

	const typeIds: number[] = [...new Set(pendingItems.map(i => i.typeId))] as number[];
	const itemInfoPromises: Promise<any>[] = [];
	for (const typeId of typeIds) {
		itemInfoPromises.push(getItemInfo(typeId));
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