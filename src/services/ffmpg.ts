import { RecordingPart } from "../types";
import { mockDB } from "../utils/db";

export async function simulateFFMPEG(part: RecordingPart): Promise<void> {
  // if this is the first part, copy the audio block to the output file
  if (part.partIndex === 0) {
    console.log(`simulateFFMPEG [${part.idRecord}:${part.partIndex}] Starting processing...`);
    mockDB.setAudioResult(part.idRecord, part.audioBlock);
    mockDB.setLastDoneFFMPEGIndex(part.idRecord, 0);
  }

  // get the last index that has status done
  let lastIndex = mockDB.getLastDoneFFMPEGIndex(part.idRecord);
  // if no parts have been processed yet, return
  if (lastIndex === -1) {
    return;
  }

  //go over all in ordert check if the part is ready to be merged
  while (true) {
    // check if the next part is ready to be merged
    let nextIndex = mockDB.get(part.idRecord, lastIndex + 1);
    console.log(`simulateFFMPEG [${part.idRecord}:${part.partIndex}] Next part: ${lastIndex + 1}`);
    if (!nextIndex || nextIndex.status !== "stt_done") {
      break;
    }
    console.log(`simulateFFMPEG [${part.idRecord}:${part.partIndex}] Next part is ready to be merged.`);
    const lastAudioBlock = mockDB.getAudioResult(part.idRecord);
    const newAudioBlock = nextIndex.audioBlock;
    if (!newAudioBlock) {
      break;
    }

    // mock delay
    const delay = Math.floor(Math.random() * 11000) + 5000; // 5s to 15s
    console.log(`simulateFFMPEG [${part.idRecord}:${part.partIndex}] Merging parts... (${(delay / 1000).toFixed(1)}s delay)`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const newAudio = lastAudioBlock + newAudioBlock;
    mockDB.setAudioResult(part.idRecord, newAudio);
    mockDB.setLastDoneFFMPEGIndex(part.idRecord, lastIndex + 1);
    lastIndex++;
    console.log(`simulateFFMPEG [${part.idRecord}:${part.partIndex}] Merged parts. New audio: ${newAudio}`);
  }
}
