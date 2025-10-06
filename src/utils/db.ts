import fs from "fs";
import path from "path";
// Mock database interface for recording parts

// Example data:
// const data = {
//   recordId: {
//     parts: {
//       partIndex: {
//         isLast: false,
//         audioBlock: "a",
//         textBlock: "a",
//         status: "done",
//       },
//       partIndex: {
//         isLast: true,
//         audioBlock: "b",
//         textBlock: "",
//         status: "stt_in_progress",
//       },
//     },
//     lastDoneFFMPEGIndex: -1,
//     lastDoneSTTIndex: -1,
//     result: {
//       text: "",
//       audio: "",
//     },
//   },
// };

interface RecordingPartData {
  isLast: boolean;
  audioBlock: string;
  textBlock: string;
  status:
    | "pending"
    | "stt_in_progress"
    | "stt_done"
    | "ffmpeg_in_progress"
    | "done"
    | "error";
}

interface RecordingData {
  parts: {
    [partIndex: number]: RecordingPartData;
  };
  result: {
    text: string;
    audio: string;
  };
  lastDoneFFMPEGIndex: number;
  lastDoneSTTIndex: number;
}

interface Database {
  [recordId: string]: RecordingData;
}

let data: Database = {};

// save this in db.json
const saveData = () => {
  fs.writeFileSync(path.join(__dirname, "db_mock.json"), JSON.stringify(data, null, 2));
};

// Mock database functions
export const mockDB = {
  // Set a recording part for a specific record ID
  set(recordId: string, partIndex: number, partData: RecordingPartData): void {
    if (!data[recordId]) {
      data[recordId] = {
        parts: {},
        lastDoneFFMPEGIndex: -1,
        lastDoneSTTIndex: -1,
        result: {
          text: "",
          audio: "",
        },
      };
    }
    data[recordId].parts[partIndex] = partData;
    saveData();
  },

  // Get a specific recording part
  get(recordId: string, partIndex: number): RecordingPartData | undefined {
    return data?.[recordId]?.parts[partIndex];
  },

  // Update status of a specific part
  updateStatus(
    recordId: string,
    partIndex: number,
    status: RecordingPartData["status"]
  ): void {
    if (data[recordId]?.parts[partIndex]) {
      data[recordId].parts[partIndex].status = status;
    }
    saveData();
  },

  // Update text block of a specific part
  updateTextBlock(
    recordId: string,
    partIndex: number,
    textBlock: string
  ): void {
    if (data[recordId]?.parts[partIndex]) {
      data[recordId].parts[partIndex].textBlock = textBlock;
    }
    saveData();
  },

  // Get the last done index of a record
  getLastDoneSTTIndex(recordId: string): number {
    return data[recordId].lastDoneSTTIndex;
  },

  setLastDoneSTTIndex(recordId: string, lastDoneIndex: number): void {
    data[recordId].lastDoneSTTIndex = lastDoneIndex;
    saveData();
  },

  // Get the last done index of a record
  getLastDoneFFMPEGIndex(recordId: string): number {
    return data[recordId].lastDoneSTTIndex;
  },

  setLastDoneFFMPEGIndex(recordId: string, lastDoneIndex: number): void {
    data[recordId].lastDoneFFMPEGIndex = lastDoneIndex;
    saveData();
  },

  getTextResult(recordId: string): string {
    return data[recordId].result.text;
  },

  setTextResult(recordId: string, text: string): void {
    data[recordId].result.text = text;
    saveData();
  },

  getAudioResult(recordId: string): string {
    return data[recordId].result.audio;
  },

  setAudioResult(recordId: string, audio: string): void {
    data[recordId].result.audio = audio;
    saveData();
  },

  clear(): void {
    data = {};
    saveData();
  },
};
