import { Response } from 'express';
import puppeteer from 'puppeteer';
import { AuthRequest } from '../middleware/auth.middleware';

export async function exportPosterToPDF(req: AuthRequest, res: Response) {
  const { title, image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Falta la imagen del diseño' });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <img src="${image}" />
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    const pdfBuffer = Buffer.from(pdfUint8Array);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title || 'poster'}.pdf"`,
    });
    res.send(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function exportCatalogToPDF(req: AuthRequest, res: Response) {
  const { title, images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Faltan las imágenes del catálogo' });
  }

  const pagesHtml = images
    .map(
      (img: string) => `
        <div class="page">
          <img src="${img}" />
        </div>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; }
          .page {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            page-break-after: always;
          }
          .page img { max-width: 100%; max-height: 100%; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({ format: 'A4', printBackground: true });
    const pdfBuffer = Buffer.from(pdfUint8Array);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title || 'catalogo'}.pdf"`,
    });
    res.send(pdfBuffer);
  } finally {
    await browser.close();
  }
}