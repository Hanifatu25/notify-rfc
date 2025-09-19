import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.3.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Verify event creation process",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const eventTitle = "Community Governance Meeting";
        const eventDescription = "Quarterly protocol update discussion";
        const duration = 1000;
        const interactionTypes = ["proposal", "comment", "vote"];
        const minValue = 0;
        const maxValue = 5;
        const requiresAuth = true;
        const governanceEnabled = false;

        const block = chain.mineBlock([
            Tx.contractCall(
                'event-notifier', 
                'create-event', 
                [
                    types.ascii(eventTitle),
                    types.utf8(eventDescription),
                    types.uint(duration),
                    types.list(interactionTypes.map(types.ascii)),
                    types.uint(minValue),
                    types.uint(maxValue),
                    types.bool(requiresAuth),
                    types.bool(governanceEnabled)
                ],
                deployer.address
            )
        ]);

        // First block result should be an event ID
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectUint(1);
    }
});

Clarinet.test({
    name: "Verify event interaction submission", 
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const participant = accounts.get('wallet_1')!;

        // First, create an event
        chain.mineBlock([
            Tx.contractCall(
                'event-notifier', 
                'create-event', 
                [
                    types.ascii("Test Event"),
                    types.utf8("Test Description"),
                    types.uint(1000),
                    types.list([types.ascii("comment")]),
                    types.uint(0),
                    types.uint(5),
                    types.bool(false),
                    types.bool(false)
                ],
                deployer.address
            )
        ]);

        // Submit a comment to the event
        const block = chain.mineBlock([
            Tx.contractCall(
                'event-notifier', 
                'submit-comment-feedback', 
                [
                    types.uint(1),
                    types.utf8("A test comment for governance"),
                    types.bool(false)
                ],
                participant.address
            )
        ]);

        block.receipts[0].result.expectOk().expectUint(1);
    }
});