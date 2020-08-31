import { NRL_ID } from '../enums';

export const sampleSheetMetaStrings = {
    header: {
        title: 'Untersuchungsauftrag für Isolate/Proben',
        titleSup: 'a,b',
        subtitle:
            'Erläuterungen zum Ausfüllen dieses Formulars befinden sich im zweiten Tabellenblatt dieser Datei',
        version: 'Version'
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
        dataProcessingHint:
            'Eingesandte Isolate können vom BfR auch für weitergehende Untersuchungen verwendet werden, z.B. für Ausbruchsuntersuchungen und zur Klärung wissenschaftlicher Fragestellungen.',
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
        phageTyping: 'Phagentypisierung',
        resistance: 'Resistenzermittlung',
        vaccination: 'Impfstammidentifikation',
        molecularTyping: 'Weitergehende molekularbiologische Feintypisierung',
        molecularTypingSup: 'd',
        toxin: 'Prüfung auf Toxine bzw. Virulenzeigenschaften',
        zoonosenIsolate: 'Isolate aus Zoonosen-Stichprobenplan',
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
            'Sie erhalten die geprüften Untersuchungsaufträge vom Portal per E-Mail. Drucken Sie diese bitte aus und legen Sie diese unterschrieben den Proben als Begleitschein bei.'
    },
    footer: {
        validated:
            'Dieses Formular wurde validiert durch OE-Mibi, AL-4 am 28.08.2020',
        sop: 'Mibi-SOP 059',
        page: 'Seite',
        pageOf: 'von'
    }
};

export const sampleSheetSamplesStrings = {
    titles: {
        sample_id: 'Ihre Probe-nummer',
        sample_id_avv: 'Probe-nummer nach AVVData',
        pathogen_adv: 'Erreger',
        pathogen_text: 'Erreger',
        sampling_date: 'Datum der Probe-nahme',
        isolation_date: 'Datum der Isolierung',
        sampling_location_adv: 'Ort der Probe-nahme',
        sampling_location_zip: 'Ort der Probe-nahme',
        sampling_location_text: 'Ort der Probe-nahme',
        topic_adv: 'Oberbe-griff (Kodier-system) der Matrizes',
        matrix_adv: 'Matrix Code',
        matrix_text: 'Matrix',
        process_state_adv: 'Ver-arbeitungs-zustand',
        sampling_reason_adv: 'Grund der Probe-nahme',
        sampling_reason_text: 'Grund der Probe-nahme',
        operations_mode_adv: 'Betriebsart',
        operations_mode_text: 'Betriebsart',
        vvvo: 'VVVO-Nr / Herde',
        comment: 'Bemerkung'
    },
    subtitles: {
        sample_id: '',
        sample_id_avv: '',
        pathogen_adv: '(Text aus ADV-Kat-Nr.16)',
        pathogen_text: '(Textfeld/ Ergänzung)',
        sampling_date: '',
        isolation_date: '',
        sampling_location_adv: '(Code aus ADV-Kat-Nr.9)',
        sampling_location_zip: '(PLZ)',
        sampling_location_text: '(Text)',
        topic_adv: '(Code aus ADV-Kat-Nr.2)',
        matrix_adv: '(Code aus ADV-Kat-Nr.3)',
        matrix_text: '(Textfeld/ Ergänzung)',
        process_state_adv: '(Code aus ADV-Kat-Nr.12)',
        sampling_reason_adv: '(Code aus ADV-Kat-Nr.4)',
        sampling_reason_text: '(Textfeld/ Ergänzung)',
        operations_mode_adv: '(Code aus ADV-Kat-Nr.8)',
        operations_mode_text: '(Textfeld/ Ergänzung)',
        vvvo: '',
        comment: '(u.a. Untersuchungs-programm)'
    }
};

export const sampleSheetNRLStrings: Record<NRL_ID, string> = {
    'NRL-AR': 'NRL Antibiotikaresistenz',
    'NRL-Campy': 'NRL Campylobacter',
    'NRL-VTEC': 'NRL Escherichia coli einschließlich verotoxinbildende E. coli',
    'NRL-Staph':
        'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus',
    'NRL-Listeria': 'NRL Listeria monocytogenes',
    'NRL-Salm':
        'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)',
    'NRL-Trichinella': 'NRL Trichinella',
    'NRL-Virus': 'NRL Überwachung von Viren in zweischaligen Weichtieren',
    'NRL-Vibrio': 'NRL Überwachung von Bakterien in zweischaligen Weichtieren',
    'L-Bacillus': 'Bacillus spp. ',
    'L-Clostridium': 'Clostridium spp. (C. difficile)',
    'KL-Leptospira': 'Leptospira',
    'KL-Yersinia': 'Yersinia',
    'Labor nicht erkannt': ''
};
