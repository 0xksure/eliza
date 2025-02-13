import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { findAiCharacterPDA, findAppAinftPDA } from './utils';
import { ClientInterface, Runtime, Message } from '@elizaos/core';

export interface AinftClientConfig {
    programId: string;
    cluster: string;
    payer: Keypair;
}

export class AinftClientInterface implements ClientInterface {
    private connection: Connection;
    private provider: AnchorProvider;
    private program: Program;
    private appAinftPda: PublicKey;
    private runtime: Runtime;

    constructor(config: AinftClientConfig) {
        this.connection = new Connection(config.cluster);
        this.provider = new AnchorProvider(
            this.connection,
            new Wallet(config.payer),
            { commitment: 'confirmed' }
        );
        // Program will be initialized in start()
    }

    static async start(runtime: Runtime): Promise<AinftClientInterface> {
        const config = {
            programId: process.env.AINFT_PROGRAM_ID!,
            cluster: process.env.SOLANA_CLUSTER_URL!,
            payer: Keypair.fromSecretKey(
                Buffer.from(JSON.parse(process.env.PAYER_KEYPAIR!))
            ),
        };

        const client = new AinftClientInterface(config);
        client.runtime = runtime;

        // Initialize program and PDA
        const programId = new PublicKey(config.programId);
        client.program = await Program.at(programId, client.provider);
        [client.appAinftPda] = findAppAinftPDA();

        return client;
    }

    async handleMessage(message: Message): Promise<void> {
        try {
            // Get the AI character PDA from the message
            const [aiCharacter] = findAiCharacterPDA(message.characterId);

            // Fetch the message account
            const messageAccount = await this.program.account.message.fetch(message.id);

            // Generate response using the runtime
            const response = await this.runtime.generateResponse(message);

            // Write response on-chain
            await this.program.methods
                .writeResponse({
                    content: response.content,
                    actions: response.actions || [],
                })
                .accounts({
                    message: message.id,
                    aiNft: this.appAinftPda,
                    aiCharacterNft: aiCharacter,
                    aiCharacterComputeTokenAccount: messageAccount.computeTokenAccount,
                    stakedTokenAccount: messageAccount.stakedTokenAccount,
                    executionClient: messageAccount.executionClient,
                    computeMint: messageAccount.computeMint,
                    executionClientComputeTokenAddress: messageAccount.executionClientComputeTokenAddress,
                    authority: this.provider.wallet.publicKey,
                    tokenAAccount: null,
                    tokenBAccount: null,
                    poolProgram: null,
                })
                .rpc();

        } catch (error) {
            console.error('Error handling message:', error);
            throw error;
        }
    }

    async sendMessage(content: string, characterId: string): Promise<string> {
        try {
            // Get the AI character PDA
            const [aiCharacter] = findAiCharacterPDA(characterId);

            // Get the message count for the PDA derivation
            const aiCharacterAccount = await this.program.account.aiCharacterNft.fetch(aiCharacter);
            const messageCount = aiCharacterAccount.messageCount;

            // Derive the message account PDA
            const [messageAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("message"),
                    this.appAinftPda.toBuffer(),
                    aiCharacter.toBuffer(),
                    messageCount.toArrayLike(Buffer, 'le', 8)
                ],
                this.program.programId
            );

            // Send the message on-chain
            await this.program.methods
                .sendMessage(content)
                .accounts({
                    message: messageAccount,
                    aiNft: this.appAinftPda,
                    aiCharacter: aiCharacter,
                    computeToken: aiCharacterAccount.computeTokenAccount,
                    sender: this.provider.wallet.publicKey,
                })
                .rpc();

            return messageAccount.toString();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
} 