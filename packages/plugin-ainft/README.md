# @elizaos/plugin-ainft

A Solana AI NFT plugin for Eliza that enables reading AI character configurations from the blockchain.

## Installation

```bash
pnpm add @elizaos/plugin-ainft
```

## Configuration

The plugin requires the following environment variable:

```env
SOLANA_CLUSTER_URL=your_cluster_url # Optional, defaults to http://localhost:8899
```

## Usage

1. Import and register the plugin in your character configuration:

```typescript
import { ainftPlugin } from '@elizaos/plugin-ainft';

const character = {
  // ... other character config
  plugins: [ainftPlugin]
};
```

2. Use the plugin to read character configurations:

```typescript
// Read character configuration
const config = await runtime.execute({
  type: 'READ_CHARACTER_CONFIG',
  payload: {
    programId: 'your_program_id',
    appAinftAddress: 'your_app_ainft_address',
    characterName: 'AI Character #1'
  }
});

// The config object contains:
console.log(config);
// {
//   name: string;
//   clients: string[];
//   modelProvider: string;
//   voiceSettings: {
//     model: string;
//   };
//   bio: string[];
//   lore: string[];
//   knowledge: string[];
//   topics: string[];
//   style: {
//     tone: string;
//     writing: string;
//   };
//   adjectives: string[];
// }
```

## Actions

### READ_CHARACTER_CONFIG

Reads the configuration of an AI character from the chain.

Parameters:
- `programId` (required): The Solana program ID of the AINFT program
- `appAinftAddress` (required): The address of the app AINFT PDA
- `characterName` (required): The name of the AI character

Returns the complete character configuration including:
- Name
- Supported client types
- Model provider
- Voice settings
- Biography
- Lore/background
- Knowledge areas
- Topics
- Writing style
- Character traits/adjectives

## Security

The plugin uses Solana's native security features:
- PDAs for secure account derivation
- Read-only operations for safe data access

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 