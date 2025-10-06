import { RecordingPart, STTResult } from "../types";
import { mockDB } from "../utils/db";
import { FfmpegQueue } from "../utils/ffmpgQue";

export async function simulateSTT(part: RecordingPart): Promise<void> {
  mockDB.updateStatus(part.idRecord, part.partIndex, "stt_in_progress");

  const delay = 3000; // Math.floor(Math.random() * 11000) + 5000; // 5s to 15s
  console.log(
    `simulateSTT [${part.idRecord}:${part.partIndex}] Starting processing (${(
      delay / 1000
    ).toFixed(1)}s delay)...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log(
    `simulateSTT [${part.idRecord}:${part.partIndex}] Finished processing.`
  );
  const text = part.audioBlock;
  mockDB.updateTextBlock(part.idRecord, part.partIndex, text);
  mockDB.updateStatus(part.idRecord, part.partIndex, "stt_done");

  // // push to ffmpeg queue
  FfmpegQueue.add(part);

  if (part.partIndex === 0) {
    mockDB.setLastDoneSTTIndex(part.idRecord, 0);
    mockDB.setTextResult(part.idRecord, text);
  }

  // get the last index that has status done
  let lastIndex = mockDB.getLastDoneSTTIndex(part.idRecord);
  // if no parts have been processed yet, return
  if (lastIndex === -1) {
    return;
  }

  //go over all in ordert check if the part is ready to be merged
  while (true) {
    console.log(
      `simulateSTT [${part.idRecord}:${part.partIndex}] Checking next part...`
    );
    // check if the next part is ready to be merged
    let nextIndex = mockDB.get(part.idRecord, lastIndex + 1);
    console.log(
      `simulateSTT [${part.idRecord}:${part.partIndex}] Next part: ${
        lastIndex + 1
      }`
    );
    if (!nextIndex || nextIndex.status !== "stt_done") {
      break;
    }
    console.log(
      `simulateSTT [${part.idRecord}:${part.partIndex}] Next part is ready to be merged.`
    );
    const currentText = mockDB.getTextResult(part.idRecord);
    const newTextBlock = nextIndex.textBlock;

    // mock delay
    console.log(`simulateSTT [${part.idRecord}:${part.partIndex}] Merging parts...`);

    const newText = currentText + newTextBlock;
    mockDB.setTextResult(part.idRecord, newText);
    mockDB.setLastDoneSTTIndex(part.idRecord, lastIndex + 1);
    lastIndex++;
    console.log(
      `simulateSTT [${part.idRecord}:${part.partIndex}] Merged parts. New text: ${newText}`
    );
  }
}
