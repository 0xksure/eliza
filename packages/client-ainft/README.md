# @elizaos/client-ainft

A Solana AI NFT client for Eliza that enables interaction with AI NFTs on the Solana blockchain.

## Installation

```bash
pnpm add @elizaos/client-ainft
```

## Configuration

The client requires the following environment variables:

```env
AINFT_PROGRAM_ID=your_program_id
SOLANA_CLUSTER_URL=your_cluster_url
PAYER_KEYPAIR=your_base58_encoded_keypair
```

## Usage

```typescript
import { AinftClientInterface } from '@elizaos/client-ainft';
import { Runtime } from '@elizaos/core';

// Initialize the runtime
const runtime = new Runtime();

// Start the client
const client = await AinftClientInterface.start(runtime);

// Send a message
const messageId = await client.sendMessage('Hello AI!', 'character_id');

// Handle incoming messages
client.handleMessage({
  id: messageId,
  characterId: 'character_id',
  content: 'Hello AI!',
  timestamp: Date.now(),
});
```

## Features

- Send messages to AI NFTs on Solana
- Handle responses from AI NFTs
- Manage compute token staking and rewards
- Integrate with Eliza's runtime for AI processing

## Security

The client uses Solana's native security features including:
- PDAs for secure account derivation
- Transaction signing for all operations
- Compute token management for rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 