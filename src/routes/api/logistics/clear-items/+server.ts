import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import { ulid } from 'ulid';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { name } = await decodeJwt(token, 'token-v1');

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

	const { value: amount } = await request.json();
	console.log({ amount });

	const collateral = (await getMostRecentCollateral(+characterIdParam))?.collateral ?? 0;

	// add a transaction
	const balance = (await getMostRecentBalance(+characterIdParam))?.balance ?? 0;
	const newBalance = balance + amount;
	await ddb.send(
		new PutCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Item: {
				pk: `character#${characterIdParam}`,
				sk: `transaction#${ulid()}`,
				transactionType: 'itemsCleared',
				amount,
				balance: newBalance,
				collateral,
				created: Date.now(),
				version: '2'
			}
		})
	);

	// clear items
	const records =
		(await getPaginatedResults(async (ExclusiveStartKey: any) => {
			const queryResponse = await ddb.send(
				new QueryCommand({
					ExclusiveStartKey,
					...{
						TableName: env.AWS_LOGISTICS_TABLE_NAME,
						KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
						ExpressionAttributeValues: {
							':pk': `character#${characterIdParam}`,
							':sk': 'item#'
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

	await attemptCollateralTransfer(+characterIdParam, new Date());

	return new Response(null, { status: 200 });
}

type Transaction = any;

async function getMostRecentCollateral(characterId: number): Promise<Transaction> {
	return (
		(
			await ddb.send(
				new QueryCommand({
					TableName: env.AWS_LOGISTICS_TABLE_NAME,
					KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
					FilterExpression: '#version = :v',
					ExpressionAttributeValues: {
						':pk': `character#${characterId}`,
						':sk': 'transaction#',
						':v': '2'
					},
					ExpressionAttributeNames: {
						'#version': 'version'
					},
					ConsistentRead: true,
					ScanIndexForward: false
				})
			)
		).Items ?? []
	).filter(
		(r) =>
			r.transactionType === 'contractOut' ||
			r.transactionType === 'contractIn' ||
			r.transactionType === 'collateralTransfer' ||
			r.transactionType === 'itemsCleared'
	)[0];
}

async function getMostRecentBalance(characterId: number): Promise<Transaction> {
	return ((
		await ddb.send(
			new QueryCommand({
				TableName: env.AWS_LOGISTICS_TABLE_NAME,
				KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
				FilterExpression: '#version = :v and attribute_exists(balance)',
				ExpressionAttributeValues: {
					':pk': `character#${characterId}`,
					':sk': 'transaction#',
					':v': '2'
				},
				ExpressionAttributeNames: {
					'#version': 'version'
				},
				ConsistentRead: true,
				ScanIndexForward: false
			})
		)
	).Items ?? [])[0];
}

async function addCollateralTransfer(characterId: number, date: Date): Promise<void> {
	const recentCollateral = (await getMostRecentCollateral(characterId))?.collateral ?? 0;
	const recentBalance = (await getMostRecentBalance(characterId))?.balance ?? 0;
	const newBalance = recentBalance + recentCollateral;
	await ddb.send(
		new PutCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Item: {
				pk: `character#${characterId}`,
				sk: `transaction#${ulid()}`,
				transactionType: 'collateralTransfer',
				amount: recentCollateral,
				collateral: 0,
				balance: newBalance,
				created: date.getTime(),
				version: '2'
			}
		})
	);
}

async function attemptCollateralTransfer(characterId: number, date: Date) {
	const nonZeroItems: any[] = await getPaginatedResults(async (ExclusiveStartKey: any) => {
		const queryResponse = await ddb.send(
			new QueryCommand({
				TableName: env.AWS_LOGISTICS_TABLE_NAME,
				KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
				FilterExpression: 'amount <> :a and #version = :v',
				ExpressionAttributeValues: {
					':pk': `character#${characterId}`,
					':sk': `item#`,
					':a': 0,
					':v': '2'
				},
				ExpressionAttributeNames: {
					'#version': 'version'
				},
				ExclusiveStartKey
			})
		);

		return {
			marker: queryResponse.LastEvaluatedKey,
			results: queryResponse.Items
		};
	});

	if (nonZeroItems.length > 0) {
		return;
	}

	console.log('Starting collateral transfer', { characterId });

	await addCollateralTransfer(characterId, date);
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
