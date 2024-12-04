import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';
import { error } from '@sveltejs/kit';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	if (name !== 'Lerso Nardieu') {
		throw error(403, 'Forbidden');
	}

	const contractRequests = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `requests`
					}
				}
			}));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	}) ?? [];

	contractRequests.sort((a: any, b: any) => a.created - b.created);

	const payoutRequests: any[] = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `payoutRequests`
					}
				}
			}));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	}) ?? [];

	payoutRequests.sort((a: any, b: any) => a.created - b.created);

	for (const payoutRequest of payoutRequests) {
		const rewards = ((await ddb.send(new QueryCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			KeyConditionExpression: `pk = :pk and begins_with(sk, :sk)`,
			FilterExpression: 'transactionType = :r',
			ExpressionAttributeValues: {
				':pk': `character#${payoutRequest.characterId}`,
				':sk': 'transaction#',
				':r': 'reward'
			},
			ScanIndexForward: false
		}))).Items ?? []).sort((a: any, b: any) => b.created - a.created);

		payoutRequest.value = rewards[0]?.balance ?? 0;
	}

	const participants: {characterId: number}[] = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `participants`
					}
				}
			}));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	}) ?? [];

	// todo: drop the outs once enough participant records have been added
	const outs: {characterId: number}[] = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb
			.send(new QueryCommand({
				ExclusiveStartKey, ...{
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk',
					ExpressionAttributeValues: {
						':pk': `out`
					}
				}
			}));

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	}) ?? [];

	const characterIds: number[] = participants.map(p => p.characterId);
	characterIds.push(...contractRequests.map((o: any) => o.characterId));
	characterIds.push(...payoutRequests.map((o: any) => o.characterId));
	characterIds.push(...outs.map((o: any) => o.characterId));

	const uniqueCharacterIds = [...new Set(characterIds)];

	const characters = (await axios.post(`https://esi.evetech.net/v3/universe/names`, uniqueCharacterIds)).data
		.filter((r: any) => r.category === 'character')
		.sort((a, b) => a.name.localeCompare(b.name));

	return {
		characterId,
		characterName: name,
		token,
		iat,
		contractRequests,
		payoutRequests,
		characters
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