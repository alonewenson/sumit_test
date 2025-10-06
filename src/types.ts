

export interface RecordingPart {
    idRecord: string;    // UUID for the recording session
    partIndex: number;   // Sequential part number (0, 1, 2, ...)
    isLast: boolean;     // Indicates if this is the final part
    audioBlock: string; // Simulated base64 or audio chunk data
}
