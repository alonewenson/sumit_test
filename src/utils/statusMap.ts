// this file should have a map of all the recoding and their indexs and the status
import { STTResult } from "../types";

 const statusMap = new Map<string, {
    index: number;
    sttResult: STTResult;
}
 >();

 export const addRecord = (idRecord: string, index: number, sttResult: STTResult) => {}
