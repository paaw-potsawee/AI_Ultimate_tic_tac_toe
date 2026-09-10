# AI Ultimate Tic-Tac-Toe

เว็บแอป Ultimate Tic-Tac-Toe สำหรับทดลองและเปรียบเทียบการค้นหาแบบ Blind Search กับ Heuristic Search พัฒนาขึ้นเป็นส่วนหนึ่งของวิชา Artificial Intelligence

## ความสามารถหลัก

- เล่นแบบผู้เล่นสองคนบนเครื่องเดียวกัน
- เล่นกับ AI และเลือกฝั่ง X หรือ O ได้
- เปรียบเทียบ Blind DFS, Blind BFS และ Heuristic AI
- ดูการแข่งขันแบบ AI vs AI
- รองรับ undo, reset, move history และแสดงเส้นที่ชนะ
- ประมวลผล AI ใน Web Worker เพื่อไม่ให้หน้าเว็บค้าง

## กติกาโดยย่อ

Ultimate Tic-Tac-Toe ประกอบด้วยกระดานเล็ก 3×3 จำนวน 9 กระดาน ผู้เล่นที่ชนะกระดานเล็กจะยึดตำแหน่งนั้นบนกระดานใหญ่

ตำแหน่งช่องที่เลือกในกระดานเล็กจะกำหนดกระดานที่คู่แข่งต้องเล่นในตาถัดไป หากกระดานเป้าหมายถูกชนะหรือเต็มแล้ว คู่แข่งสามารถเลือกกระดานที่ยังเล่นได้อย่างอิสระ ผู้เล่นที่ยึดกระดานเล็กเรียงกัน 3 ตำแหน่งบนกระดานใหญ่เป็นฝ่ายชนะ และเกมจะเสมอเมื่อกระดานเล็กทั้งหมดปิดโดยไม่มีผู้ชนะ

## โหมดการเล่น

| โหมดในหน้าเกม   | รายละเอียด                                                   |
| --------------- | ------------------------------------------------------------ |
| Player          | ผู้เล่นสองคนเล่นสลับกัน                                      |
| The Heuristic   | เล่นกับ Minimax AI ที่มี heuristic evaluation                |
| The Blind (DFS) | เล่นกับ AI ที่ค้นหาแบบ Depth-First Search ความลึก 5 ชั้น     |
| The Blind (BFS) | เล่นกับ AI ที่ค้นหาแบบ Breadth-First Search ความลึก 5 ชั้น   |
| AI vs AI        | ให้ Heuristic AI เล่นทั้งสองฝั่ง โดยเว้นช่วงระหว่างตา 500 ms |

## Heuristic AI

Heuristic AI ใช้ iterative-deepening Minimax ร่วมกับ alpha-beta pruning โดยมีความลึกสูงสุด 10 ชั้นและ soft time budget 900 ms ต่อตา

การประเมินสถานะพิจารณาจาก:

- การยึดกระดานเล็กและตำแหน่งของกระดานนั้นบนกระดานใหญ่
- จำนวนหมากหนึ่งหรือสองตัวในแนวชนะ ทั้งระดับ local และ macro board
- น้ำหนักของช่องกลาง มุม และขอบ
- ความได้เปรียบจากการเลือกกระดานได้อย่างอิสระ
- ผลชนะ เสมอ และระยะที่เหลือก่อนถึง terminal state

ระบบใช้ move ordering และ transposition table เพื่อช่วยลดจำนวนโหนดที่ต้องค้นหา โดยล้าง cache ก่อนเริ่ม iterative depth ใหม่เพื่อไม่ให้ข้อมูลคนละความลึกกินพื้นที่ร่วมกัน

## เทคโนโลยี

- React 19 และ TypeScript 6
- Vite 8
- Tailwind CSS 4
- Web Worker
- Vitest, jsdom และ React Testing Library
- Bitboard ด้วย `Uint16Array` สำหรับเก็บสถานะกระดาน

## เริ่มต้นใช้งาน

### สิ่งที่ต้องมี

- Node.js 22.12 ขึ้นไป
- npm

### ติดตั้งและรัน

```shell
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal ซึ่งโดยปกติคือ `http://localhost:5173`

### รันด้วย Docker

Docker image ใช้ Bun สำหรับ build และใช้ Nginx สำหรับเสิร์ฟไฟล์ production

```shell
docker compose up --build
```

จากนั้นเปิด `http://localhost:3000`

## คำสั่งที่ใช้บ่อย

| คำสั่ง            | หน้าที่                                                |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | เปิด development server                                |
| `npm test`        | Type-check tests และรัน regression tests ด้วย Vitest   |
| `npm run build`   | Type-check production source และสร้าง production build |
| `npm run lint`    | ตรวจโค้ดด้วย Oxlint                                    |
| `npm run format`  | จัดรูปแบบไฟล์ด้วย Prettier                             |
| `npm run preview` | เปิดดู production build ในเครื่อง                      |

## โครงสร้างโปรเจกต์

```text
src/
├── components/          React UI components
├── lib/
│   ├── gameRules.ts     Constants, win masks และ board-state helpers
│   ├── game.ts          กติกา การสร้างสถานะ และการเดินหมาก
│   ├── heuristicSearch.ts
│   ├── bfs.ts
│   ├── dfs.ts
│   └── ai.ts            เลือก AI และแปลง encoded move
├── store/               Game state และ AI worker lifecycle
├── types/               Shared TypeScript types
└── workers/             Web Worker สำหรับคำนวณตาของ AI

tests/
├── lib/                 Game rules และ heuristic regression tests
├── store/               Store และ worker lifecycle tests
└── workers/             Worker response protocol tests
```

Production TypeScript config ตรวจเฉพาะ `src/` ส่วน `tsconfig.test.json` ครอบคลุมทั้ง `src/` และ `tests/` ปัจจุบันมี regression tests 16 กรณี

## อัปเดตล่าสุด — 10 กันยายน 2026

- ลดเวลาคิดของ Heuristic AI จาก 9 วินาทีเหลือ 900 ms
- ปรับ transposition table ให้เริ่ม cache ใหม่ในแต่ละ iterative depth
- แก้การตรวจผลเสมอให้รองรับ local board ที่เต็มแต่ไม่มีผู้ชนะ
- เพิ่มการ terminate AI worker เมื่อ undo, reset หรือออกจากเกม
- เพิ่ม success/error response protocol เพื่อป้องกัน UI ค้างเมื่อ worker ล้มเหลว
- รวม board constants, win masks และ board-state helpers ไว้ใน `gameRules.ts`
- ลด magic number และการ decode encoded move ที่ซ้ำใน Heuristic, BFS, DFS และ AI adapter
- ย้าย test files ออกจาก production source ไปยัง `tests/`
- เพิ่ม Vitest regression suite ครอบคลุม game result, heuristic และ worker lifecycle
