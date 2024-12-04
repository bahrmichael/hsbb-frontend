import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';
import axios from 'axios';

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
				created: new Date().getTime(),
				version: '2'
			}
		}));
		await ddb.send(new PutCommand({
			TableName: env.AWS_LOGISTICS_TABLE_NAME,
			Item: {
				pk: `participants`,
				sk: `character#${characterId}`,
				characterId,
				created: new Date().getTime(),
				timeToLive: Math.floor(new Date().getTime() / 1000 + 90 * 24 * 60 * 60),
				version: '2'
			}
		}));
		try {
			await axios.post(env.DISCORD_WEBHOOK!, {
				content: `We received a new contract request.`
			}, { headers: { 'Content-Type': 'application/json' }});
		} catch (e) {
			console.error('Failed to send request to discord.', e)
		}
		return new Response(JSON.stringify({ result: 'created' }), { status: 200 });
	}
}