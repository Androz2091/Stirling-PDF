import jsQR from "jsqr";

import { PdfFile } from "../../wrappers/PdfFile";
import { getImagesOnPage, PDFJSImage } from "./getImagesOnPage";

export async function detectQRCodePages(file: PdfFile) {
    const pdfDoc = await file.pdfJsDocument;

    const pagesWithQR: number[] = [];
    for (let i = 0; i < pdfDoc.numPages; i++) {
        console.log("Page:", i, "/", pdfDoc.numPages);
        const page = await pdfDoc.getPage(i + 1);

        const images = await getImagesOnPage(page);
        console.log("images:", images);
        for (const image of images) {
            const data = await checkForQROnImage(image);
            if(["https://github.com/Stirling-Tools/Stirling-PDF", "https://github.com/Frooodle/Stirling-PDF"].includes(data)) {
                pagesWithQR.push(i);
            }
            else {
                console.log("Found QR code with unrelated data: " + data);
            }
        }
    }
    if(pagesWithQR.length == 0) {
        console.warn("Could not find any QR Codes in the provided PDF. This may happen if the provided QR-Code is not an image but a path (e.g. SVG).");
    }
    return pagesWithQR;
}

async function checkForQROnImage(image: any) {
    // TODO: There is an issue with the jsQR package (The package expects rgba but sometimes we have rgb), and the package seems to be stale, we could create a fork and fix the issue. In the meanwhile we just force rgba:
    // Check for rgb and convert to rgba

    if(image.data.length == image.width * image.height * 3) {
        const tmpArray = new Uint8ClampedArray(image.width * image.height * 4);

        // Iterate through the original array and add an alpha channel
        for (let i = 0, j = 0; i < image.data.length; i += 3, j += 4) {
            tmpArray[j] = image.data[i];     // Red channel
            tmpArray[j + 1] = image.data[i + 1]; // Green channel
            tmpArray[j + 2] = image.data[i + 2]; // Blue channel
            tmpArray[j + 3] = 255;               // Alpha channel (fully opaque)
        }

        image.data = tmpArray;
    }

    const code = jsQR(image.data, image.width, image.height);
    if(code)
        return code.data;
    else
        return null;
}