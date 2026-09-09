# Agile Dashboard — Specification

เอกสารนี้อธิบายเงื่อนไขการทำงานของ Agile Dashboard ทั้งหมด ครอบคลุม Data Layer, Routing, Slide ทุกหน้า, Logic การคำนวณ, Present Mode และ PDF Export

---

## 1. ภาพรวมระบบ

แอปเป็น **Single-Page React App (Vite)** สำหรับ Sprint Review ของทีม HAOS ทำหน้าที่ 2 อย่าง:

1. **Dashboard Mode** — ดูสไลด์ทีละหน้า, ดูราย Assignee / Bug, Export ภาพรายสไลด์
2. **Present Mode** — Slideshow แบบเต็มจอ + Export PDF ทั้งชุด

ขนาดสไลด์มาตรฐาน **1920×1080 (16:9)** ทุกหน้า

**Stack:**
- React + Vite
- Recharts (chart library)
- jsPDF + html-to-image (PDF export)
- Tailwind utility classes (เฉพาะ layout) + inline style (เฉพาะหน้า)

---

## 2. แหล่งข้อมูล (Data Layer)

### 2.1 Source

อ่านจาก **Google Sheets** (`SHEET_ID` กำหนดใน `.env`) ผ่าน 2 ช่องทาง:

| เงื่อนไข | วิธี |
|---|---|
| ตั้ง `VITE_GOOGLE_API_KEY` | ใช้ Sheets API v4 (รองรับ private sheet) |
| ไม่ตั้ง API Key | ใช้ Google Visualization API (sheet ต้อง public — "Anyone with the link") |

ถ้าโหลด `Raw : All` หรือ `Raw : Bug` ไม่สำเร็จเลย → fallback ใช้ **sample data** จาก `src/data/sampleData.js` และโชว์ badge "Sample Data" สีเหลืองที่ navbar

### 2.2 Sheet ทั้งหมดที่ใช้

| Sheet | Field สำคัญ | ใช้ที่ |
|---|---|---|
| `Raw : All` | Key, Summary, Issue Type, Status, Priority, Assignee, Estimate Man-Days, Actual Man-Days | Cards ทั้งหมด (Story → Planned, Task → Unplanned) |
| `Raw : Bug` | Key, Parent, Summary, Status, Priority, Assignee | Defect / Bug list |
| `Raw : MA` | Key, Summary, Status, Priority, Assignee, Issue Type, Created | MA Analysis / Timeline |
| `Team members` | Name, Role, Effort (Est/Act/OT), Leave, Remark | Team Members |
| `Sprint Goals` | Sprint, Epic, Feature, Task, Status, Remark | Sprint Goals |
| `Next Sprint Goals` | (เหมือนข้างบน) | Next Sprint Goals |
| `Overview Update` | Module, Task, Start Sprint, End Sprint, Status, Remark | Overview Update |
| `Sprint` | Sprint, Start Date, End Date, Active (`Now`/`Next`/blank) | resolve วันที่ของ Sprint Goals + ระบายสี header ของ Overview |
| `Issues Encountered` | Issues, Impacts, Solutions | Issues Encountered |
| `Milestones` | No, Project, Phase, Deliverable, Format, Owner, Plan Start, Plan Finish, Status, Progress, Acceptance, Source, Contract, Remark | Milestone Tracking (ระดับรายการ) |
| `Milestone Phases` | Project, Phase, Phase Name, Payment, Milestone Due, Due Basis, Caution | Milestone Tracking (ระดับงวด) |

### 2.3 Loading Flow

- ทุก sheet โหลด **ขนานกัน** (`Promise.all`) — sheet ใดล้มเหลวจะ log warning แต่ไม่บล็อกตัวอื่น
- ระหว่างโหลด: โชว์ Spinner เต็มจอ ("Loading data...")
- เมื่อโหลดเสร็จ:
  - `source = 'google'` ถ้า cards หรือ bugs โหลดสำเร็จ
  - `source = 'sample'` ถ้าทั้ง 2 ตัวล้มเหลว → fallback ทั้งระบบ
- `useProcessedData(cards, bugs)` คำนวณ metrics ทั้งหมด memoized ตาม `[cards, bugs]`
- `resolveSprintDates(goals, sprintList)` — เติม `startDate`/`endDate` ใน `goals.meta` จาก Sprint sheet (match ด้วย sprint name)

### 2.4 Issue Type Mapping

| ใน Sheet (`Issue Type`) | ภายในระบบ (`type`) |
|---|---|
| `Story` | `Planned` |
| `Task` | `Unplanned` |
| อื่น ๆ | `Unplanned` (default) |

---

## 3. Routing & Navigation

ใช้ `window.location.hash` เป็น router (no library)

### 3.1 Route table

| Hash | View |
|---|---|
| `#goals`, `#members`, `#overview`, `#milestones`, `#executive`, `#effort`, `#team`, `#gap`, `#defects`, `#ma-analysis`, `#ma-timeline`, `#insights`, `#issues`, `#next-goals` | สไลด์เฉพาะหน้า (Dashboard) |
| `#assignee/<name>` | Card in Sprint ของคนนั้น (URL-encoded) |
| `#bugs` | Bug list ทั้งหมด |
| `#present` หรือ `#present/...` | เข้า Present Mode |
| ไม่มี / ไม่รู้จัก | default → slide แรก (index 0) |

### 3.2 Keyboard Shortcuts

**Dashboard + Present:**
- `→` / `↓` / `Space` → next slide
- `←` / `↑` → prev slide

**Present เพิ่มเติม:**
- `Esc` → ออกจาก Present กลับไป `#goals`
- Keyboard ถูก **disable** ระหว่าง export PDF

### 3.3 Top Navbar (Dashboard)

**ฝั่งซ้าย:**
- `Sample Data` badge สีเหลือง (โชว์เมื่อ `source === 'sample'`)
- `View Cards` dropdown (รายชื่อ assignee พร้อมจำนวน, เรียง desc)
- `Bug (n)` button (กดไป `#bugs`)
- `Present` button (gradient น้ำเงิน → ม่วง, กดไป `#present`)

**กลาง:**
- ปุ่ม `‹` / `›` prev/next
- Dot indicator (active dot ขยายเป็นแถบยาว 28×8, กลับด้านอื่น 8×8 สีเทา)
- ตัวเลข `n / total`

**ฝั่งขวา:**
- `Copy Image` (copy PNG ของ slide ลง clipboard)
- `Export PNG` (download PNG ของ slide ปัจจุบัน)

### 3.4 Navbar ใน Assignee / Bug view

- ปุ่ม `Dashboard` (กลับไปสไลด์เดิม)
- `View Cards` dropdown (เปลี่ยน assignee)
- `Bug (n)` (เฉพาะใน Assignee view)
- ขวา: `Copy Image` + `Export PNG`

---

## 4. หน้าสไลด์ทั้งหมด

### 4.1 ลำดับ Slide

**Dashboard slide order (`SLIDES`):**
```
Sprint Goals → Team Members → Overview Update → Milestone Tracking → Executive Summary
→ Effort Overview → Team Performance → Effort Gap → Defect Analysis
→ MA Analysis → MA Timeline → Sprint Insights
→ Issues Encountered → Next Sprint Goals
```

**Present mode slide order (`STATIC_PRESENT`):**
```
Cover → Agenda → Team Members
→ [Overview Update × N pages] → [Milestone Tracking × 1 หน้า/โครงการ]
→ Sprint Goals → Executive Summary → Effort Overview → Team Performance
→ Effort Gap → Defect Analysis → MA Analysis → MA Timeline
→ [Card in Sprint per assignee] → Card in Sprint: Bug
→ Retrospective → Issues Encountered → Next Sprint Goals → Thank You
```

> **ข้อสังเกต:**
> - `Sprint Insights` มีใน Dashboard แต่ **ไม่อยู่ใน Present** (สำหรับ internal analysis เท่านั้น)
> - `Cover`, `Agenda`, `Card in Sprint` (per-assignee + Bug), `Retrospective`, `Thank You` มีเฉพาะใน Present

---

### 4.2 Cover / Agenda / Thank You

- Static page — ไม่มี logic พิเศษ
- `Agenda` แสดง 12 หัวข้อตามลำดับ Present mode (ไม่รวม Cover/Thank You/Card in Sprint detail)

---

### 4.3 Team Members

- การ์ดสมาชิก grid 3 คอลัมน์ (33.33% width, min 320px) — wrap หลายแถวอัตโนมัติ
- KPI รวมแถวบน (subtitle): Members, Total Work, Total Actual, Total OT, Total Leave (sum จากทุกคน)
- **Avatar** = initials 2 ตัวจากชื่อ (ตัด `(...)` ออก), สีตาม Role
- **Work** แสดง `(Consult)` ถ้า estimate = 0
- **Remark** แสดงเป็น chip ข้างชื่อถ้ามี
- Role palette: Project Manager / Product Owner / SS Programmer / Programmer / Designer / Tester / Application Support / Software Implementer

---

### 4.4 Overview Update (สำคัญ — มี pagination logic)

แสดง Roadmap แบบ Gantt timeline ของแต่ละ Module/Feature ข้าม Sprint

#### Sprint columns

- เอาจาก `sprintList` เฉพาะที่มี task อ้างถึง (`startSprint`–`endSprint` overlap)
- เรียงตามเลข Sprint (`sprintNum()` ดึงตัวเลขจากชื่อ)
- แสดงสูงสุด **10 Sprint ล่าสุด** (`.slice(-10)`)
- สีของ header column:
  - `Active=Now` → ส้ม `#D97706`
  - `Active=Next` → เทา `#94A3B8`
  - อื่น ๆ → กรมท่า `#1E3A5F`

#### Row layout per Module

- `buildLanes()`: pack tasks ใน module เดียวกันลงหลาย lane (greedy first-fit) — task ที่ไม่ซ้อนเวลาจะอยู่ lane เดียวกัน
- ถ้า Module มีแต่ Remark (ไม่มี `startSprint`): แสดง remark สีส้ม italic span ทั้งแถว
- ถ้าไม่มี task เลย: แสดงแถวว่าง
- แถวสลับสีพื้น (zebra) **ตามขอบ Module** (โดย index ของ module ไม่ใช่ index ของ row) — module เลขคู่ขาว, คี่เทาอ่อน

#### Task cell

- Background = สีตาม status (`STATUS_STYLE`)
- ถ้ามี `notes` → แสดงข้อความสีแดงด้านล่างของ task

#### Pagination

- `MAX_ROWS = 18` lanes ต่อหน้า
- ฟังก์ชัน `paginateModules()`: ถ้าใส่ module ถัดไปแล้วเกิน MAX_ROWS → ขึ้นหน้าใหม่ก่อน (ไม่ตัด module กลางคัน)
- ใน Dashboard: ปุ่ม `‹ n/N ›` ที่มุมซ้ายบน (state ของ component เอง)
- ใน Present Mode: เรียก `computeOverviewPageCount(data)` แล้วสร้าง slide แยกต่อหน้า, ส่ง `forcePage={i}` ให้ component (override `useState`)

#### Status legend
- Completed (`#3B82F6` น้ำเงิน)
- Testing (`#22C55E` เขียว)
- In-progress (`#0D9488` teal)
- Potential Delay = Pending (`#F59E0B` เหลือง)
- Delay (`#EF4444` แดง)
- Not Start = Planned (`#9CA3AF` เทา)

---

### 4.4b Milestone Tracking (งวดงานตามสัญญา)

ตอบ 3 คำถามของ PM: **งวดนี้ต้องทำอะไร · เสร็จเมื่อไหร่ · ต้องส่งข้อมูลรูปแบบไหน**

#### Pagination
- **1 หน้า = 1 โครงการ** (`Project`) เรียงตามลำดับที่เจอใน sheet
- `computeMilestonePageCount(data)` — ให้ PresentMode รู้จำนวนหน้าโดยไม่ต้อง render
- ถ้า sheet `Milestones` ว่าง/โหลดไม่ได้ → Present **ข้ามสไลด์นี้ทั้งหมด**, Dashboard โชว์ "No data available"

#### สองชีต แยกตามระดับข้อมูล

| ชีต | 1 แถว = | ถือข้อมูลอะไร |
|---|---|---|
| `Milestone Phases` | 1 งวด (7 แถว) | ชื่องวด · % จ่ายเงิน · วันครบกำหนด · ที่มาของกำหนดส่ง · ข้อควรระวัง |
| `Milestones` | 1 สิ่งส่งมอบ (57 แถว) | ชื่อ · รูปแบบ · ผู้รับผิดชอบ · แผนเริ่ม-จบ · สถานะ · % · เกณฑ์ตรวจรับ · ที่มา · เป็นสิ่งส่งมอบตามสัญญาหรือไม่ |

`buildProjects(rows, phaseRows, sprintList)` join ด้วยคีย์ `Project|Phase` — งวดที่ไม่มีแถวใน `Milestone Phases` จะยังแสดงได้ แต่ไม่มีชื่องวด/วันครบกำหนด/หมายเหตุ

> ก่อนหน้านี้ค่าระดับงวดถูกเก็บปนในตารางระดับรายการ — `Phase Name`/`Milestone Due` ซ้ำทุกแถว ส่วน `Payment`/`Due Basis`/`Caution` กรอกเฉพาะแถวแรกของงวด ซึ่งพังทันทีถ้ามีการ sort ชีตใหม่

#### การจัดกลุ่ม (`buildProjects`)
- Project → Phase (งวด) ตามลำดับแถวใน sheet `Milestones`
- **งวดปัจจุบัน** = งวดแรกที่ยังมีรายการไม่ `Completed` (ถ้าเสร็จหมดทุกงวด → งวดสุดท้าย)
- **`Sprint` ไม่ได้เก็บในชีต** — `sprintOf(planFinish, sprintList)` คำนวณจากชีต `Sprint` ทุกครั้ง (วันที่ตกเสาร์-อาทิตย์ปัดไป Sprint ถัดไป · เลย Sprint สุดท้าย → `หลัง Sprint N`)

#### เลือกดูงวดอื่น (การ์ดงวด = ตัวกรอง)

- **กดการ์ดงวดไหน ตารางกับ KPI กับแถบหมายเหตุจะสลับไปงวดนั้นทั้งชุด** — ใช้ตอบ "งวดหน้าต้องเตรียมอะไร" โดยไม่ต้องเปิดชีต
- งวดที่ระบบคำนวณว่าเป็นงวดปัจจุบันมี badge **`ปัจจุบัน`** สีเหลืองติดอยู่เสมอ ไม่ว่ากำลังดูงวดไหน
- ระหว่างดูงวดอื่น หัวข้อตารางจะต่อท้ายว่า **`(ดูล่วงหน้า)`** และมีปุ่ม `← กลับไป งวด N (งวดปัจจุบัน)` (คลาส `export-hide` — ไม่ติดไปกับ PNG/PDF)
- เปลี่ยนหน้า (เปลี่ยนโครงการ) → รีเซ็ตกลับไปงวดปัจจุบันของโครงการนั้นอัตโนมัติ
- Present mode ไม่ได้รับผลกระทบ: แต่ละสไลด์ mount ใหม่และเริ่มที่งวดปัจจุบันเสมอ

#### Layout
1. **KPI 4 ช่อง** — งวดปัจจุบัน + % ค่าจ้าง / วันครบกำหนด + วันที่เหลือ / สิ่งส่งมอบตามสัญญา (เสร็จ/ทั้งหมด) / จำนวนรายการเลยกำหนดแผน
2. **การ์ดงวด** — เรียงทุกงวดของโครงการ · งวดปัจจุบันมีขอบส้ม · progress bar = สัดส่วนรายการที่ `Completed` (แดงถ้ามีงานเลยกำหนด) · badge บอก `เหลือ n วัน` / `เลย n วัน` / `ส่งครบแล้ว`
- **`Contract`** (`Yes`/`No`) เป็นตัวชี้ขาดว่าแถวไหนนับเป็นสิ่งส่งมอบตามสัญญา (KPI `สิ่งส่งมอบตามสัญญา` + แถบสีส้มหน้าแถว) · ถ้าเว้นว่าง ถอยไปใช้กติกาเดิมคือ `Source` ขึ้นต้นด้วย `TOR` หรือ `สัญญา`
- **`Acceptance`** แสดงเป็น tooltip เมื่อชี้ที่ชื่อรายการ (ไม่กินพื้นที่สไลด์)

3. **ตารางสิ่งที่ต้องส่งของงวดปัจจุบัน** — เรียงตาม `Plan Finish` · แถบซ้ายสีส้ม = สิ่งส่งมอบตามสัญญา (`Source` ขึ้นต้นด้วย `TOR` หรือ `สัญญา`), สีเทา = งานเตรียม · วันที่เป็นสีแดง + ⚠ ถ้าเลยกำหนดและยังไม่ `Completed` · คอลัมน์ `คืบหน้า` = bar + % รายรายการ

#### การคิด % ความคืบหน้า (`rowProgress`)

ลำดับความสำคัญ:
1. ค่าในคอลัมน์ `Progress` ของ sheet (ถ้ากรอกและ **ไม่ใช่ 0**) — ตัวเลขสีเข้ม
2. ถ้าไม่ได้กรอก **หรือค้างเป็น 0 ทั้งที่ status ขยับแล้ว** → ประเมินจาก Status ตาม `STATUS_WEIGHT` — ตัวเลขสีเทา

| Status | น้ำหนัก |
|---|---|
| `Not Start` / `Pending` | 0% |
| `In-Progress` / `Delay` | 50% |
| `Testing` | 80% |
| `Completed` / `Done` | 100% |

- **% ของงวด** (ตัวเลขใน KPI `งวดปัจจุบัน`) = ค่าเฉลี่ยถ่วงน้ำหนักของทุกรายการในงวด
- **การ์ดงวดมี 2 แถบ** (`MiniBar`) — นับจากจำนวนรายการ ไม่ใช่ค่าเฉลี่ย และเป็น **ค่าสะสม** (แถบล่างเป็นสับเซตของแถบบน):
  | แถบ | ความหมาย | สี |
  |---|---|---|
  | `Started n/N` | รายการที่เริ่มแล้ว = In-Progress **+ Completed** | เขียวเข้ม `#0D9488` (แดงถ้างวดนั้นมีรายการเลยกำหนด) |
  | `Completed n/N` | รายการที่ปิดแล้ว (ส่วนย่อยของ Started) | น้ำเงิน `#3B82F6` |

> ทำไมต้องสะสม: ถ้านับ In-Progress แบบไม่รวม Completed พอรายการหนึ่งเสร็จ แถบ In-Progress จะ**สั้นลง** ทั้งที่งานเดินหน้า — ผู้อ่านตีความว่าถอยหลัง · แบบสะสมทำให้ `Started` ขึ้นอย่างเดียว และ `Completed` ไล่ตามขึ้นมาข้างใน

> เหตุผลของกฎ "0 ที่ค้าง": ทีมเปลี่ยน Status ใน sheet บ่อยกว่าการกรอก `Progress` ถ้ายึด 0 ตามตัวอักษร งวดที่กำลังเดินอยู่จะโชว์ 0% ตลอด

#### แถบหมายเหตุใต้ตาราง (ราย "งวด")

อ่านจาก 2 คอลัมน์ท้ายชีต — กรอกที่ **แถวแรกของแต่ละงวด** เหมือน `Payment`:

| คอลัมน์ | แสดงเป็น | ใช้บอกอะไร |
|---|---|---|
| `Due Basis` | **ที่มาของกำหนดส่ง** (หัวข้อสีกรมท่า) | วันครบกำหนดมาจากไหน เช่น "TOR ข้อ 8 — 150 วันนับถัดจากวันลงนาม" หรือ "สัญญาไม่ระบุวัน — ผูกกับเหตุการณ์ Go-live → ตรวจรับ 14 วัน → ชำระ 30 วัน" |
| `Caution` | **ข้อควรระวัง** (หัวข้อสีส้ม) | เส้นตายแฝง ค่าปรับ เงื่อนไขตรวจรับ และข้อความในสัญญาที่ยังต้องยืนยัน |

- แถบจะไม่ขึ้นเลยถ้าทั้ง 2 ช่องว่าง
- แบ่งครึ่งซ้าย-ขวา มีเส้นคั่น · ถ้ามีแค่ช่องเดียวจะกินเต็มความกว้าง
- ข้อความยาวได้ ~3 บรรทัด (แถวตารางถูกบีบเพื่อกันที่ให้แถบนี้แล้ว)

#### ความหนาแน่นของแถว
สไลด์สูงคงที่ 1080px จึงบีบ padding ตามจำนวนรายการ: `≤12 → 4px`, `≤15 → 2px`, `>15 → 1px` (ชดเชยการ์ดงวด 2 แถบ + แถบหมายเหตุใต้ตาราง) และตัดที่ `MAX_TABLE_ROWS = 18` (ส่วนเกินโชว์ `+ อีก n รายการ`)

#### รูปแบบวันที่
`dd/mm/yyyy` จาก sheet → แสดงเป็น **พ.ศ. ย่อ** (`07/11/2026` → `7 พ.ย. 69`) ให้ตรงกับเอกสารสัญญา

#### สี Status
ใช้ palette เดียวกับ Overview Update (`Completed` น้ำเงิน / `In-Progress` เขียวเข้ม / `Not Start` เทา / `Pending` ส้ม / `Delay` แดง)

---

### 4.5 Sprint Goals / Next Sprint Goals

- Tree 3 ระดับ: **Epic → Feature → Task**
- คำนวณ `countEpicLines()` (1 + sum ของ feature lines + task count)
- ใช้ **DP (Dynamic Programming)** กระจาย Epic ลง 1–4 คอลัมน์ ให้โหลดแต่ละคอลัมน์เกือบเท่ากัน
  - `MAX_LINES_PER_COL = 11`, `MAX_COLS = 4`
  - DP minimize max column load
- แสดง **Sprint duration chip** บนสุด (resolved จาก `Sprint` sheet ผ่าน `resolveSprintDates`)
- Task แสดง status badge ถ้ามี (`Done` / `In-Progress` / `To-Do` / `Confirm` / `Pending` / `Issue`)
- Task remark สีส้ม `(remark)` ต่อท้ายชื่อ task
- Epic header มี accent bar สี (วน 7 สี: navy/teal/indigo/orange/purple/green/rose)

---

### 4.6 Executive Summary

#### KPI row (5 metrics)
- Total Cards
- Planned (+ % of total)
- Unplanned (+ % of total)
- % Done
- Total Bugs

#### Chart ซ้าย (flex 7)
- Horizontal stacked bar: `Planned vs Unplanned by Status`

#### Insight panel ขวา (flex 3)
- Completion Rate
- Planned Done (% + n/total)
- Unplanned Done (% + n/total)
- Unplanned Ratio
- Bug Count

#### Risk Alert (gating logic)
- **ถ้า `pctUnplanned > 30%`** → กล่องแดง "Risk Alert: Unplanned work exceeds 30% (...). Review sprint scope and capacity planning."
- **มิฉะนั้น** → กล่องเขียว "On Track: Unplanned work is within acceptable range (...)"

---

### 4.7 Effort Overview

#### Summary 3 pill
- Total Estimate (น้ำเงิน)
- Total Actual (ส้ม)
- Variance — สีตาม sign:
  - `variance > 0` → แดง `#F43F5E` + label "overrun" + พื้นชมพูอ่อน `#FFF7F7`
  - `variance ≤ 0` → teal `#0D9488` + label "under"

#### Charts
- **Bar chart ซ้าย** (`EffortByStatusChart`): Estimate vs Actual แต่ละ status แบบ stacked vertical
- **Donut ขวา** (420px fixed): Status Distribution (จำนวน card ตาม status)

#### Detail
- `RoundedVerticalBar`: มน corner บนเฉพาะ segment **บนสุด** ของ stack (เช็คว่ามี status ที่ index สูงกว่าและ value > 0 หรือไม่)
- `TotalOnTopVertical`: total อยู่บน segment **ตัวแรก** (Done) เพื่อไม่ render ซ้ำหลายครั้ง — ใช้ ratio ของ value/total คำนวณตำแหน่ง top ของ stack

---

### 4.8 Team Performance

- 3 panel เคียงกัน: **Total / Planned / Unplanned by Assignee** (vertical bar layout)
- Assignee เรียงตามจำนวน card desc
- **Clickable tick**: ใน Dashboard ส่ง `goToAssignee` prop → คลิกชื่อแล้วไป `#assignee/<name>`; ใน Present **ไม่ส่ง** prop นี้ → ไม่ clickable
- ถ้าชื่อยาวเกิน 16 ตัวอักษร: wrap 2 บรรทัด (หาช่องว่างใกล้กลางที่สุด)

---

### 4.9 Effort Gap

#### Bucket definition
- `COMPLETED_STATUSES = ['Done', 'Wait for Deploy', 'Waiting for Test', 'Cancel']` → Done bucket
- ที่เหลือ → Active bucket

#### Summary (left panel)
- **Effort Summary card** — Estimate / Actual / Gap + bar แสดง % of estimate used
- **Phase Breakdown card** — Completed vs Active แยกแสดง

#### Insight panel
- **Highest Overrun** — top 3 ที่ gap > 0
- **Best Performer** — คนที่ gap น้อยสุด (แสดงเฉพาะถ้า gap < 0)
- **Risk gating:**
  - `criticalCount = ที่ gap > GAP_THRESHOLD (2 MD)` > 0 → กล่องแดง "Risk: N members exceed Xd gap threshold."
  - มิฉะนั้น → กล่องเขียว "On Track: No member exceeds Xd gap."

#### Chart ขวา
- Grouped bar Estimate vs Actual per assignee

---

### 4.10 Defect Analysis

#### KPI
- Total Bugs
- Resolved / Open (Resolved = status ∈ `['Done', 'Cancel']`)
- Resolution Rate (% Resolved / Total)
- ปุ่ม "View All Bug Cards" → `#bugs`

#### 3 chart panels
- **Status × Priority** (horizontal stacked) — priority order: Highest → High → Medium → Low → Lowest
- **By Priority** (donut)
- **By Assignee** (horizontal stacked by status, เรียงตามจำนวน desc, blank assignee = `'Unassigned'`)

---

### 4.11 MA Analysis

- ใช้ dataset `maIssues` (sheet `Raw : MA`)
- KPI: Total / Resolved / Open / Resolution Rate (เกณฑ์เดียวกับ Defect)
- **4 chart panels** (เพิ่ม Issue Type donut เทียบกับ Defect):
  1. Status × Priority (horizontal stacked)
  2. By Priority (donut)
  3. By Issue Type (donut) — Bug/Task/Story/Improvement/Request/Sub-task
  4. By Assignee (horizontal stacked by status)

---

### 4.12 MA Timeline

- กรองเฉพาะ issue ที่ parse `Created` date ได้ (format `dd/mm/yyyy` หรือ ISO)
- KPI: Total / Peak Month / Avg per Month / Months Tracked

#### Weekly trend (LineChart, height 210px)
- จัดกลุ่มเป็นสัปดาห์เริ่ม**วันจันทร์** (`day - (day === 0 ? 6 : day - 1)`)
- แสดงหลายเส้นแยกตาม Issue Type
- X-axis label: แสดงเฉพาะวันที่ ≤ 7 ของเดือน (เพื่อโชว์ชื่อเดือน)

#### Monthly chart (ComposedChart)
- ถ้ามี typeKeys → stacked bar by Issue Type + dashed line `total`
- ถ้าไม่มี → simple line of total

#### Issue Type order
`Bug → Task → Story → Improvement → Request → Sub-task`

---

### 4.13 Sprint Insights (Dashboard only)

3 panel เคียงกัน:

#### Panel 1: Completion Rate
- **Planned vs Unplanned** — % Done + bar
- **Priority vs Completion** — bar % done per priority level

#### Panel 2: Estimate Accuracy
- Bar chart: Variance (`actual − estimate`) per person
- สี: เขียว `#10B981` ถ้า ≤ 0 (under/on budget), แดง `#F43F5E` ถ้า > 0 (over budget)
- เรียงตาม `|variance|` desc
- Legend ด้านล่าง

#### Panel 3: Assignee Risk Score (0–100)

**สูตร:**
```
unplannedRatio = unplanned cards / total cards (cap at 0.5)
overrunRatio   = max(0, (actual − estimate) / estimate) (cap at 0.5)
unresolvedBugs = bugs ของคนนั้น status ∉ ['Done', 'Cancel'] (cap at 5)

score = unplannedRatio / 0.5 × 33
      + overrunRatio / 0.5 × 33
      + unresolvedBugs / 5 × 34
```

**Tier:**
- ≥ 60 → High (แดง)
- ≥ 30 → Med (ส้ม)
- < 30 → Low (เขียว)

Table columns: Name / Risk / Unplanned % / Effort Variance / Bugs

---

### 4.14 Card in Sprint

#### Per Assignee (`CardInSprintAssignee`)
- Merge cards (Planned→Story, Unplanned→Task) + bugs ของคนนั้น
- เรียงตาม **IssueType (Story → Task → Bug)** แล้ว `sortItems` (priority + status secondary)
- Title: `Card in Sprint : <Name> (X Cards, Y Bugs)`
- Status counts ด้านบน (chip per status พร้อมจำนวน)
- ตาราง 9 column: `#`, Issue Type, Parent, Key, Summary, Priority, Status, Est, Act
- Row hover: Bug row → ชมพูอ่อน `#FEF2F2`, อื่น → เทาอ่อน `#F8FAFC`

#### Bugs (`CardInSprintBugs`)
- Bug ทั้งหมด, sortItems
- Title: `Card in Sprint : *Bug (n Issues)`
- ตาราง 7 column: `#`, Key, Parent, Summary, Assignee, Priority, Status

#### ใน Present Mode
- สร้าง slide แยกต่อ assignee (เรียงตามจำนวน card desc)
- แทรกตำแหน่ง `__CARDS__` ใน `STATIC_PRESENT`

---

### 4.15 Retrospective / Issues Encountered / Next Sprint Goals

- **Retrospective**: รายการที่จัดในชีท (Static layout)
- **Issues Encountered**: ตาราง 3 column — Issue / Impact / Solution
- **Next Sprint Goals**: ใช้ component เดียวกับ Sprint Goals แต่อ่านจาก `Next Sprint Goals` sheet

---

## 5. Present Mode

### 5.1 พฤติกรรม

- Build slides แบบ **dynamic** ทุกครั้งที่ `data` เปลี่ยน:
  - แทน `__OVERVIEW__` ด้วย overview pages (จำนวน = `computeOverviewPageCount(data)`)
  - แทน `__CARDS__` ด้วย Card-per-Assignee (เรียงตามจำนวน card desc; กรอง assignee ว่างออก)
- Static slides ทั่วไป render โดยส่ง `data`, `slideRef`, `isExporting`
- กดปุ่ม dot → jump ไป slide นั้น
- `document.body.dataset.exporting` ถูก set เป็น `'true'`/`'false'` ตลอด lifecycle ของ export — ใช้สำหรับ CSS rule ที่ต้อง hide element เฉพาะตอน export

### 5.2 PDF Export

#### Filename pattern
```
AYD-Sprint review monitoring_<endDateNoSlash>_HA.OS-Sprint review (<sprint>).pdf
```
- `endDateNoSlash` = `meta.endDate` ถอด `/` ออก
- `sprint` = `meta.sprint`

#### Algorithm
```
1. exporting = true, จำ savedIndex
2. สร้าง jsPDF { orientation: 'landscape', unit: 'px', format: [1920, 1080] }
3. Loop ทุก slide:
   a. setIndex(i)
   b. รอ waitForRender() = 2× requestAnimationFrame + setTimeout(250ms)
      (ให้ Recharts วาดเสร็จและ layout settle)
   c. toJpeg(el, { width:1920, height:1080, pixelRatio:1,
                   cacheBust:true, quality:0.9 })
      - retry 1 ครั้งถ้าล้มเหลว (รอ 500ms)
   d. ถ้าไม่ใช่ page แรก: pdf.addPage([1920, 1080], 'landscape')
   e. pdf.addImage(dataUrl, 'JPEG', 0, 0, 1920, 1080, undefined, 'FAST')
4. pdf.save(`${pdfFileName}.pdf`)
5. setIndex(savedIndex), exporting = false
```

#### ระหว่าง export
- ปุ่ม "Export PDF" disabled, แสดง progress `Exporting... (current/total)`
- Keyboard navigation ถูก disable
- Chart animation ถูก **ปิด** (`isAnimationActive={!isExporting}` / `disableAnimation={isExporting}`)
- CSS transition ที่ใช้ใน InsightRow และ progress bar ถูกตั้ง `'none'`
- Element ที่มี class `export-hide` จะถูกซ่อนตอน capture (navigation, page nav buttons, etc.)

---

## 6. Convention / Utility

### 6.1 Status canonical order

`STATUS_ORDER` (จาก `src/utils/colors.js`) คุมลำดับ legend และ stack ทุกที่ — `Done` ขึ้นล่างสุดของ stacked bar เสมอ

### 6.2 Colors & Typography

- `utils/colors.js`:
  - `STATUS_COLORS` — สีของ status
  - `TYPE_COLORS` — Planned/Unplanned
- `utils/typography.js` — token `T.*` (kpiBig, section, body, micro, ...)
  - ทุก slide ต้องใช้ token ไม่ hardcode font-size
- Priority palette (consistent ทุกหน้า): Highest `#991B1B` (แดงเข้ม) → Lowest `#94A3B8` (เทา)

### 6.3 Animation

- Class `animate-slide-up animate-delay-{1..4}` — slide-up delay-based ตามลำดับการ render
- ทุก chart ปิด animation เมื่อ export ผ่าน prop `isExporting` / `disableAnimation`
- CSS transition (เช่น progress bar) ตั้ง `'none'` เมื่อ exporting

### 6.4 Element ที่ไม่ออก export

- ใส่ class `export-hide` → ถูกซ่อนตอน `toJpeg` capture
- ใช้กับ: navigation bar, page nav buttons ใน Overview Update, ปุ่มต่าง ๆ ที่ไม่ใช่เนื้อหา

### 6.5 Date parsing

- รูปแบบที่รองรับ: `dd/mm/yyyy` (split `/`) หรือ ISO
- Helper:
  - `shortDate(dateStr)` — `dd/mm/yyyy` → `DD Mon` (เช่น `25/12/2025` → `25 Dec`)
  - `parseDate(str)` — ใช้ใน MA Timeline (return Date object หรือ null)

### 6.6 Sort helpers (`utils/tableStyles.js`)

- `sortItems(items)` — sort ด้วย priority (Highest → Lowest) แล้ว status
- ใน CardInSprint: เพิ่ม sort by `issueType` ก่อน (Story → Task → Bug)

### 6.7 Chart shared components (`charts/chartUtils.jsx`)

- `WrapTick` — wrap label ยาวเป็นหลายบรรทัด (สำหรับ vertical bar)
- `RoundedBarShape` — มน corner เฉพาะ segment บน/ขวาสุดของ stack
- `TotalOnTop` — render total เหนือ bar (วาดเฉพาะ key สุดท้ายเพื่อไม่ render ซ้ำ)

---

## 7. Edge Cases ที่จัดการอยู่แล้ว

- ไม่มี data ใน Overview Update → แสดง "No data available"
- ไม่มี Assignee (ค่าว่าง) → กรองออกจาก list ของ chart
- Cards/Bugs ที่ Assignee เป็น blank → ไม่ขึ้น dropdown แต่ยังถูกนับใน Total
- Bug ที่ assignee blank → group เป็น `'Unassigned'` ใน chart
- MA Issue ที่ parse date ไม่ได้ → skip จาก trend chart แต่ยังนับใน Analysis
- Estimate = 0 → แสดง `(Consult)` ใน Team Members
- Estimate/Actual = 0 → แสดง `—` ใน Card in Sprint table
- Sprint Goals มี Epic/Feature/Task ว่าง → skip row
- Overview Module ที่มีแต่ Remark (ไม่มี startSprint) → แสดง remark สีส้ม span ทั้งแถว

---

## 8. Constants ที่กระทบ behavior

| Constant | Value | ที่ใช้ |
|---|---|---|
| `MAX_ROWS` | 18 | Overview Update — lanes ต่อหน้า |
| `MAX_LINES_PER_COL` | 11 | Sprint Goals — บรรทัดต่อคอลัมน์ |
| `MAX_COLS` | 4 | Sprint Goals — คอลัมน์สูงสุด |
| `GAP_THRESHOLD` | 2 MD | Effort Gap — เกณฑ์ critical overrun |
| `COMPLETED_STATUSES` | `['Done', 'Wait for Deploy', 'Waiting for Test', 'Cancel']` | Effort Gap — bucket Done |
| `BUG_RESOLVED` | `['Done', 'Cancel']` | Defect/MA — bucket Resolved |
| Risk Alert threshold | `pctUnplanned > 30%` | Executive Summary |
| Sprint columns | last 10 | Overview Update |
| Slide size | 1920×1080 | ทุกหน้า + PDF |
| `waitForRender` delay | 250ms + 2 rAF | PDF export per slide |
| `toJpeg` quality | 0.9 | PDF export |

---

## 9. โครงสร้างไฟล์ (สำคัญ)

```
src/
├── App.jsx                        # Router + Dashboard navbar
├── main.jsx
├── data/
│   ├── googleSheets.js            # Sheet fetchers + parsers
│   └── sampleData.js              # Fallback data
├── hooks/
│   ├── useData.js                 # โหลด & cache data จาก sheets
│   └── useProcessedData.js        # คำนวณ metrics ทั้งหมด
├── pages/
│   ├── PresentMode.jsx            # Present + PDF export
│   ├── CoverPage.jsx
│   ├── AgendaPage.jsx
│   ├── TeamMembers.jsx
│   ├── OverviewUpdate.jsx         # + computeOverviewPageCount()
│   ├── SprintGoals.jsx            # + SprintGoalsView export
│   ├── ExecutiveSummary.jsx
│   ├── EffortOverview.jsx
│   ├── TeamPerformance.jsx
│   ├── EffortGap.jsx
│   ├── DefectAnalysis.jsx
│   ├── MAAnalysis.jsx
│   ├── MATimeline.jsx
│   ├── SprintInsights.jsx
│   ├── CardInSprint.jsx           # exports CardInSprintAssignee + CardInSprintBugs
│   ├── Retrospective.jsx
│   ├── IssuesEncountered.jsx
│   ├── NextSprintGoals.jsx
│   ├── ThankYouPage.jsx
│   ├── AssigneeView.jsx           # Dashboard-only view
│   └── BugListView.jsx            # Dashboard-only view
├── components/
│   ├── SlideLayout.jsx            # SlideContainer + ExportButton + CopyImageButton
│   └── KPICard.jsx
├── charts/
│   ├── DonutChart.jsx
│   ├── StackedBarChart.jsx
│   ├── GroupedBarChart.jsx
│   ├── HorizontalStackedBar.jsx
│   └── chartUtils.jsx
└── utils/
    ├── colors.js                  # STATUS_ORDER, STATUS_COLORS, TYPE_COLORS
    ├── typography.js              # T.* tokens, tooltipStyle, axisTickSecondary, legendStyle
    └── tableStyles.jsx            # STATUS_BADGE, PRIORITY_BADGE, TYPE_BADGE, Badge, TH, TD, sortItems
```
