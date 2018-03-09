import * as _ from 'lodash';
import { logger, ServerError } from '../../../../../aspects';

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
            id: '3',
            level: 2,
            message: 'Probenummer kommt mehrfach vor(bei identischem Erreger)'
        },
        {
            code: 5,
            id: '5',
            level: 2,
            message: 'Probenummer nach AVVData fehlt (Pflicht bei ZoMo)'
        },
        {
            code: 6,
            id: '6',
            level: 2,
            message: 'Probenummer nach AVVData kommt mehrfach vor(bei identischem Erreger)'
        },
        {
            code: 8,
            id: '8',
            level: 2,
            message: 'Erreger nicht erkannt.Der Eintrag entspricht keinem Text oder Code in ADV - Katalog Nr. 16.'
        },
        {
            code: 10,
            id: '10',
            level: 2,
            message: 'Kein Erreger eingetragen'
        },
        {
            code: 11,
            id: '11',
            level: 1,
            message: 'Datum fehlt'
        },
        {
            code: 12,
            id: '12',
            level: 2,
            message: 'Dieses Datum gibt es nicht'
        },
        {
            code: 13,
            id: '13',
            level: 2,
            message: 'Datum liegt in der Zukunft'
        },
        {
            code: 14,
            id: '14',
            level: 2,
            message: 'Datum fehlt (Pflicht bei ZoMo)'
        },
        {
            code: 15,
            id: '15',
            level: 1,
            message: 'Datum fehlt'
        },
        {
            code: 16,
            id: '16',
            level: 2,
            message: 'Dieses Datum gibt es nicht'
        },
        {
            code: 17,
            id: '17',
            level: 2,
            message: 'Datum liegt in der Zukunft'
        },
        {
            code: 18,
            id: '18',
            level: 2,
            message: 'Datum fehlt (Pflicht bei ZoMo)'
        },
        {
            code: 19,
            id: '19',
            level: 2,
            message: 'Datum fehlt'
        },
        {
            code: 20,
            id: '20',
            level: 2,
            message: 'Probenahme erfolgte nach der Isolierung ?'
        },
        {
            code: 24,
            id: '24a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 9 enthalten oder es ist kein Code.'
        },
        {
            code: 24,
            id: '24b',
            level: 2,
            message: 'Falscher Code.ADV9 - Codes sind maximal 8 Ziffern lang.'
        },
        {
            code: 25,
            id: '25',
            level: 1,
            message: 'Ortsname ohne PLZ angegeben'
        },
        {
            code: 27,
            id: '27a',
            level: 2,
            message: 'Keine Postleitzahl.Postleitzahlen bestehen aus 5 Ziffern.'
        },
        {
            code: 27,
            id: '27b',
            level: 2,
            message: 'Keine gültige Postleitzahl.'
        },
        {
            code: 28,
            id: '28',
            level: 1,
            message: 'PLZ ohne Ortsname angegeben'
        },
        {
            code: 30,
            id: '30a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 2 enthalten'
        },
        {
            code: 30,
            id: '30b',
            level: 2,
            message: 'Falscher Code.ADV2 - Codes bestehen aus 2 Ziffern.'
        },
        {
            code: 30,
            id: '30c',
            level: 2,
            message: 'Falscher Code.ADV2 - Codes bestehen ausschliesslich aus Ziffern.'
        },
        {
            code: 32,
            id: '32',
            level: 1,
            message: 'Bitte geben Sie einen ADV - Code für die Matrix an!'
        },
        {
            code: 33,
            id: '33a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 3 enthalten'
        },
        {
            code: 33,
            id: '33b',
            level: 2,
            message: 'Falscher Code.ADV3 - Codes bestehen aus 6 Ziffern.'
        },
        {
            code: 33,
            id: '33c',
            level: 2,
            message: 'Falscher Code.ADV3 - Codes bestehen ausschliesslich aus Ziffern.'
        },
        {
            code: 34,
            id: '34',
            level: 2,
            message: 'Bitte geben Sie den ADV-Code für die Matrix an! (Pflicht bei ZoMo)'
        },
        {
            code: 37,
            id: '37',
            level: 2,
            message: 'Bitte geben Sie eine Matrix an!'
        },
        {
            code: 39,
            id: '39',
            level: 2,
            message: 'Bitte geben Sie einen ADV - Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)'
        },
        {
            code: 40,
            id: '40a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 12 enthalten'
        },
        {
            code: 40,
            id: '40b',
            level: 2,
            message: 'Falscher Code.ADV12 - Codes bestehen aus 3 Ziffern.'
        },
        {
            code: 40,
            id: '40c',
            level: 2,
            message: 'Falscher Code.ADV12 - Codes bestehen ausschliesslich aus Ziffern.'
        },
        {
            code: 42,
            id: '42a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 4 enthalten'
        },
        {
            code: 42,
            id: '42b',
            level: 2,
            message: 'Falscher Code.ADV4 - Codes bestehen aus 2 Ziffern.'
        },
        {
            code: 42,
            id: '42c',
            level: 2,
            message: 'Falscher Code.ADV4 - Codes bestehen ausschliesslich aus Ziffern.'
        },
        {
            code: 44,
            id: '44',
            level: 1,
            message: 'Bitte geben Sie einen Probenahme - Grund an!'
        },
        {
            code: 46,
            id: '46a',
            level: 2,
            message: 'Code ist nicht im ADV - Katalog Nr. 8 enthalten'
        },
        {
            code: 46,
            id: '46b',
            level: 2,
            message: 'Falscher Code.ADV8 - Codes bestehen aus 7 Ziffern.'
        },
        {
            code: 46,
            id: '46c',
            level: 2,
            message: 'Falscher Code.ADV8 - Codes bestehen ausschliesslich aus Ziffern.'
        },
        {
            code: 48,
            id: '48',
            level: 2,
            message: 'Keine Betriebsart angegeben (Pflicht bei ZoMo)'
        },
        {
            code: 49,
            id: '49',
            level: 1,
            message: 'Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose_monitoring-Programm'
        },
        {
            code: 61,
            id: '61',
            level: 1,
            message: 'War die Isolierung wirklich über 1 Jahr nach der Probennahme?'
        },
        {
            code: 62,
            id: '62',
            level: 1,
            message: 'Datum liegt über 10 Jahre zurück'
        },
        {
            code: 63,
            id: '63',
            level: 1,
            message: 'Datum liegt über 10 Jahre zurück'
        },
        {
            code: 64,
            id: '64a',
            level: 1,
            message: 'Ortsangabe fehlt'
        },
        {
            code: 64,
            id: '64b',
            level: 2,
            message: 'Ortsangabe fehlt (Pflicht bei ZoMo)'
        },
        {
            code: 68,
            id: '68',
            level: 1,
            message: 'Wenn vorhanden, geben Sie bitte auch ihre Probenummer ein'
        },
        {
            code: 69,
            id: '69',
            level: 2,
            message: 'Keine Probenummer angegeben'
        },
        {
            code: 70,
            id: '70',
            level: 2,
            message: "Matrix - Code ist nicht eindeutig.Bitte Spalte 'Oberbegriff (Kodiersystem) der Matrizes' ausüllen!" // Entweder 'nn' für '[ADV-Text]' oder 'nn' für '[ADV-Text]'.
        },
        {
            code: 71,
            id: '71',
            level: 1,
            message: 'Bitte tragen Sie eine Betriebsart ein!'
        }
    ];
    getError(id: string): IValidationError {
        const error = _.find(this.errors, e => e.id === id);
        if (!error) {
            logger.error('Error code not found: ', id);
            throw new ServerError('Error code not found: ' + id);
        }
        return error;
    }
}

export const validationErrorProvider = new ValidationErrorProvider();
