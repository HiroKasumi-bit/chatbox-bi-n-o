"""Make the light FlipHTML5 copy: images above 120 dpi are resampled to 110 dpi, JPEG quality 75.
(PowerPoint's own PDF export already brings photos down to about 150 dpi.)

    uv run --with pymupdf python -I web_pdf.py IN.pdf OUT.pdf
"""
import sys

import pymupdf

src, dst = sys.argv[1], sys.argv[2]
doc = pymupdf.open(src)
doc.rewrite_images(dpi_threshold=120, dpi_target=110, quality=75)
doc.save(dst, garbage=4, deflate=True)
print(f"{dst}: {doc.page_count} pages")
