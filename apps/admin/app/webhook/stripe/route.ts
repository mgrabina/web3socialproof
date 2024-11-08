import { db, eq, protocolTable, usersTable } from "@web3socialproof/db";

export async function POST(request: Request) {
    console.log('Webhook received')
    try {
        const response = await request.json()
        console.log(response)
        // On subscribe, write to db
        console.log(response.data.object.customer)

        await db.update(protocolTable).set({ plan: response.data.object.id }).where(eq(protocolTable.stripe_id, response.data.object.customer));
        // Process the webhook payload
    } catch (error: any) {
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        })
    }
    return new Response('Success', { status: 200 })
}