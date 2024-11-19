import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

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

	const balance = transactions[0]?.balance ?? 0;

	const outstandingContracts = records.find((r: any) => r.sk === 'outstandingContracts')?.contracts
		.map((r: any) => {
			return {
				...r,
				// todo: get location name
				locationName: r.start_location_id,
			}
		});

	return {
		characterId,
		characterName: name,
		token,
		iat,
		balance,
		transactions,
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
		res.push(lf);
	}

	return res;
};