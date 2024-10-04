/**
 * @param selection An array of page indexes already selected.
 * @param pageCount The number of pages of the pdfDocument.
 * @returns An inverted selection array of page indexes.
 */
export function invertSelection(selection: number[], pageCount: number): number[] {
    const newSelection = [];
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        if(!selection.includes(pageIndex))
            newSelection.push(pageIndex);
    }
    return newSelection;
}


// TODO: Port this to CommaArrayJoiExt.ts
/**
 * Parse the page selector string
 * @param specification 
 * @param totalPages 
 * @returns 
 */
export function parsePageIndexSpecification(specification: string, totalPages: number): number[] {
    // Translated to JS from the original Java function
    const pageOrderArr = specification.split(",");
    const newPageOrder: number[] = [];

    // loop through the page order array
    pageOrderArr.forEach(element => {
        if (element.toLocaleLowerCase() === "all") {
            for (var i = 0; i < totalPages; i++) {
                newPageOrder.push(i);
            }
            // As all pages are already added, no need to check further
            return;
        }
        else if (element.match("\\d*n\\+?-?\\d*|\\d*\\+?n")) {
            // Handle page order as a function
            let coefficient = 0;
            let constant = 0;
            let coefficientExists = false;
            let constantExists = false;

            if (element.includes("n")) {
                const parts = element.split("n");
                if (!parts[0]) {
                    coefficient = parseInt(parts[0]);
                    coefficientExists = true;
                }
                if (parts.length > 1 && parts[1]) {
                    constant = parseInt(parts[1]);
                    constantExists = true;
                }
            } else if (element.includes("+")) {
                constant = parseInt(element.replace("+", ""));
                constantExists = true;
            }

            for (var i = 1; i <= totalPages; i++) {
                let pageNum = coefficientExists ? coefficient * i : i;
                pageNum += constantExists ? constant : 0;

                if (pageNum <= totalPages && pageNum > 0) {
                    newPageOrder.push(pageNum - 1);
                }
            }
        } else if (element.includes("-")) {
            // split the range into start and end page
            const range = element.split("-");
            const start = parseInt(range[0]);
            let end = parseInt(range[1]);
            // check if the end page is greater than total pages
            if (end > totalPages) {
                end = totalPages;
            }
            // loop through the range of pages
            for (let j = start; j <= end; j++) {
                // print the current index
                newPageOrder.push(j - 1);
            }
        } else {
            // if the element is a single page
            newPageOrder.push(parseInt(element) - 1);
        }
    });

    return newPageOrder;
}
