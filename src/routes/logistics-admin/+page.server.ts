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

	const requests = await getPaginatedResults(async (ExclusiveStartKey: any) => {
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

	requests.sort((a: any, b: any) => a.created - b.created);

	const outs = await getPaginatedResults(async (ExclusiveStartKey: any) => {
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


	const mr = requests.map((c: any) => {
		return {
			...c,
			// todo: after deploying new version where we set the characterId on the request, remove this
			characterId: +(c.sk.split('#').pop() ?? -1)
		};
	});

	// concat two arrays
	const characterIds: number[] = [];
	characterIds.push(...outs.map((o: any) => o.characterId));
	characterIds.push(...mr.map((o: any) => o.characterId));

	const uniqueCharacterIds = [...new Set(characterIds)];

	const characters = (await axios.post(`https://esi.evetech.net/v3/universe/names`, uniqueCharacterIds)).data
		.filter((r: any) => r.category === 'character')
		.sort((a, b) => a.name.localeCompare(b.name));

	return {
		characterId,
		characterName: name,
		token,
		iat,
		requests: mr,
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