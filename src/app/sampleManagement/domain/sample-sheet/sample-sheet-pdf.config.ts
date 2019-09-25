export const sampleSheetPDFConfig = {
    scale: 10 / 14,     // guess from printed excel
    table: {
        thinBorder: 0.5,
        thickBorder: 1.5,
    },
    meta: {
        superScriptGap: 1,
        col1Width: '45%',
        col2Width: '40%',
        col3Width: '15%',
        col11Width: '60%',
        columnGap: 22,
        cellPadding: {
            top: 1.5,
            bottom: 0
        },
        tableMargins: {
            top: 0,
            bottom: 2,
            left: 0,
            right: 0
        }
    },
    samples: {
        cellPadding: {
            top: 1,
            bottom: 0,
            left: 0.5,
            right: 0.5
        },
        colWidthFactors: [0.6, 0.8, 1, 0.9],
        colWidthIndices: [
            1, 1,
            2, 2,
            1, 1,
            1, 0, 1,
            1, 0, 1,
            3,
            0, 1,
            3, 3,
            2,
            3
        ],
        colThickLines: [
            false, true,
            false, true,
            false, true,
            false, false, true,
            false, false, true,
            true,
            false, true,
            false, true,
            true
        ]
    }
};
