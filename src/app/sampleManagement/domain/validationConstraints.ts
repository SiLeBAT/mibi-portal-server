import * as _ from 'lodash';
import { validationErrorProvider as vep, IValidationError } from './validationErrorProvider.entity';
import { ConstraintSet } from '.';

export interface IValidationRule {
    message: IValidationError;
    // tslint:disable-next-line
    [key: string]: any;
}

export interface IValidationRuleSet {
    [key: string]: IValidationRule;
}

export interface IValidationConstraints {
    [key: string]: IValidationRuleSet;
}

const zoMoConstraints: IValidationConstraints = {
    sample_id_avv: {
        presence: {
            message: vep.getError('5'),
            allowEmpty: false
        }
    },
    sampling_date: {
        presence: {
            message: vep.getError('14'),
            allowEmpty: false
        }
    },
    isolation_date: {
        presence: {
            message: vep.getError('18'),
            allowEmpty: false
        }
    },
    matrix_adv: {
        presence: {
            message: vep.getError('34'),
            allowEmpty: false
        },
        registeredZoMo: {
            message: vep.getError('49'),
            group: [{
                attr: 'operations_mode_adv',
                code: 'ADV8-Kode'
            }, {
                attr: 'matrix_adv',
                code: 'ADV3-Kode'
            }, {
                attr: 'topic_adv',
                code: 'Kodiersystem'
            }],
            year: ['sampling_date', 'isolation_date']
        }
    },
    operations_mode_adv: {
        atLeastOneOf: {
            message: vep.getError('48'),
            additionalMembers: ['operations_mode_text']
        },
        registeredZoMo: {
            message: vep.getError('49'),
            group: [{
                attr: 'operations_mode_adv',
                code: 'ADV8-Kode'
            }, {
                attr: 'matrix_adv',
                code: 'ADV3-Kode'
            }, {
                attr: 'topic_adv',
                code: 'Kodiersystem'
            }],
            year: ['sampling_date', 'isolation_date']
        }
    },
    operations_mode_text: {
        atLeastOneOf: {
            message: vep.getError('48'),
            additionalMembers: ['operations_mode_adv']
        }
    },
    sampling_location_adv: {
        atLeastOneOf: {
            message: vep.getError('64b'),
            additionalMembers: ['sampling_location_zip', 'sampling_location_text']
        }
    },
    sampling_location_zip: {
        atLeastOneOf: {
            message: vep.getError('64b'),
            additionalMembers: ['sampling_location_adv', 'sampling_location_text']
        }
    },
    sampling_location_text: {
        atLeastOneOf: {
            message: vep.getError('64b'),
            additionalMembers: ['sampling_location_adv', 'sampling_location_zip']
        }
    },
    sampling_reason_adv: {
        registeredZoMo: {
            message: vep.getError('49'),
            group: [{
                attr: 'operations_mode_adv',
                code: 'ADV8-Kode'
            }, {
                attr: 'matrix_adv',
                code: 'ADV3-Kode'
            }, {
                attr: 'topic_adv',
                code: 'Kodiersystem'
            }],
            year: ['sampling_date', 'isolation_date']
        }
    },
    sampling_reason_text: {
        registeredZoMo: {
            message: vep.getError('49'),
            group: [{
                attr: 'operations_mode_adv',
                code: 'ADV8-Kode'
            }, {
                attr: 'matrix_adv',
                code: 'ADV3-Kode'
            }, {
                attr: 'topic_adv',
                code: 'Kodiersystem'
            }],
            year: ['sampling_date', 'isolation_date']
        }
    }
};

const standardConstrainst: IValidationConstraints = {
    sample_id: {
        atLeastOneOf: {
            message: vep.getError('69'),
            additionalMembers: ['sample_id_avv']
        },
        presence: {
            message: vep.getError('68'),
            allowEmpty: false
        }
    },
    sample_id_avv: {
        atLeastOneOf: {
            message: vep.getError('69'),
            additionalMembers: ['sample_id']
        }
    },
    pathogen_adv: {
        atLeastOneOf: {
            message: vep.getError('10'),
            additionalMembers: ['pathogen_text']
        },
        inPathogenIndex: {
            message: vep.getError('8'),
            additionalMembers: ['pathogen_text']
        }
    },
    pathogen_text: {
        atLeastOneOf: {
            message: vep.getError('10'),
            additionalMembers: ['pathogen_adv']
        }
    },
    sampling_date: {
        atLeastOneOf: {
            message: vep.getError('19'),
            additionalMembers: ['isolation_date']
        },
        presence: {
            message: vep.getError('11'),
            allowEmpty: false
        },
        date: {
            message: vep.getError('12')
        },
        futureDate: {
            message: vep.getError('13'),
            latest: 'NOW'
        },
        referenceDate: {
            message: vep.getError('20'),
            latest: 'isolation_date'
        },
        timeBetween: {
            message: vep.getError('61'),
            earliest: 'isolation_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            message: vep.getError('62'),
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    isolation_date: {
        atLeastOneOf: {
            message: vep.getError('19'),
            additionalMembers: ['sampling_date']
        },
        presence: {
            message: vep.getError('15'),
            allowEmpty: false
        },
        date: {
            message: vep.getError('16')
        },
        futureDate: {
            message: vep.getError('17'),
            latest: 'NOW'
        },
        referenceDate: {
            message: vep.getError('20'),
            earliest: 'sampling_date'
        },
        timeBetween: {
            message: vep.getError('61'),
            latest: 'sampling_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            message: vep.getError('63'),
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    sampling_location_adv: {
        atLeastOneOf: {
            message: vep.getError('64a'),
            additionalMembers: ['sampling_location_zip', 'sampling_location_text']
        },
        length: {
            message: vep.getError('24b'),
            maximum: 8
        },
        inCatalog: {
            message: vep.getError('24a'),
            catalog: 'adv9'
        }
    },
    sampling_location_zip: {
        atLeastOneOf: {
            message: vep.getError('64a'),
            additionalMembers: ['sampling_location_adv', 'sampling_location_text']
        },
        dependentFields: {
            message: vep.getError('28'),
            dependents: ['sampling_location_text']
        },
        length: {
            message: vep.getError('27a'),
            is: 5,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXX';
            }
        },
        inCatalog: {
            message: vep.getError('27b'),
            catalog: 'plz'
        }
    },
    sampling_location_text: {
        atLeastOneOf: {
            message: vep.getError('64a'),
            additionalMembers: ['sampling_location_adv', 'sampling_location_zip']
        },
        dependentFields: {
            message: vep.getError('25'),
            dependents: ['sampling_location_zip']
        }
    },
    topic_adv: {
        length: {
            message: vep.getError('30b'),
            is: 2,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XX';
            }
        },
        numbersOnly: {
            message: vep.getError('30c')
        },
        inCatalog: {
            message: vep.getError('30a'),
            catalog: 'adv2'
        }
    },
    matrix_adv: {
        atLeastOneOf: {
            message: vep.getError('37'),
            additionalMembers: ['matrix_text']
        },
        presence: {
            message: vep.getError('32'),
            allowEmpty: false
        },
        length: {
            message: vep.getError('33b'),
            is: 6,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXX';
            }
        },
        numbersOnly: {
            message: vep.getError('33c')
        },
        inCatalog: {
            message: vep.getError('33a'),
            catalog: 'adv3',
            key: 'Kode'
        },
        nonUniqueEntry: {
            message: vep.getError('70'),
            catalog: 'adv3',
            key: 'Kode'
        }
    },
    matrix_text: {
        atLeastOneOf: {
            message: vep.getError('37'),
            additionalMembers: ['matrix_adv']
        }
    },
    process_state_adv: {
        dependentFieldEntry: {
            message: vep.getError('39'),
            field: 'operations_mode_adv',
            regex: '^4'
        },
        length: {
            message: vep.getError('40b'),
            is: 3,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXX';
            }
        },
        numbersOnly: {
            message: vep.getError('40c')
        },
        inCatalog: {
            message: vep.getError('40a'),
            catalog: 'adv12'
        }
    },
    sampling_reason_adv: {
        atLeastOneOf: {
            message: vep.getError('44'),
            additionalMembers: ['sampling_reason_text']
        },
        length: {
            message: vep.getError('42b'),
            is: 2,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XX';
            }
        },
        numbersOnly: {
            message: vep.getError('42c')
        },
        inCatalog: {
            message: vep.getError('42a'),
            catalog: 'adv4'
        }
    },
    sampling_reason_text: {
        atLeastOneOf: {
            message: vep.getError('44'),
            additionalMembers: ['sampling_reason_adv']
        }
    },
    operations_mode_adv: {
        atLeastOneOf: {
            message: vep.getError('71'),
            additionalMembers: ['operations_mode_text']
        },
        length: {
            message: vep.getError('46b'),
            is: 7,
            tokenizer: function (value: string) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXXX';
            }
        },
        numbersOnly: {
            message: vep.getError('46c')
        },
        inCatalog: {
            message: vep.getError('46a'),
            catalog: 'adv8'
        }
    },
    operations_mode_text: {
        atLeastOneOf: {
            message: vep.getError('71'),
            additionalMembers: ['operations_mode_adv']
        }
    },
    vvvo: {},
    comment: {}
};

function getConstraints(set: ConstraintSet) {
    switch (set) {
        case ConstraintSet.ZOMO:
            const c: IValidationConstraints = { ...standardConstrainst };
            _.forEach(c, (value: IValidationRuleSet, key) => {
                if (zoMoConstraints.hasOwnProperty(key)) {
                    c[key] = { ...value, ...zoMoConstraints[key] };
                }
            });
            return c;
        case ConstraintSet.STANDARD:
        default:
            return standardConstrainst;

    }
}

export {
    getConstraints
};
