import { NRL_ID } from '../enums';

export const sampleSheetMetaStrings = {
    header: {
        title: 'Untersuchungsauftrag für Isolate/Proben',
        titleSup: 'a,b',
        subtitle:
            'Erläuterungen zum Ausfüllen dieses Formulars befinden sich im zweiten Tabellenblatt dieser Datei',
        version: 'Version V'
    },
    recipient: {
        title: 'Empfänger',
        institute: 'Bundesinstitut für Risikobewertung',
        street: 'Diedersdorfer Weg 1',
        place: 'D-12277 Berlin',
        nrl: 'Labor'
    },
    stamp: {
        receiptDate: 'Eingangsdatum beim BfR',
        customerRefNumber: 'Aktenzeichen des Einsenders'
    },
    sender: {
        title: 'Einsender',
        instituteName: 'Institut',
        department: 'Abteilung',
        street: 'Strasse',
        place: 'PLZ, Ort',
        contactPerson: 'Ansprechpartner',
        telephone: 'Telefon-Nr.',
        email: 'Email-Adresse'
    },
    signature: {
        date: 'Ort, Datum',
        dataProcessingText: 'Informationen zur Datenverarbeitung: Siehe ',
        dataProcessingLink:
            'https://www.bfr.bund.de/de/datenschutzerklaerung-107546.html',
        dataProcessingHintPre:
            'Bitte beachten Sie die allgemeinen Bedingungen für den Austausch von Materialien – Vergabe an das BfR (Material Transfer-Bedingungen – Teil B (',
        dataProcessingHintLink:
            'https://www.bfr.bund.de/cm/343/mt-bedingungen-teil-b.pdf',
        dataProcessingHintPost: ')',
        signature: 'Unterschrift'
    },
    analysis: {
        title: 'Bitte führen Sie folgende Untersuchungen der Isolate durch',
        titleSup: 'c',
        options: {
            standard: 'Standard',
            active: 'X'
        },
        species:
            'Speziesbestimmung/-differenzierung (bzw. Bestätigung der Differenzierung)',
        serological: 'Serologische Differenzierung',
        resistance: 'Resistenzermittlung',
        vaccination: 'Impfstammidentifikation',
        molecularTyping: 'Weitergehende molekularbiologische Feintypisierung',
        molecularTypingSup: 'd',
        toxin: 'Prüfung auf Toxine bzw. Virulenzeigenschaften',
        esblAmpCCarbapenemasen: 'ESBL/AmpC/Carbapenemasen',
        other: 'sonstiges (nach Absprache):',
        compareHuman: 'Vergleiche mit humanen Isolaten',
        compareHumanSup: 'e'
    },
    urgency: {
        title: 'Dringlichkeit:'
    },
    instructions: {
        sendInstructionsPre:
            'Bitte lassen Sie diesen Untersuchungsauftrag durch das MiBi-Portal (',
        sendInstructionsLink: 'https://mibi-portal.bfr.bund.de',
        sendInstructionsPost:
            ') prüfen und senden Sie die Probendaten über die dort vorhandene Senden-Funktion an das BfR.',
        printInstructions:
            'Sie erhalten die geprüften Untersuchungsaufträge vom Portal per E-Mail. Drucken Sie diese bitte aus und legen Sie diese unterschrieben den Proben als Begleitschein bei.',
        cellProtectionInstruction1:
            'Felder im Einsendebogen sind ohne Schreibschutz zur erleichterten Nutzung/Einbindung in unterschiedliche Laborinformationsmanagement-Systeme. Änderungen von Zellinhalten außerhalb der Ausfüllfelder',
        cellProtectionInstruction2:
            'sind nicht zielführend und werden beim Einlesen der Daten durch das BfR nicht berücksichtigt.'

    },
    footer: {
        validated:
            'OE-Mibi-SOP-059_FB_A01_Elektronischer Einsendebogen_V16 gültig ab 26.06.2023',
        page: 'Seite',
        pageOf: 'von'
    }
};

export const sampleSheetSamplesStrings = {
    titles: {
        sample_id: 'Ihre Probe-nummer',
        sample_id_avv: 'Probe-nummer nach AVVData',
        partial_sample_id: 'AVV-DatA-Teil-Pro-ben-Nr.',
        pathogen_avv: 'Erreger',
        pathogen_text: 'Erreger',
        sampling_date: 'Datum der Probe-nahme',
        isolation_date: 'Datum der Isolie-rung',
        sampling_location_avv: 'Ort der Probe-nahme',
        sampling_location_zip: 'Ort der Pro-be-nah-me',
        sampling_location_text: 'Ort der Probe-nahme',
        animal_avv: 'Tiere',
        matrix_avv: 'Matrix',
        animal_matrix_text: 'Tiere/Matrix',
        primary_production_avv: 'Anga-ben zur Primär-produk-tion',
        control_program_avv: 'Kon-troll-pro-gramm',
        sampling_reason_avv: 'Unter-su-chungs-grund',
        program_reason_text: 'Kontroll-pro-gramm/ Untersu-chungs-grund',
        operations_mode_avv: 'Be-triebs-art',
        operations_mode_text: 'Betriebs-art',
        vvvo: 'VVVO-Nr / Herde',
        comment: 'Bemer-kung'
    },
    subtitles: {
        sample_id: '',
        sample_id_avv: '',
        partial_sample_id: '',
        pathogen_avv: '(Code oder Text aus AVV-DatA-Kat-Nr.324)',
        pathogen_text: '(Freitext)',
        sampling_date: '',
        isolation_date: '',
        sampling_location_avv: '(Code aus AVV-DatA-Kat-Nr.313)',
        sampling_location_zip: '(PLZ)',
        sampling_location_text: '(Freitext)',
        animal_avv: '(Code aus AVV-DatA-Kat-Nr.339)',
        matrix_avv: '(Code aus AVV-DatA-Kat-Nr.319)',
        animal_matrix_text: '(Freitext)',
        primary_production_avv: '(Code aus AVV-DatA-Kat-Nr.316)',
        control_program_avv: '(Code aus AVV-DatA-Kat-Nr.322)',
        sampling_reason_avv: '(Code aus AVV-DatA-Kat-Nr.326)',
        program_reason_text: '(Freitext)',
        operations_mode_avv: '(Code aus AVV-DatA-Kat-Nr.303)',
        operations_mode_text: '(Freitext)',
        vvvo: '',
        comment: '(u.a. Untersuchungs-programm)'
    }
};

export const sampleSheetNRLStrings: Record<NRL_ID, string> = {
    'NRL-AR': 'NRL für Antibiotikaresistenz',
    'NRL-Campy': 'NRL für Campylobacter',
    'NRL-VTEC': 'NRL für Escherichia coli einschließl. verotoxinbildende E. coli',
    'NRL-Staph':
        'NRL für koagulasepositive Staphylokokken einschl. Staphylococcus aureus',
    'NRL-Listeria': 'NRL für Listeria monocytogenes',
    'NRL-Salm':
        'NRL für Salmonella',
    'NRL-Trichinella': 'NRL für Trichinella',
    'KL-Vibrio': 'Konsiliarlabor für Vibrionen',
    'L-Bacillus': 'Labor für Sporenbildner, Bacillus spp.',
    'L-Clostridium': 'Labor für Sporenbildner, Clostridium spp.',
    'KL-Yersinia': 'Konsiliarlabor für Yersinia',
    'Labor nicht erkannt': ''
};
