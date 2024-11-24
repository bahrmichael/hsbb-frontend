import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

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

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return {
			requiresSignIn: true,
		};
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	const ddbQueryParams = {
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		KeyConditionExpression: 'pk = :pk',
		ExpressionAttributeValues: {
			':pk': `character#${characterId}`
		}
	};

	const records = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({ ExclusiveStartKey, ...ddbQueryParams }));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items,
		};
	});

	const transactions = records
		.filter((r: any) => r.sk.startsWith('transaction#'))
		.filter((r: any) => r.amount !== 0)
			.sort((a: any, b: any) => b.created - a.created);

	const mostRecentRewardSk = (transactions
		.filter((r: any) => r.transactionType === 'reward')
		.sort((a: any, b: any) => b.created - a.created)
		.pop())?.sk ?? 'transaction#0';

	const remainingContractCollateral = transactions
		.filter((r: any) => r.transactionType.startsWith('contract'))
		.filter((r: any) => r.sk > mostRecentRewardSk)
		.map((r: any) => r.amount)
		.reduce((a: any, b: any) => a + b, 0);

	// @ts-ignore
	const balance = transactions[0]?.balance ?? 0;

	// @ts-ignore
	const outstandingContracts = records.find((r: any) => r.sk === 'outstandingContracts')?.contracts ?? [];
	for (const c of outstandingContracts ) {
		c.locationName = await getLocationName(c.start_location_id);
	}

	const existingContractRequest = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `requests`,
			sk: `character#${characterId}`
		}
	}))).Item;

	return {
		characterId,
		characterName: name,
		token,
		iat,
		hasContractRequest: !!existingContractRequest,
		balance,
		transactions,
		remainingContractCollateral,
		outstandingContracts,
		pendingItems: records
			.filter((r: any) => r.sk.startsWith('item#'))
			.filter((r: any) => r.amount !== 0)
			.sort((a: any, b: any) => a.typeName.localeCompare(b.typeName))
			.map((r: any) => {
				return {
					...r,
					price: 0,
				}
			})
	};
}

const getPaginatedResults = async(fn: any) => {
	const EMPTY = Symbol("empty");
	const res = [];
	for await (const lf of (async function* () {
		let NextMarker = EMPTY;
		let count = 0;
		while (NextMarker || NextMarker === EMPTY) {
			const {marker, results, count: ct} =
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