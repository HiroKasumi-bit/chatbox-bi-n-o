"""Copies every text box of the magazine into a Word file for editing, one section per page.

    cd .. && python3 magazine/tools/export_docx.py   # run from the repository root

Needs: pip install python-pptx python-docx
"""
from pptx import Presentation
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_BREAK

prs = Presentation('output/Aurora_Haven_Magazine.pptx')
doc = Document()
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11)
doc.add_heading('Aurora Haven – magazine text', 0)
p = doc.add_paragraph('One section per page, in page order. Each block starting with #N is one text box in the magazine. Edit the words inside a block, but please keep the page headings and the #N markers so the changes can be put back in the right place. Text in square brackets, such as [Group name], still needs to be filled in.')
p.runs[0].italic = True

for i, slide in enumerate(prs.slides, 1):
    doc.add_heading(f'Page {i}', 1)
    n = 0
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        paras = [pa for pa in shape.text_frame.paragraphs if ''.join(r.text for r in pa.runs).strip()]
        if not paras:
            continue
        n += 1
        for k, pa in enumerate(paras):
            out = doc.add_paragraph()
            if k == 0:
                tag = out.add_run(f'#{n}  '); tag.bold = True; tag.font.color.rgb = RGBColor(0x4A, 0x7F, 0xC1)
            for r in pa.runs:
                if not r.text:
                    continue
                run = out.add_run(r.text.replace('\v', ' '))
                run.bold = bool(r.font.bold); run.italic = bool(r.font.italic)
    if n == 0:
        doc.add_paragraph('(blank page)').runs[0].italic = True
doc.save('output/Aurora_Haven_Magazine_text.docx')
print('pages', len(prs.slides))
