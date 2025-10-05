import path from "path";
import { FFMPEGResult, STTResult } from "../types";
import fs from "fs";

export async function simulateFFMPEG(
  idRecord: string,
  fileName1: string,
  fileName2: string
): Promise<FFMPEGResult> {
  const delay = Math.floor(Math.random() * 11000) + 5000; // 5s to 15s
  console.log(
    `[FFMPEG][${fileName1}:${fileName2}] Starting processing (${(
      delay / 1000
    ).toFixed(1)}s delay)...`
  );
  await new Promise((resolve) => setTimeout(resolve, delay));

  //the ffmpeg simulation should take the filename
  // and put its content in a file a new file in the output folder
  // output/${idRecord}/ffmpeg/${partIndex}.txt
  const folderPath = path.join(__dirname, '..', '..', 'output', idRecord);
  const fileName = path.join(folderPath, "done.txt");

  const data1 = fs.readFileSync(fileName1);
  const data2 = fs.readFileSync(fileName2);
  const data = `${data1}\n${data2}`;
  fs.writeFileSync(fileName, data);

  console.log(
    `[FFMPEG][${idRecord}:${fileName1}:${fileName2}] Finished processing.`
  );

  return {
    idRecord: idRecord,
    filename: fileName,
  };
}
