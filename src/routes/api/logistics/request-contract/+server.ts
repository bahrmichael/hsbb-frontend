import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	const { characterId } = await decodeJwt(token, 'token-v1');
	const { value: requestedValue } = await request.json();

	const existingRecord = (await ddb.send(new GetCommand({
		TableName: env.AWS_LOGISTICS_TABLE_NAME,
		Key: {
			pk: `requests`,
			sk: `character#${characterId}`
		}
	}))).Item;

	if (existingRecord) {
		await ddb.send(new UpdateCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Key: {
				pk: `requests`,
				sk: `character#${characterId}`
			},
			UpdateExpression: 'SET #value = :value',
			ExpressionAttributeNames: {
				'#value': 'value'
			},
			ExpressionAttributeValues: {
				':value': requestedValue
			}
		}));
		return new Response(JSON.stringify({ result: 'updated' }), { status: 200 });
	} else {
		await ddb.send(new PutCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Item: {
				pk: `requests`,
				sk: `character#${characterId}`,
				value: requestedValue,
				characterId,
				created: new Date().toISOString()
			}
		}));
		return new Response(JSON.stringify({ result: 'created' }), { status: 200 });
	}
}