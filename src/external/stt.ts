import path from "path";
import { RecordingPart, STTResult } from "../types";
import fs from "fs";

export async function simulateSTT(part: RecordingPart): Promise<STTResult> {
  const delay = 3000; // Math.floor(Math.random() * 11000) + 5000; // 5s to 15s
  console.log(
    `[STT][${part.idRecord}:${part.partIndex}] Starting processing (${(
      delay / 1000
    ).toFixed(1)}s delay)...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log(`[STT][${part.idRecord}:${part.partIndex}] Finished processing.`);

  //the stt simulation should take the recordingBlock
  // and put its content in a file a new file in the output folder
  // output/${idRecord}/stt/${partIndex}.txt
  const folderPath = path.join(__dirname, "..", "..", "output", part.idRecord);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const outputFolderPath = path.join(
    folderPath,
    `stt_done`
  );

  const fileName = path.join(outputFolderPath, `${part.partIndex}.txt`);
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }
  fs.writeFileSync(fileName, part.recordingBlock);

  // and return this filename in the result

  return {
    idRecord: part.idRecord,
    partIndex: part.partIndex,
    filename: fileName,
    isLast: part.isLast,
  };
}
