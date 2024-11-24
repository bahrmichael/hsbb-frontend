import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';
import { error } from '@sveltejs/kit';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request, params }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, iat } = await decodeJwt(token, 'token-v1');

	if (characterId !== 93475128) {
		throw error(403, 'Forbidden');
	}

	const targetId = params.characterId;
	if (!targetId) {
		throw error(400, 'Can\'t resolve characterId from path.');
	}

	const records = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `character#${targetId}`
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

	const outstandingContracts = records.find((r: any) => r.sk.startsWith('outstandingContracts'))?.contracts ?? [];

	// @ts-ignore
	const balance = transactions[0]?.balance ?? 0;

	let name = 'Unknown';
	try {
		const characters = (await axios.post(`https://esi.evetech.net/v3/universe/names`, [+targetId])).data
			.filter((r: any) => r.category === 'character') ?? {};
		name = characters[0].name;
	} catch (e) {
		// noop
		console.log('failed', request.url, targetId);
	}

	return {
		characterId,
		characterName: 'Admin',
		token,
		iat,
		records: records.filter((r: any) => !r.sk.startsWith('outstandingContracts') && !r.sk.startsWith('item#') && !r.sk.startsWith('transaction#') && !r.sk.startsWith('contract')),
		outstandingContracts,
		transactions,
		remainingContractCollateral,
		balance,
		name,
		pendingItems: records
			.filter((r: any) => r.sk.startsWith('item#'))
			.filter((r: any) => r.amount !== 0)
			.sort((a: any, b: any) => a.typeName.localeCompare(b.typeName))
			.map((r: any) => {
				return {
					...r,
					price: 0
				};
			})
	};
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