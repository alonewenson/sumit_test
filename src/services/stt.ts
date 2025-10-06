import { RecordingPart, STTResult } from "../types";
import { mockDB } from "../utils/db";
import { FfmpegQueue } from "../utils/ffmpgQue";

export async function simulateSTT(part: RecordingPart): Promise<void> {
  mockDB.updateStatus(part.idRecord, part.partIndex, "stt_in_progress");

  const delay = 3000; // Math.floor(Math.random() * 11000) + 5000; // 5s to 15s
  console.log(
    `[STT][${part.idRecord}:${part.partIndex}] Starting processing (${(
      delay / 1000
    ).toFixed(1)}s delay)...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log(`[STT][${part.idRecord}:${part.partIndex}] Finished processing.`);

  mockDB.updateTextBlock(part.idRecord, part.partIndex, part.audioBlock);
  mockDB.updateStatus(part.idRecord, part.partIndex, "stt_done");

  // push to ffmpeg queue
  FfmpegQueue.add({
    idRecord: part.idRecord,
    partIndex: part.partIndex,
    textBlock: part.audioBlock
  });
}
