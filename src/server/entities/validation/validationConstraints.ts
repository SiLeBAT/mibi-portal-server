import * as _ from 'lodash';

interface IValidationErrorProvider {
    getError(id: string): IValidationError;
}

export interface IValidationError {
    id: string;
    code: number;
    level: number;
    message: string;
}

class ValidationErrorProvider implements IValidationErrorProvider {
    private errors: IValidationError[] = [

        {
            code: 3,
            id: "3",
            level: 2,
            message: "Probenummer kommt mehrfach vor(bei identischem Erreger)"
        },
        {
            code: 6,
            id: "6",
            level: 2,
            message: "Probenummer nach AVVData kommt mehrfach vor(bei identischem Erreger)"
        },
        {
            code: 8,
            id: "8",
            level: 2,
            message: "Erreger nicht erkannt.Der Eintrag entspricht keinem Text oder Code in ADV - Katalog Nr. 16."
        },
        {
            code: 10,
            id: "10",
            level: 2,
            message: "Kein Erreger eingetragen"
        },
        {
            code: 11,
            id: "11",
            level: 1,
            message: "Datum fehlt"
        },
        {
            code: 12,
            id: "12",
            level: 2,
            message: "Dieses Datum gibt es nicht"
        },
        {
            code: 13,
            id: "13",
            level: 2,
            message: "Datum liegt in der Zukunft"
        },
        {
            code: 15,
            id: "15",
            level: 1,
            message: "Datum fehlt"
        },
        {
            code: 16,
            id: "16",
            level: 2,
            message: "Dieses Datum gibt es nicht"
        },
        {
            code: 17,
            id: "17",
            level: 2,
            message: "Datum liegt in der Zukunft"
        },
        {
            code: 19,
            id: "19",
            level: 2,
            message: "Datum fehlt"
        },
        {
            code: 20,
            id: "20",
            level: 2,
            message: "Probenahme erfolgte nach der Isolierung ?"
        },
        {
            code: 24,
            id: "24a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 9 enthalten oder es ist kein Code."
        },
        {
            code: 24,
            id: "24b",
            level: 2,
            message: "Falscher Code.ADV9 - Codes sind maximal 8 Ziffern lang."
        },
        {
            code: 25,
            id: "25",
            level: 1,
            message: "Ortsname ohne PLZ angegeben"
        },
        {
            code: 27,
            id: "27a",
            level: 2,
            message: "Keine Postleitzahl.Postleitzahlen bestehen aus 5 Ziffern."
        },
        {
            code: 27,
            id: "27b",
            level: 2,
            message: "Keine gültige Postleitzahl."
        },
        {
            code: 28,
            id: "28",
            level: 1,
            message: "PLZ ohne Ortsname angegeben"
        },
        {
            code: 30,
            id: "30a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 2 enthalten"
        },
        {
            code: 30,
            id: "30b",
            level: 2,
            message: "Falscher Code.ADV2 - Codes bestehen aus 2 Ziffern."
        },
        {
            code: 30,
            id: "30c",
            level: 2,
            message: "Falscher Code.ADV2 - Codes bestehen ausschliesslich aus Ziffern."
        },
        {
            code: 32,
            id: "32",
            level: 1,
            message: "Bitte geben Sie einen ADV - Code f�r die Matrix an!"
        },
        {
            code: 33,
            id: "33a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 3 enthalten"
        },
        {
            code: 33,
            id: "33b",
            level: 2,
            message: "Falscher Code.ADV3 - Codes bestehen aus 6 Ziffern."
        },
        {
            code: 33,
            id: "33c",
            level: 2,
            message: "Falscher Code.ADV3 - Codes bestehen ausschliesslich aus Ziffern."
        },
        {
            code: 37,
            id: "37",
            level: 2,
            message: "Bitte geben Sie eine Matrix an!"
        },
        {
            code: 39,
            id: "39",
            level: 2,
            message: "Bitte geben Sie einen ADV - Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)"
        },
        {
            code: 40,
            id: "40a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 12 enthalten"
        },
        {
            code: 40,
            id: "40b",
            level: 2,
            message: "Falscher Code.ADV12 - Codes bestehen aus 3 Ziffern."
        },
        {
            code: 40,
            id: "40c",
            level: 2,
            message: "Falscher Code.ADV12 - Codes bestehen ausschliesslich aus Ziffern."
        },
        {
            code: 42,
            id: "42a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 4 enthalten"
        },
        {
            code: 42,
            id: "42b",
            level: 2,
            message: "Falscher Code.ADV4 - Codes bestehen aus 2 Ziffern."
        },
        {
            code: 42,
            id: "42c",
            level: 2,
            message: "Falscher Code.ADV4 - Codes bestehen ausschliesslich aus Ziffern."
        },
        {
            code: 44,
            id: "44",
            level: 1,
            message: "Bitte geben Sie einen Probenahme - Grund an!"
        },
        {
            code: 46,
            id: "46a",
            level: 2,
            message: "Code ist nicht im ADV - Katalog Nr. 8 enthalten"
        },
        {
            code: 46,
            id: "46b",
            level: 2,
            message: "Falscher Code.ADV8 - Codes bestehen aus 7 Ziffern."
        },
        {
            code: 46,
            id: "46c",
            level: 2,
            message: "Falscher Code.ADV8 - Codes bestehen ausschliesslich aus Ziffern."
        },
        {
            code: 61,
            id: "61",
            level: 1,
            message: "War die Isolierung wirklich über 1 Jahr nach der Probennahme?"
        },
        {
            code: 62,
            id: "62",
            level: 1,
            message: "Datum liegt über 10 Jahre zurück"
        },
        {
            code: 63,
            id: "63",
            level: 1,
            message: "Datum liegt über 10 Jahre zurück"
        },
        {
            code: 64,
            id: "64",
            level: 1,
            message: "Ortsangabe fehlt"
        },
        {
            code: 68,
            id: "68",
            level: 1,
            message: "Wenn vorhanden, geben Sie bitte auch ihre Probenummer ein"
        },
        {
            code: 69,
            id: "69",
            level: 2,
            message: "Keine Probenummer angegeben"
        },
        {
            code: 70,
            id: "70",
            level: 2,
            message: "Matrix - Code ist nicht eindeutig.Bitte Spalte 'Oberbegriff (Kodiersystem) der Matrizes' ausüllen!" //Entweder 'nn' für '[ADV-Text]' oder 'nn' für '[ADV-Text]'.
        },
        {
            code: 71,
            id: "71",
            level: 1,
            message: "Bitte tragen Sie eine Betriebsart ein!"
        }
    ]
    getError(id: string) {
        return _.find(this.errors, e => e.id === id);
    }
}

const vep = new ValidationErrorProvider();

export const constraints = {
    sample_id: {
        atLeastOneOf: {
            message: vep.getError("69"),
            additionalMembers: ["sample_id_avv"]
        },
        presence: {
            message: vep.getError("68"),
            allowEmpty: false
        }
    },
    sample_id_avv: {
        atLeastOneOf: {
            message: vep.getError("69"),
            additionalMembers: ["sample_id"]
        }
    },
    pathogen_adv: {
        atLeastOneOf: {
            message: vep.getError("10"),
            additionalMembers: ["pathogen_text"]
        }
    },
    pathogen_text: {
        atLeastOneOf: {
            message: vep.getError("10"),
            additionalMembers: ["pathogen_adv"]
        }
    },
    sampling_date: {
        atLeastOneOf: {
            message: vep.getError("19"),
            additionalMembers: ["isolation_date"]
        },
        presence: {
            message: vep.getError("11"),
            allowEmpty: false
        },
        date: {
            message: vep.getError("12")
        },
        futureDate: {
            message: vep.getError("13"),
            latest: 'NOW'
        },
        referenceDate: {
            message: vep.getError("20"),
            latest: 'isolation_date'
        },
        timeBetween: {
            message: vep.getError("61"),
            earliest: 'isolation_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            message: vep.getError("62"),
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    isolation_date: {
        atLeastOneOf: {
            message: vep.getError("19"),
            additionalMembers: ["sampling_date"]
        },
        presence: {
            message: vep.getError("15"),
            allowEmpty: false
        },
        date: {
            message: vep.getError("16"),
        },
        futureDate: {
            message: vep.getError("17"),
            latest: 'NOW'
        },
        referenceDate: {
            message: vep.getError("20"),
            earliest: 'sampling_date'
        },
        timeBetween: {
            message: vep.getError("61"),
            latest: 'sampling_date',
            modifier: {
                value: 1,
                unit: 'year'
            }
        },
        oldSample: {
            message: vep.getError("63"),
            earliest: 'NOW',
            modifier: {
                value: 10,
                unit: 'year'
            }
        }
    },
    sampling_location_adv: {
        atLeastOneOf: {
            message: vep.getError("64"),
            additionalMembers: ["sampling_location_zip", "sampling_location_text"]
        },
        length: {
            message: vep.getError("24b"),
            maximum: 8
        },
        inCatalog: {
            message: vep.getError("24a"),
            catalog: "adv9"
        }
    },
    sampling_location_zip: {
        atLeastOneOf: {
            message: vep.getError("64"),
            additionalMembers: ["sampling_location_adv", "sampling_location_text"]
        },
        dependentFields: {
            message: vep.getError("28"),
            dependents: ["sampling_location_text"]
        },
        length: {
            message: vep.getError("27a"),
            is: 5,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXX'
            },
            inCatalog: {
                message: vep.getError("27b"),
                catalog: "plz"
            }
        }
    },
    sampling_location_text: {
        atLeastOneOf: {
            message: vep.getError("64"),
            additionalMembers: ["sampling_location_adv", "sampling_location_zip"]
        },
        dependentFields: {
            message: vep.getError("25"),
            dependents: ["sampling_location_zip"]
        }
    },
    topic_adv: {
        length: {
            message: vep.getError("30b"),
            is: 2,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XX'
            }
        },
        numbersOnly: {
            message: vep.getError("30c")
        },
        inCatalog: {
            message: vep.getError("30a"),
            catalog: "adv2"
        }
    },
    matrix_adv: {
        atLeastOneOf: {
            message: vep.getError("37"),
            additionalMembers: ["matrix_text"]
        },
        presence: {
            message: vep.getError("32"),
            allowEmpty: false
        },
        length: {
            message: vep.getError("33b"),
            is: 6,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXX'
            }
        },
        numbersOnly: {
            message: vep.getError("33c"),
        },
        inCatalog: {
            message: vep.getError("33a"),
            catalog: "adv3",
            key: "Kode"
        },
        nonUniqueEntry: {
            message: vep.getError("70"),
            catalog: "adv3",
            key: "Kode"
        }
    },
    matrix_text: {
        atLeastOneOf: {
            message: vep.getError("37"),
            additionalMembers: ["matrix_adv"]
        }
    },
    process_state_adv: {
        dependentFieldEntry: {
            message: vep.getError("39"),
            field: "operations_mode_adv",
            regex: "^1"
        },
        length: {
            message: vep.getError("40b"),
            is: 3,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XXX'
            }
        },
        numbersOnly: {
            message: vep.getError("40c"),
        },
        inCatalog: {
            message: vep.getError("40a"),
            catalog: "adv12"
        }
    },
    sampling_reason_adv: {
        atLeastOneOf: {
            message: vep.getError("44"),
            additionalMembers: ["sampling_reason_text"]
        },
        length: {
            message: vep.getError("42b"),
            is: 2,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XX'
            }
        },
        numbersOnly: {
            message: vep.getError("42c"),
        },
        inCatalog: {
            message: vep.getError("42a"),
            catalog: "adv4"
        }
    },
    sampling_reason_text: {
        atLeastOneOf: {
            message: vep.getError("44"),
            additionalMembers: ["sampling_reason_adv"]
        }
    },
    operations_mode_adv: {
        atLeastOneOf: {
            message: vep.getError("71"),
            additionalMembers: ["operations_mode_text"]
        },
        length: {
            message: vep.getError("46b"),
            is: 7,
            tokenizer: function (value) {
                // Necessary to deal with empty strings
                return value ? value : 'XXXXXXX'
            }
        },
        numbersOnly: {
            message: vep.getError("46c"),
        },
        inCatalog: {
            message: vep.getError("46a"),
            catalog: "adv8"
        }
    },
    operations_mode_text: {
        atLeastOneOf: {
            message: vep.getError("71"),
            additionalMembers: ["operations_mode_adv"]
        }
    },
    vvvo: "",
    comment: ""

}
