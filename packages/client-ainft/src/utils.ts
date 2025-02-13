import { PublicKey } from '@solana/web3.js';

// The program ID should be imported from an IDL or config file
const PROGRAM_ID = new PublicKey(process.env.AINFT_PROGRAM_ID!);

export function findAppAinftPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("app_ainft")],
        PROGRAM_ID
    );
}

export function findAiCharacterPDA(characterId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("ai_character"), Buffer.from(characterId)],
        PROGRAM_ID
    );
}

export function findMasterMintPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("master_mint")],
        PROGRAM_ID
    );
}

export function findComputeMintPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("compute_mint")],
        PROGRAM_ID
    );
}

export function findMetadataPDA(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
            mint.toBuffer()
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );
} 