# parse-base64-json
A Github Action that parses a base64 encoded JSON from a secret into the app's env. Takes care of properly masking parsed values as secrets.

## Usage

```yaml
name: Example Workflow
on:
  workflow_dispatch:

jobs:
  example-job:
    runs-on: ubuntu-latest
    steps:
      - name: Parse Secret
        uses: 7timescode/parse-base64-json@v1
        id: parser
        with:
          secret: ${{ secrets.ENCODED_JSON_SECRET }}
          expose-values: 'environment,region'  # Values you want as outputs

      - name: Use Parsed Values
        run: |
          # Access complete JSON
          echo "Using parsed JSON structure"
          
          # Access individual exposed outputs
          echo "Environment: ${{ steps.parser.outputs.environment }}"
          echo "Region: ${{ steps.parser.outputs.region }}"
          
          # Access via environment variables
          echo "Using API Key: ${{ env.API_KEY }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `secret` | Base64 encoded JSON secret | Yes | - |
| `expose-values` | Comma-separated list of top-level keys to expose as outputs | No | '' |

## Outputs

| Output | Description |
|--------|-------------|
| `json` | The complete parsed JSON (masked in logs) |
| `parsed-values` | List of successfully parsed values |

## Versions

- `@v1` - Use major version 1 (recommended)
- `@1.0.0` - Use exact version
- `@main` - Use latest code from main branch (may be unstable)

Example with specific version:
```yaml
- uses: 7timescode/parse-base64-json@1.0.0
```
