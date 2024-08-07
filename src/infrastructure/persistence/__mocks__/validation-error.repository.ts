import { ParseValidationErrorRepository } from '../../../app/ports';

export const genericValidationErrors = [
    {
        code: 2,
        level: 2,
        message: 'Ihre Probenummer fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 3,
        level: 1,
        message: 'Probenummer kommt mehrfach vor (bei identischem Erreger).'
    },
    {
        code: 5,
        level: 2,
        message: 'Probenummer nach AVVData fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 6,
        level: 1,
        message:
            'Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger).'
    },
    {
        code: 8,
        level: 2,
        message:
            'Erreger nicht erkannt. Bitte korrigieren oder hier klicken und einen Eintrag auswählen.'
    },
    {
        code: 10,
        level: 2,
        message: 'Kein Erreger eingetragen.'
    },
    {
        code: 11,
        level: 1,
        message: 'Datum fehlt.'
    },
    {
        code: 12,
        level: 2,
        message: 'Dieses Datum gibt es nicht.'
    },
    {
        code: 13,
        level: 2,
        message: 'Datum liegt in der Zukunft.'
    },
    {
        code: 14,
        level: 2,
        message: 'Datum fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 15,
        level: 1,
        message: 'Datum fehlt.'
    },
    {
        code: 16,
        level: 2,
        message: 'Dieses Datum gibt es nicht.'
    },
    {
        code: 17,
        level: 2,
        message: 'Datum liegt in der Zukunft.'
    },
    {
        code: 18,
        level: 2,
        message: 'Datum fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 19,
        level: 2,
        message:
            'Entweder das Probenahme- oder das Isolationsdatum muss angegeben sein.'
    },
    {
        code: 20,
        level: 2,
        message: 'Probenahme erfolgte nach der Isolierung?'
    },
    {
        code: 24,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 313 enthalten.'
    },
    {
        code: 25,
        level: 1,
        message: 'Ortsname ohne PLZ angegeben.'
    },
    {
        code: 27,
        level: 2,
        message: 'Keine Postleitzahl. Postleitzahlen bestehen aus 5 Ziffern.'
    },
    {
        code: 28,
        level: 1,
        message: 'PLZ ohne Ortsname angegeben.'
    },
    {
        code: 33,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 319 enthalten.'
    },
    {
        code: 34,
        level: 2,
        message:
            'Bitte geben Sie den AVV DatA-Code für die Matrix an! (Pflicht bei ZoMo).'
    },
    {
        code: 37,
        level: 2,
        message: 'Bitte geben Sie eine Matrix an!'
    },
    {
        code: 42,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 322 enthalten.'
    },
    {
        code: 44,
        level: 1,
        message: 'Bitte geben Sie einen Probenahmegrund an!'
    },
    {
        code: 46,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 303 enthalten.'
    },
    {
        code: 48,
        level: 2,
        message: 'Keine Betriebsart angegeben (Pflicht bei ZoMo).'
    },
    {
        code: 49,
        level: 1,
        message:
            'Kombination aus Erreger, Matrix, Betriebsart und Jahr passt zu keinem Zoonosen-Monitoring-Programm.'
    },
    {
        code: 61,
        level: 1,
        message: 'War die Isolierung wirklich über 1 Jahr nach der Probennahme?'
    },
    {
        code: 62,
        level: 1,
        message: 'Datum liegt über 10 Jahre zurück.'
    },
    {
        code: 63,
        level: 1,
        message: 'Datum liegt über 10 Jahre zurück.'
    },
    {
        code: 64,
        level: 1,
        message: 'Ortsangabe fehlt.'
    },
    {
        code: 68,
        level: 1,
        message: 'Wenn vorhanden, geben Sie bitte auch ihre Probenummer ein.'
    },
    {
        code: 69,
        level: 2,
        message: 'Keine Probenummer angegeben.'
    },
    {
        code: 71,
        level: 1,
        message: 'Bitte tragen Sie eine Betriebsart ein!'
    },
    {
        code: 72,
        level: 1,
        message:
            'Das Format der Probenummer nach AVV DatA scheint nicht korrekt zu sein.'
    },
    {
        code: 75,
        level: 2,
        message: 'Keine gültige Postleitzahl.'
    },
    {
        code: 86,
        level: 2,
        message: 'Ortsangabe fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 88,
        level: 4,
        message:
            'Erreger erkannt. Eingegebener Code wurde durch Text aus AVV DatA-Katalog Nr. 324 ersetzt.'
    },
    {
        code: 95,
        level: 1,
        message:
            'Planproben sind normalerweise nicht für das NRL Antibiotikaresistenz bestimmt.'
    },
    {
        code: 96,
        level: 2,
        message: 'Dieser Erreger wird von keinem BfR-Labor untersucht.'
    },
    {
        code: 97,
        level: 1,
        message:
            'Ihre Daten passen zu einem Zoonosen-Monitoring-Programm. Bitte prüfen Sie noch einmal, ob Sie nicht als Grund in der Spalte "Kontrollprogramm" Code 70564|53075| bzw. Text "Zoonosen-Monitoring" angeben sollten.'
    },
    {
        code: 98,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 324 enthalten.'
    },
    {
        code: 99,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 339 enthalten.'
    },
    {
        code: 100,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 316 enthalten.'
    },
    {
        code: 101,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 326 enthalten.'
    },
    {
        code: 102,
        level: 1,
        message:
            'Das Format der AVV DatA Teilproben-Nr. scheint nicht korrekt zu sein.'
    },
    {
        code: 103,
        level: 4,
        message:
            'Code für Tier / Matrix erkannt. Entsprechender Text wurde aus AVV DatA-Katalog Nr. 339 / 319 eingefügt.'
    },
    {
        code: 104,
        level: 2,
        message:
            'Ungültiger Code. Code ist nicht im AVV DatA-Katalog Nr. 328 enthalten.'
    },
    {
        code: 105,
        level: 2,
        message: 'Programm fehlt (Pflicht bei ZoMo).'
    },
    {
        code: 106,
        level: 4,
        message:
            'Code für Probenahmeort erkannt. Entsprechender Text wurde aus AVV DatA-Katalog Nr. 313 eingefügt.'
    },
    {
        code: 107,
        level: 4,
        message:
            'Code für Kontrollprogramm / Untersuchungsgrund erkannt. Entsprechender Text wurde aus AVV DatA-Katalog Nr. 322 / 326 eingefügt.'
    },
    {
        code: 108,
        level: 4,
        message:
            'Code für Betriebsart erkannt. Entsprechender Text wurde aus AVV DatA-Katalog Nr. 303 eingefügt.'
    },
    {
        code: 110,
        level: 1,
        message:
            'Dies ist ein Hierarchieeintrag. Er ist korrekt, aber so allgemein, dass er nur einen geringen informativen Nutzen hat. Bitte verwenden Sie möglichst einen Basiseintrag plus Facetten.'
    },
    {
        code: 111,
        level: 1,
        message:
            'Dies ist ein Hierarchieeintrag. Er ist korrekt, aber so allgemein, dass er nur einen geringen informativen Nutzen hat. Bitte verwenden Sie möglichst einen Basiseintrag.'
    },
    {
        code: 112,
        level: 2,
        message:
            'Dies ist ein Basiseintrag, der allerdings noch Facetten benötigt, damit es ein gültiger AVV DatA-Code wird. Bitte ergänzen Sie Facetten.'
    }
];
export function getMockValidationErrorRepository(): ParseValidationErrorRepository {
    return {
        getAllErrors: jest.fn(() => Promise.resolve(genericValidationErrors))
    };
}
