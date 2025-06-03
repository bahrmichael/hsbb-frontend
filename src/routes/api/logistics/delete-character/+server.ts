import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url, cookies }) {
	const token = cookies.get('token-v2');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { name } = await decodeJwt(token, 'token-v2');

		if (name !== 'Lerso Nardieu') {
			throw error(403, 'Forbidden');
		}
	} catch (e) {
		console.error(e);
		throw error(401, 'Unauthorized');
	}

	const characterIdParam = url.searchParams.get('characterId');
	if (!characterIdParam) {
		error(400, 'characterId is required');
	}

	const records =
		(await getPaginatedResults(async (ExclusiveStartKey: any) => {
			const queryResponse = await ddb.send(
				new QueryCommand({
					ExclusiveStartKey,
					...{
						TableName: env.AWS_LOGISTICS_TABLE_NAME,
						KeyConditionExpression: 'pk = :pk',
						ExpressionAttributeValues: {
							':pk': `character#${characterIdParam}`
						}
					}
				})
			);

			return {
				marker: queryResponse.LastEvaluatedKey,
				results: queryResponse.Items
			};
		})) ?? [];

	for (const { pk, sk } of records) {
		await ddb.send(
			new DeleteCommand({
				TableName: env.AWS_LOGISTICS_TABLE_NAME,
				Key: {
					pk,
					sk
				}
			})
		);
	}

	const outs =
		(await getPaginatedResults(async (ExclusiveStartKey: any) => {
			const queryResponse = await ddb.send(
				new QueryCommand({
					ExclusiveStartKey,
					...{
						TableName: env.AWS_LOGISTICS_TABLE_NAME,
						KeyConditionExpression: 'pk = :pk',
						ExpressionAttributeValues: {
							':pk': `out`
						}
					}
				})
			);

			return {
				marker: queryResponse.LastEvaluatedKey,
				results: queryResponse.Items
			};
		})) ?? [];

	for (const { pk, sk, characterId } of outs) {
		if (characterId === +characterIdParam) {
			await ddb.send(
				new DeleteCommand({
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					Key: {
						pk,
						sk
					}
				})
			);
		}
	}

	return new Response(null, { status: 200 });
}

const getPaginatedResults = async (fn: any) => {
	const EMPTY = Symbol('empty');
	const res = [];
	for await (const lf of (async function* () {
		let NextMarker = EMPTY;
		let count = 0;
		while (NextMarker || NextMarker === EMPTY) {
			const {
				marker,
				results,
				count: ct
			} = await fn(NextMarker !== EMPTY ? NextMarker : undefined, count);

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
