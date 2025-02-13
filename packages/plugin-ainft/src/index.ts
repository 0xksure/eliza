import { Plugin, Action, Runtime } from '@elizaos/core';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

interface ReadCharacterConfigAction extends Action {
    type: 'READ_CHARACTER_CONFIG';
    payload: {
        programId: string;
        appAinftAddress: string;
        characterName: string;
    };
}

interface CharacterConfig {
    name: string;
    clients: string[];
    modelProvider: string;
    voiceSettings: {
        model: string;
    };
    bio: string[];
    lore: string[];
    knowledge: string[];
    topics: string[];
    style: {
        tone: string;
        writing: string;
    };
    adjectives: string[];
}

const readCharacterConfig: Action = {
    name: 'READ_CHARACTER_CONFIG',
    description: 'Read the configuration of an AI character from the chain',
    parameters: {
        type: 'object',
        properties: {
            programId: { type: 'string', description: 'The Solana program ID of the AINFT program' },
            appAinftAddress: { type: 'string', description: 'The address of the app AINFT PDA' },
            characterName: { type: 'string', description: 'The name of the AI character' }
        },
        required: ['programId', 'appAinftAddress', 'characterName']
    },
    execute: async (runtime: Runtime, action: ReadCharacterConfigAction) => {
        const { programId, appAinftAddress, characterName } = action.payload;

        // Initialize connection and provider
        const connection = new Connection(process.env.SOLANA_CLUSTER_URL || 'http://localhost:8899');
        const provider = new AnchorProvider(connection, {
            publicKey: PublicKey.default,
            signTransaction: async () => { throw new Error('Not implemented'); },
            signAllTransactions: async () => { throw new Error('Not implemented'); }
        }, { commitment: 'confirmed' });

        // Initialize program
        const program = await Program.at(new PublicKey(programId), provider);

        // Find the AI character PDA
        const [aiCharacterMint] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("ai_character_mint"),
                new PublicKey(appAinftAddress).toBuffer(),
                Buffer.from(characterName)
            ],
            program.programId
        );

        const [aiCharacter] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("ai_character"),
                aiCharacterMint.toBuffer()
            ],
            program.programId
        );

        try {
            // Fetch the character account
            const characterAccount = await program.account.aiCharacterNft.fetch(aiCharacter);

            // Convert byte arrays back to strings
            const byteArrayToString = (arr: number[]): string => {
                return new TextDecoder().decode(new Uint8Array(arr)).replace(/\0/g, '');
            };

            const config: CharacterConfig = {
                name: byteArrayToString(characterAccount.characterConfig.name),
                clients: characterAccount.characterConfig.clients
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0),
                modelProvider: byteArrayToString(characterAccount.characterConfig.modelProvider),
                voiceSettings: {
                    model: byteArrayToString(characterAccount.characterConfig.settings.voice.model)
                },
                bio: characterAccount.characterConfig.bio
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0),
                lore: characterAccount.characterConfig.lore
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0),
                knowledge: characterAccount.characterConfig.knowledge
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0),
                topics: characterAccount.characterConfig.topics
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0),
                style: {
                    tone: byteArrayToString(characterAccount.characterConfig.styleAll[0]),
                    writing: byteArrayToString(characterAccount.characterConfig.styleChat[0])
                },
                adjectives: characterAccount.characterConfig.adjectives
                    .map((bytes: number[]) => byteArrayToString(bytes))
                    .filter((s: string) => s.length > 0)
            };

            return config;
        } catch (error) {
            console.error('Error reading character config:', error);
            throw error;
        }
    }
};

export const ainftPlugin: Plugin = {
    name: 'ainft',
    description: 'Plugin for reading AI character configurations from Solana',
    actions: [readCharacterConfig]
}; 