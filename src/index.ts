import * as core from '@actions/core';

interface ProcessedValue {
  key: string;
  value: string | number | boolean;
  path: string[];
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const encodedSecret = core.getInput('secret', { required: true });
    const exposeValues = core.getInput('expose-values')
      .split(',')
      .map(key => key.trim())
      .filter(Boolean);

    // Decode base64
    let decodedString: string;
    try {
      decodedString = Buffer.from(encodedSecret, 'base64').toString('utf-8');
    } catch (error) {
      throw new Error('Failed to decode base64 string');
    }

    // Parse JSON
    let parsedJson: Record<string, any>;
    try {
      parsedJson = JSON.parse(decodedString);
    } catch (error) {
      throw new Error('Failed to parse JSON string');
    }

    // Process all values recursively
    const processedValues: ProcessedValue[] = [];
    
    function processObject(obj: Record<string, any>, path: string[] = []): void {
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) continue;

        if (typeof value === 'object' && !Array.isArray(value)) {
          processObject(value, [...path, key]);
        } else {
          processedValues.push({
            key,
            value: value,
            path: [...path]
          });
        }
      }
    }

    processObject(parsedJson);

    // Set outputs and mask values
    processedValues.forEach(({ key, value, path }) => {
      const stringValue = String(value);
      
      // Mask sensitive values
      core.setSecret(stringValue);

      // Set as output if in expose-values
      if (exposeValues.includes(key)) {
        core.setOutput(key, value);
      }

      // Set environment variable
      const envKey = [...path, key]
        .join('_')
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_');
      core.exportVariable(envKey, stringValue);
    });

    // Set complete JSON as output (masked)
    const outputJson = JSON.stringify(parsedJson);
    core.setSecret(outputJson);
    core.setOutput('json', outputJson);

    // Set list of parsed values
    core.setOutput('parsed-values', Object.keys(parsedJson).join(','));

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();
