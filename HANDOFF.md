# Aurora Haven: handoff notes for the next AI

> **Tóm tắt cho nhóm:** đây là file bàn giao để AI khác đọc và làm tiếp tạp chí. File ghi lại tình trạng hiện tại, cách dựng lại file, các quyết định của nhóm không được đổi, và việc còn dang dở: AI tiếp theo tự tạo ảnh như thật cho các ảnh 3D rồi ghép vào tạp chí.

## 1. What this is

- **Project:** "The Ideal City of the Future", a school project by the team **Polar City** (class 11A4, Lê Quý Đôn High School, Vietnam).
- **Product:** an English A4 magazine about **Aurora Haven**, a polar city of 45,000 people on the Arctic tundra.
- **Brief:** the brief and marking rubric are in `guidelines/`, included in the zip only:
  - `Magazine_REPORT_GUIDELINES.pdf`
  - `Magazine_guidelines_PPT.pptx`
- **The person you work for** is a Vietnamese student, not a programmer. They want you to do the work, then review it.
  - Reply in **Vietnamese**.
  - Never invent data (addresses, numbers, rules); say so when something cannot be found.
  - Never merge pull requests yourself.
  - Run the checks before opening or updating a PR, and write PR descriptions in Vietnamese with restore steps.

## 2. Where things are

| Path | What it is |
|---|---|
| `magazine/build_magazine.js` | The whole magazine, written with pptxgenjs 3.12.0. One block per page, commented with the page it builds. |
| `magazine/assets/` | Pictures the magazine uses. Includes `renders/`, `plans/`, `team/` (member photos), `ecopolis/` (screenshots of the team's real Eco-Polis model; keep as they are) and `ui/` (QR codes, logos, shades). |
| `magazine/renders_raw/` | Full-size raw renders from the 3D city. **Not in git**; the zip includes them. Spreads are stored whole here and split into `_L`/`_R` halves by `tools/prepare_renders.py`. |
| `magazine/source/Aurora_Haven.json` | The team's Eco-Polis Builder map. It opens at https://ecopolis3d.netlify.app/. |
| `magazine/tools/` | Helper scripts: `prepare_renders.py`, `make_graphics.py` (QR codes and logo, each code test-scanned), `export_docx.py` (all text to Word), `make_shades.py`, `apply_theme.js`. |
| `city3d/` | The 3D city in three.js 0.160. `src/layout.js` holds the city plan: one unit is 1 m, x points east, z points south. `tools/shots.json` lists every camera. `tools/render.js` renders through Playwright and Chromium. `tools/plans.js` draws the 2D plans. |
| `output/` | Finished files, listed below. |
| `.github/workflows/map-release.yml` | Re-uploads `Aurora_Haven.json` to the GitHub Release `map-v1` whenever the file changes, so the page 21 QR code always downloads the latest map. |
| `image_kit/prompts.md` | Zip only. The pending AI-photo job: one prompt per picture; see section 6. |

The files in `output/`:
- `Aurora_Haven_Magazine.pptx`: the editable file.
- `Aurora_Haven_Magazine.pdf`: for print.
- `Aurora_Haven_Magazine_web.pdf`: a smaller copy for FlipHTML5.
- `Aurora_Haven_Magazine_text.docx`: all the text, for editing.

- **GitHub repo:** https://github.com/HiroKasumi-bit/chatbox-bi-n-o.
- **Working branch:** `claude/clever-goodall-4m9niz`.
- **Pull request:** https://github.com/HiroKasumi-bit/chatbox-bi-n-o/pull/1 is open and not merged. Its description lists every change and the restore commands.

## 3. How to rebuild

```bash
cd magazine && npm install            # pptxgenjs
node build_magazine.js                # writes ../output/Aurora_Haven_Magazine.pptx
cd ../output
soffice --headless --convert-to pdf Aurora_Haven_Magazine.pptx        # print PDF
# web PDF for FlipHTML5 (images at 150 dpi, JPEG quality 80):
soffice --headless --convert-to 'pdf:impress_pdf_Export:{"ReduceImageResolution":{"type":"boolean","value":"true"},"MaxImageResolution":{"type":"long","value":"150"},"Quality":{"type":"long","value":"80"}}' --outdir web Aurora_Haven_Magazine.pptx
cd .. && python3 magazine/tools/export_docx.py                        # Word copy of the text (pip install python-pptx python-docx)
```

Re-rendering the 3D pictures is only needed when the model or a camera changes.

```bash
cd city3d && npm install              # three; Playwright + Chromium must be available
node tools/render.js tools/shots.json ../magazine/renders_raw spa,lagoon   # names from shots.json; omit to render all
cd ../magazine && python3 tools/prepare_renders.py renders_raw            # copies to assets/renders, splits the spreads
```

- **The shared random generator in `city3d/src/kit.js`:** every builder draws from it. New geometry that calls `R()` shifts every later random choice and changes the whole city. Wrap such code in `isolated(seed, skip, fn)`, as `src/downtown.js` does for the civic core.
- **Keep `tools/shots.json` formatted** as `json.dumps(indent=1)`, with no trailing newline.

Check every build:
- The script throws if the page count or spread parity is wrong.
- Render the PDF and look at every page.
- Scan the QR codes, for example with OpenCV `QRCodeDetector().detectAndDecodeMulti`.

## 4. Layout rules

- **Page count:** 40 sheets, a multiple of 4 for saddle-stitch printing (10 A3 sheets folded). Sheet 2 and sheet 39 are the blank insides of the covers.
- **Page numbers:** printed numbers skip the cover and its blank inside, so **the contents page is page 1** and the content runs to page 36. In the code, `folio(n) = n - 2`. The page numbers and the running foot (`AURORA HAVEN · ISSUE 01 · <SECTION>`) are added to every page at the very end, so they sit above full-bleed photos.
- **Spreads:** a spread must start on an even sheet. The spreads are welcome 4–5, Liberty Mall 8–9, fusion 12–13 and the Mineral Lake grotto 18–19 (printed numbers). Adding or removing a page breaks the spreads and the 40-sheet count, so ask the user first.
- **Fonts:** Cambria for headings and Calibri for body text (theme fonts). Vietnamese names use **Arial** (`VN` constant), because LibreOffice's substitute fonts miss some Vietnamese accents.
- **Sections** (contents and running foot): Welcome, The city, The breakthroughs, Invest, Systems & life, The guide.
- **Cover** (`renders/cover_real.jpg`): an AI-photoreal version of the `cover_aerial` render, made with Nano Banana Pro. The three callout pins (Fusion Core, Snow-to-Food Plant, Mount Aurora) use coordinates measured on this exact image; re-measure them if the picture changes.

## 5. Decisions the team made (do not change without asking)

- **Content written by the team:** the letter on page 2, the interview conclusion on page 3 and the closing text on the back cover. Keep their words; the only change allowed was "Polar City" to "Aurora Haven".
- **Team, roles and AI USE:**
  - The team name is "Polar City", and there is no team email.
  - The 6 members, their photos and roles are on page 3.
  - The AI USE note (page 36) says AI helped build the 3D model, make the pictures, plans and diagrams, and check spelling and logic. The PICTURES line says the cover photo was made photoreal with an AI tool; extend that line if more AI photos go in.
- **The three breakthroughs:**
  1. A fusion reactor inside the city: wind and sun start it, fusion then powers everything, and wind and sun become the backup.
  2. A Snow-to-Food & Water Plant.
  3. **A 35-metre snow mountain you can walk inside:** a whole leisure world with a mineral lake, mud pools and saunas at 28 °C. The spa is not the breakthrough by itself.

  Each breakthrough has an "In brief" panel (problem, idea, what's new, impact) plus "Where the world is today" and "Reality check" boxes with cited sources. Page 5 sums up the three.
- **Mount Aurora is small (35 m).** AI image tools tend to turn it into a huge alpine peak, which breaks the concept. The Aurora Eye is a glowing glass dome on top of spa level 4.
- **The statue is a generic "Founding Mayor Monument"**, not any real person.
- **Sources:** facts are cited [1]–[20] on the sources page (page 36). Estimates are labelled as estimates, and nothing is claimed as tested.
- **QR codes:**

  | Page | Opens |
  |---|---|
  | 3 | Interview video https://youtu.be/QwcP_2Q3Esc |
  | 21 | Map download https://github.com/HiroKasumi-bit/chatbox-bi-n-o/releases/latest/download/Aurora_Haven.json |
  | 21 | Eco-Polis web app https://ecopolis3d.netlify.app/ |
  | Back cover | FlipHTML5 edition https://online.fliphtml5.com/aidsfjas4239PolarCut/Aurora_Haven_Magazine_web/ |

  The user cannot replace the PDF inside an existing FlipHTML5 book. A new upload means a new link, so update `FLIPBOOK_URL` in both `build_magazine.js` and `tools/make_graphics.py`, then run `make_graphics.py`.
- **No penguins.** They live in the Antarctic and the city is in the Arctic; the user agreed to drop the idea.

## 6. Done (30 Oct 2026): make the 3D pictures photoreal

> **Status:** done. All renders (and a new whole-city cover without callouts) were made photoreal with Stable Diffusion XL (RealVisXL V5) running locally on an RTX 4060; the tools are in `magazine/tools/photoreal/` and the README section "Làm ảnh như thật (SDXL)" explains them. The user then asked for more changes that are already in: a modern fusion dome that does not sit on a road, a Mount Aurora cutaway with no second peak behind it, a section on page 20 built from real interior photos, a fuller stadium, and an energy picture split top/bottom (wind above, solar below). Text was cut by about 40% with fewer numbers, three mechanism diagrams were added, and stretched pictures were fixed. The notes below are kept as history.

The user wants every 3D render in the magazine to look like a real photograph, as the cover already does. The Eco-Polis screenshots in `magazine/assets/ecopolis/` stay as they are. **Generate these pictures yourself** with the image tool you have (image editing with the original render as input), then place them in the magazine.

**Steps:**

1. **The list:** `image_kit/prompts.md` maps each picture number to a render file and a magazine page, and gives a ready-made prompt for each picture. There are 23 pictures; numbers 1–11 matter most (the spreads, the three breakthroughs, the resident's view, the back cover).
2. **Input:** the full-size original is `magazine/renders_raw/<file>.jpg`. Always edit from the original render, never generate from text alone, so the picture keeps the team's model.
3. **Compare with the original before using a result.** Reject it and try again if any of these happened:
   - Mount Aurora grew (it must stay a small 35 m peak);
   - the glass dome on top of the spa disappeared;
   - buildings, trees or people moved, appeared or vanished;
   - the statue looks like a real person;
   - any text, logo or watermark was added.
4. **Placing it:**
   1. Back up the original render (for example in `magazine/renders_raw/orig/`).
   2. Resize or crop the new image to the original's pixel size and aspect ratio, and save it as `magazine/renders_raw/<file>.jpg`.
   3. Run `cd magazine && python3 tools/prepare_renders.py renders_raw`, then `node build_magazine.js`.
   4. Look at the page.

   For the four spreads (`welcome_pano`, `liberty_dusk`, `fusion_spread`, `grotto`), check that the gutter does not cut through the main subject and that the text over the picture stays readable.
5. **Update the PICTURES line on the sources page** (page 36, in `build_magazine.js`) so it names every picture made photoreal with AI, not just the cover.
6. **Finish:**
   - rebuild the PDFs and the Word copy;
   - scan the QR codes;
   - commit, push and update the PR description in Vietnamese;
   - send the user the new PDF.

**What did not work in the previous session** (so you do not repeat it):
- **Weave (Nano Banana through the Figma connector):** the free Weave plan allows only 2 model runs; both were used for the cover.
- **Pollinations:** the free model ignores the input image.
- **FLUX.1 Kontext Hugging Face Space:** needs a logged-in token for GPU quota.
- **Local Stable Diffusion on CPU:** too slow and changes little.
- **Gemini API key in the environment:** its free-tier image quota is 0.

## 7. Printing

- **Recommended:** A4 saddle-stitch at a print shop (10 A3 sheets folded and stapled at the spine), 150 gsm coated paper inside. The outer sheet can be heavier (it holds the front cover, the back cover and the two blank pages).
- **Bleed:** the file has no 3 mm bleed. If the print shop needs one, make a bleed version.
