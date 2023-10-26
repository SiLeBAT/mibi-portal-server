export const sampleSheetPDFConfig = {
    scale: 10 / 14, // guess from printed excel
    table: {
        thinBorder: 0.5,
        thickBorder: 1
    },
    meta: {
        superScriptGap: 1,
        col1Width: '45%',
        col2Width: '40%',
        col3Width: '15%',
        col11Width: '60%',
        columnGap: 21,
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
        colWidthFactors: [5.57, 5.86, 6.57, 8, 9.14, 9.43, 9.57, 9.86, 10.71, 11.29, 14.57, 32.29],
        colWidthIndicesMap: new Map<string, number>([
            ['sample_id', 4],
            ['sample_id_avv', 6],
            ['partial_sample_id', 1],
            ['pathogen_avv', 10],
            ['pathogen_text', 5],
            ['sampling_date', 7],
            ['isolation_date', 7],
            ['sampling_location_avv', 3],
            ['sampling_location_zip', 0],
            ['sampling_location_text', 6],
            ['animal_avv', 2],
            ['matrix_avv', 3],
            ['animal_matrix_text', 11],
            ['primary_production_avv', 3],
            ['control_program_avv', 3],
            ['sampling_reason_avv', 3],
            ['program_reason_text', 7],
            ['operations_mode_avv', 3],
            ['operations_mode_text', 9],
            ['vvvo', 8],
            ['comment', 8]
        ]),
        colThickLines: [
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            true,
            false,
            true,
            true
        ]
    }
};
