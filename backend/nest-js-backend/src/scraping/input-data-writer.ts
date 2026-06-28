import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * Saves one normalized model-input snapshot for fine-tuning data collection.
 *
 * By default files go to backend/nest-js-backend/inputData. Set INPUT_DATA_DIR
 * when running in Docker or when you want to collect examples somewhere else.
 */
export async function saveVacationModelInput(modelInput: unknown) {
  const inputDataDir =
    process.env.INPUT_DATA_DIR || resolve(__dirname, '../../inputData');
  await mkdir(inputDataDir, { recursive: true });

  const fileName = `vacation-input-${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}.json`;
  const filePath = resolve(inputDataDir, fileName);

  await writeFile(filePath, `${JSON.stringify(modelInput, null, 2)}\n`, 'utf8');

  return filePath;
}
