import { Analysis } from '../model/sample.model';

export const VALID_SHEET_NAME: string = 'Einsendeformular';

export const FORM_PROPERTIES: string[] = [
    'sample_id',
    'sample_id_avv',
    'partial_sample_id',
    'pathogen_avv',
    'pathogen_text',
    'sampling_date',
    'isolation_date',
    'sampling_location_avv',
    'sampling_location_zip',
    'sampling_location_text',
    'animal_avv',
    'matrix_avv',
    'animal_matrix_text',
    'primary_production_avv',
    'control_program_avv',
    'sampling_reason_avv',
    'program_reason_text',
    'operations_mode_avv',
    'operations_mode_text',
    'vvvo',
    'program_avv',
    'comment'
];

export const DEFAULT_SAMPLE_DATA_HEADER_ROW = 41;
export const SAMPLE_DATA_HEADER_ROW_MARKER = 'Ihre Probe-nummer';

export const META_EXCEL_VERSION = 'B3';
export const META_NRL_CELL = 'B7';
export const META_URGENCY_CELL = 'L27';
export const META_SENDER_INSTITUTENAME_CELL = 'C12';
export const META_SENDER_DEPARTMENT_CELL = 'C15';
export const META_SENDER_STREET_CELL = 'C17';
export const META_SENDER_ZIP_CITY_CELL = 'C19';
export const META_SENDER_CONTACTPERSON_CELL = 'C20';
export const META_SENDER_TELEPHONE_CELL = 'C21';
export const META_SENDER_EMAIL_CELL = 'C22';
export const META_CUSTOMER_REF_NUMBER_CELL = 'R6';
export const META_SIGNATURE_DATE_CELL = 'A27';
export const META_ANALYSIS_SPECIES_CELL = 'P12';
export const META_ANALYSIS_SEROLOGICAL_CELL = 'P13';
export const META_ANALYSIS_RESISTANCE_CELL = 'P14';
export const META_ANALYSIS_VACCINATION_CELL = 'P15';
export const META_ANALYSIS_MOLECULARTYPING_CELL = 'P16';
export const META_ANALYSIS_TOXIN_CELL = 'P17';
export const META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL = 'P18';
export const META_ANAYLSIS_OTHER_BOOL_CELL = 'P19';
export const META_ANALYSIS_OTHER_TEXT_CELL = 'J20';
export const META_ANALYSIS_COMPAREHUMAN_BOOL_CELL = 'P22';
export const META_ANALYSIS_COMPAREHUMAN_TEXT_CELL = 'J23';

export const EMPTY_ANALYSIS: Analysis = {
    species: false,
    serological: false,
    resistance: false,
    vaccination: false,
    molecularTyping: false,
    toxin: false,
    esblAmpCCarbapenemasen: false,
    sample: false,
    other: '',
    compareHuman: {
        value: '',
        active: false
    }
};

export const ZOMO_ID = {
    code: '70564|53075|',
    string1: 'zoonose',
    string2: 'monitoring'
};
