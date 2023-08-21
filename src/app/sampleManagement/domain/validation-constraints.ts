import _ from 'lodash';
import { ValidationConstraints } from '../model/validation.model';

export const zoMoConstraints: ValidationConstraints = {

    sample_id: {

        presence: {
            error: 2,
            allowEmpty: false
        }

    },

    sample_id_avv: {

        presence: {
            error: 5,
            allowEmpty: false
        }

    },

    sampling_date: {

        presence: {
            error: 14,
            allowEmpty: false
        },

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    isolation_date: {

        presence: {
            error: 18,
            allowEmpty: false
        },

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    animal_avv: {

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    matrix_avv: {

        presence: {
            error: 34,
            allowEmpty: false
        },

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    operations_mode_avv: {

        atLeastOneOf: {
            error: 48,
            additionalMembers: ['operations_mode_text']
        },

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    operations_mode_text: {

        atLeastOneOf: {
            error: 48,
            additionalMembers: ['operations_mode_avv']
        }

    },

    sampling_location_avv: {

        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_zip',
                'sampling_location_text'
            ]
        }

    },

    sampling_location_zip: {

        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_avv',
                'sampling_location_text'
            ]
        }

    },

    sampling_location_text: {

        atLeastOneOf: {
            error: 86,
            additionalMembers: [
                'sampling_location_avv',
                'sampling_location_zip'
            ]
        }

    },

    primary_production_avv: {

        // prüfen
        requiredIfOther: {
            error: 39,
            field: 'operations_mode_avv',
            regex: '^4'
        },

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    control_program_avv: {

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    program_reason_text: {

        // new text
        registeredZoMo: {
            error: 49,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    }

};

export const standardConstraints: ValidationConstraints = {

    sample_id: {

        atLeastOneOf: {
            error: 69,
            additionalMembers: ['sample_id_avv']
        },

        presence: {
            error: 68,
            allowEmpty: false
        }

    },

    sample_id_avv: {

        atLeastOneOf: {
            error: 69,
            additionalMembers: ['sample_id']
        }

    },

    sampling_date: {

        atLeastOneOf: {
            error: 19,
            additionalMembers: ['isolation_date']
        }

    },

    isolation_date: {

        atLeastOneOf: {
            error: 19,
            additionalMembers: ['sampling_date']
        }

    },

    control_program_avv: {

        // new text
        shouldBeZoMo: {
            error: 97,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    },

    program_reason_text: {

        // new text
        shouldBeZoMo: {
            error: 97,
            group: [
                {
                    attr: 'operations_mode_avv',
                    code: 'ADV8-Kode'
                },
                {
                    attr: 'matrix_avv',
                    code: 'ADV3-Kode'
                },
                {
                    attr: 'animal_avv',
                    code: 'Kodiersystem'
                },
                {
                    attr: 'pathogen_avv',
                    code: 'ADV16-Kode'
                }
            ],
            year: ['sampling_date', 'isolation_date'],
            catalog: 'adv16'
        }

    }

};

export const baseConstraints: ValidationConstraints = {
    sample_id: {},

    sample_id_avv: {

        matchesIdToSpecificYear: {
            error: 72,
            regex: []
        }

    },

    pathogen_avv: {

        presence: {
            error: 10,
            allowEmpty: false
        },

        matchADVNumberOrString: {
            error: 8,
            catalog: 'adv16',
            alternateKeys: ['Text']
        },

        nrlExists: {
            error: 96
        }
    },

    sampling_date: {

        presence: {
            error: 11,
            allowEmpty: false
        },

        dateAllowEmpty: {
            error: 12
        },

        futureDate: {
            error: 13,
            latest: 'NOW'
        },

        referenceDate: {
            error: 20,
            latest: 'isolation_date'
        },

        timeBetween: {
            error: 61,
            earliest: 'isolation_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },

        oldSample: {
            error: 62,
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },

    isolation_date: {

        presence: {
            error: 15,
            allowEmpty: false
        },

        dateAllowEmpty: {
            error: 16
        },

        futureDate: {
            error: 17,
            latest: 'NOW'
        },

        referenceDate: {
            error: 20,
            earliest: 'sampling_date'
        },

        timeBetween: {
            error: 61,
            latest: 'sampling_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },

        oldSample: {
            error: 63,
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }

    },

    sampling_location_avv: {
        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_zip',
                'sampling_location_text'
            ]
        },

        // new text
        inAVVCatalog: {
            error: 24,
            catalog: 'avv313'
        }

    },

    sampling_location_zip: {

        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_avv',
                'sampling_location_text'
            ]
        },

        dependentFields: {
            error: 28,
            dependents: ['sampling_location_text']
        },

        length: {
            error: 27,
            is: 5,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXX';
            }
        },

        inCatalog: {
            error: 75,
            catalog: 'plz'
        }

    },

    sampling_location_text: {

        atLeastOneOf: {
            error: 64,
            additionalMembers: [
                'sampling_location_avv',
                'sampling_location_zip'
            ]
        },

        dependentFields: {
            error: 25,
            dependents: ['sampling_location_zip']
        }

    },

    animal_avv: {

        atLeastOneOf: {
            error: 37,
            additionalMembers: ['matrix_avv', 'animal_matrix_text']
        },

        inAVVFacettenCatalog: {
            error: 30,
            catalog: 'avv339'
        }

    },

    matrix_avv: {

        atLeastOneOf: {
            error: 37,
            additionalMembers: ['animal_matrix_text', 'animal_avv']
        },

        presence: {
            error: 32,
            allowEmpty: false
        },

        // new text
        inAVVFacettenCatalog: {
            error: 33,
            catalog: 'avv319'
        },

    },

    animal_matrix_text: {

        atLeastOneOf: {
            error: 37,
            additionalMembers: ['matrix_avv', 'animal_avv']
        }

    },

    primary_production_avv: {

    },

    control_program_avv: {

        atLeastOneOf: {
            error: 44,
            additionalMembers: ['program_reason_text']
        },

        // new text
        inAVVCatalog: {
            error: 42,
            catalog: 'avv322'
        },

        noPlanprobeForNRL_AR: {
            error: 95
        }

    },

    sampling_reason_avv: {

        atLeastOneOf: {
            error: 44,
            additionalMembers: ['program_reason_text']
        },

        // new text
        inAVVCatalog: {
            error: 42,
            catalog: 'avv326'
        },

        noPlanprobeForNRL_AR: {
            error: 95
        }

    },

    program_reason_text: {

        atLeastOneOf: {
            error: 44,
            additionalMembers: ['sampling_reason_avv']
        },

        noPlanprobeForNRL_AR: {
            error: 95
        }

    },

    operations_mode_avv: {

        atLeastOneOf: {
            error: 71,
            additionalMembers: ['operations_mode_text']
        },

        // new text
        inAVVFacettenCatalog: {
            error: 46,
            catalog: 'avv303'
        }

    },

    operations_mode_text: {

        atLeastOneOf: {
            error: 71,
            additionalMembers: ['operations_mode_avv']
        }

    },

    vvvo: {},

    comment: {}

};
