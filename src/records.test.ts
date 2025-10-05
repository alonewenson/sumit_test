// import request from 'supertest';
// import app from './index';
// import { RecordingPart } from './types';

// const recordingParts: RecordingPart[] = [
//     { idRecord: '1', partIndex: 1, isLast: false, recordingBlock: 'a' },
//     { idRecord: '1', partIndex: 2, isLast: false, recordingBlock: 'b' },
//     // { idRecord: '2', partIndex: 3, isLast: false, recordingBlock: 'c' },
//     // { idRecord: '2', partIndex: 2, isLast: false, recordingBlock: 'b' },
//     // { idRecord: '2', partIndex: 1, isLast: false, recordingBlock: 'a' },
//     // { idRecord: '2', partIndex: 4, isLast: false, recordingBlock: 'd' },
//     // { idRecord: '1', partIndex: 3, isLast: true, recordingBlock: 'c' },
//     // { idRecord: '2', partIndex: 5, isLast: true, recordingBlock: 'e' },
// ];

// describe('POST /records - send parts sequentially with random delays', () => {
//   it('streams parts 1-by-1 with 1-3s random gaps and does not assert results', async () => {
//     jest.setTimeout(30000);

//     for (const part of recordingParts) {
//       const delayMs = 1000 + Math.floor(Math.random() * 2000); // 1-3s
//       await new Promise((resolve) => setTimeout(resolve, delayMs));

//       await request(app)
//         .post('/records')
//         .send(part)
//         .set('Content-Type', 'application/json');
//       // No assertions on response; endpoint returns 202 and processes asynchronously
//     }
//   });
// });