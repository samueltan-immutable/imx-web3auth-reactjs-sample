import * as dotenv from 'dotenv'
dotenv.config()

export function getEnv(
    name: string,
    defaultValue: string | undefined = undefined,
  ): string {
    const value = process.env[name];
  
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable '${name}' not set`);
  }