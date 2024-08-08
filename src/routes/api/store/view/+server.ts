import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from '$env/dynamic/private';

const ddb = new DynamoDBClient({region: "us-east-1"});

/** @type {import('./$types').RequestHandler} */
export async function POST({ url }) {
	const store = url.searchParams.get('store');
	const compact = url.searchParams.get('compact') ?? false;
	try {
		await ddb.send(new UpdateCommand({
			TableName: env.AWS_STORE_TABLE_NAME,
			Key: {
				'pk': `store-view#${store}#${compact}`,
				'sk': `${new Date().toISOString().split('T')[0]}`
			},
			UpdateExpression: 'set #counter = if_not_exists(#counter, :init) + :inc',
			ExpressionAttributeValues: {
				':inc': 1,
				':init': 0
			},
			ExpressionAttributeNames: {
				'#counter': 'counter'
			}
		}));
	} catch (e) {
		console.error('store-view', {store}, e);
	}
	return new Response(null, { status: 200 });
}