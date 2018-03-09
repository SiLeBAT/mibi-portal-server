import * as _ from 'lodash';

import { createSample, createSampleCollection } from './../src/server/sampleManagement/validation/entities';
import { validateSamples } from './../src/server/sampleManagement/validation/interactors';
import { createCatalogRepository } from './../src/server/sampleManagement/validation/persistence';

// tslint:disable
const testArray = [
    {
        sample_id: "0",
        sample_id_avv: "2016MEL098761",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "1",
        matrix_adv: "100200V",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "50",
        sampling_reason_text: "Importprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "SH7 Mastpute/Blinddarm"
    },
    {
        sample_id: "",
        sample_id_avv: "",
        pathogen_adv: "Escherichia coli",
        pathogen_text: "",
        sampling_date: "14.11.15",
        isolation_date: "15.11.15",
        sampling_location_adv: "15087220",
        sampling_location_zip: "01066",
        sampling_location_text: "Hettstedt, Stadt",
        topic_adv: "120103",
        matrix_adv: "201",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "036",
        sampling_reason_adv: "21",
        sampling_reason_text: "",
        operations_mode_adv: " 4010100",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "SH6 Masthähnchen/Blinddarm"
    },
    {
        sample_id: "3",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli AmpC-bildend",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "201002",
        matrix_adv: "402",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "39778",
        sampling_reason_adv: "27122",
        sampling_reason_text: "",
        operations_mode_adv: "2029999",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "SH6 Masthähnchen/Halshaut"
    },
    {
        sample_id: "3",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli AmpC-bildend",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "260000",
        matrix_adv: "Leber",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "39782",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "2030300",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "4",
        sample_id_avv: "",
        pathogen_adv: " ",
        pathogen_text: " ",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "50",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "40",
        sampling_reason_adv: "81 EH 11",
        sampling_reason_text: "",
        operations_mode_adv: "40100000",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "5",
        sample_id_avv: "",
        pathogen_adv: "",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "15",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "1000000",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "6",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli AmpC-bildend",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "S",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "Keine Angabe",
        sampling_reason_adv: "81 EH11",
        sampling_reason_text: "",
        operations_mode_adv: "Imbissbetrieb einschl. mobile Einrichtung",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-EH11"
    },
    {
        sample_id: "7",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "",
        pathogen_text: "E. coli",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "15",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "Ohne Haut",
        sampling_reason_adv: "Hyg.",
        sampling_reason_text: "",
        operations_mode_adv: "keine Angabe",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Betrieb S aus M"
    },
    {
        sample_id: "8",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli AmpC-Resistenz",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "15088330",
        sampling_location_zip: "06258",
        sampling_location_text: "Schkopau",
        topic_adv: "15",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "Tiefgekühlt/tiefgefroren",
        sampling_reason_adv: "Planprobe",
        sampling_reason_text: "",
        operations_mode_adv: "1xxxxxx",
        operations_mode_text: "",
        vvvo: "",
        comment: "Betrieb S aus M, Nachproben"
    },
    {
        sample_id: "9",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "63502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "roh",
        sampling_reason_adv: "VO2073-LMU",
        sampling_reason_text: "",
        operations_mode_adv: "401xxxx",
        operations_mode_text: "Jagdrevier",
        vvvo: "",
        comment: "pos. in 25g/"
    },
    {
        sample_id: "10",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "verzehrfähig vor-/zubereitet",
        sampling_reason_adv: "Z2016-EH11",
        sampling_reason_text: "",
        operations_mode_adv: "4010000 ",
        operations_mode_text: "keine Angabe",
        vvvo: "",
        comment: "Betrieb P"
    },
    {
        sample_id: "11",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: " Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81 EH 11",
        sampling_reason_text: "",
        operations_mode_adv: " 4010000",
        operations_mode_text: "Putenmäster",
        vvvo: "",
        comment: "Bitte Abgleich (s.o.)"
    },
    {
        sample_id: "12",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend ",
        pathogen_text: "",
        sampling_date: "31.11.2016",
        isolation_date: "1.12.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "Gemüsesalat, gemischt",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "005",
        sampling_reason_adv: "10 ",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "EH13"
    },
    {
        sample_id: "13",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "0501091",
        pathogen_text: "",
        sampling_date: "14.11.46",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: " 10",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Einzelhändler",
        vvvo: "",
        comment: "LUP2016-005"
    },
    {
        sample_id: "14",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "15",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "0801014",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: " 01",
        matrix_adv: "001001",
        matrix_text: "Mastkälber; Muskulatur",
        process_state_adv: "52 ",
        sampling_reason_adv: " ",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "privater Tierhalter",
        vvvo: "",
        comment: "Zusammenhang mit Schwangerenlisteriose"
    },
    {
        sample_id: "16",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "1002001",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "31.11.2016",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01 ",
        matrix_adv: "00100x",
        matrix_text: "Mastkälber; Muskulatur",
        process_state_adv: " 52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "pos.in 25 g/ < 10 KbE/g"
    },
    {
        sample_id: "17",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.46",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "1x",
        matrix_adv: "0010xx",
        matrix_text: "Mastkälber; Muskulatur",
        process_state_adv: "52x",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Erzeuger",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "18",
        sample_id_avv: " ",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: " ",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "19",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Campylobacter spp",
        pathogen_text: "",
        sampling_date: "",
        isolation_date: "",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "001xxx",
        matrix_text: "Mastkälber; Muskulatur",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Milcherzeuger",
        vvvo: "",
        comment: "?"
    },
    {
        sample_id: "20",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Campylobacter spp.",
        pathogen_text: "",
        sampling_date: "15.11.16",
        isolation_date: "14.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: " 063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Schlachthof",
        vvvo: "",
        comment: "Isolat und alle Infos bereits zuvor übermittelt, aber nicht mit richtigem Grund der Probenahme und der AVV Data-Nummer"
    },
    {
        sample_id: "21",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "E. coli",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063502 ",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "276055580120009",
        vvvo: "",
        comment: "Z2016-EH11"
    },
    {
        sample_id: "22",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "E.coli",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "20",
        sampling_reason_text: "Verdachtsprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "23",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "ESBL",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "Lebensmittelgeschäft und (eigenständige) -verkaufsabteilung (incl. Supermarkt)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "24",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "ESBL-verdächtig",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087xxx",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "160113",
        operations_mode_text: "Hersteller und Abpacker",
        vvvo: "",
        comment: "Isolat und alle Infos bereits zuvor übermittelt, aber nicht mit richtigem Grund der Probenahme"
    },
    {
        sample_id: "25",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Enterobacter cloacae",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010xxx",
        operations_mode_text: "Futtermittelbetrieb",
        vvvo: "",
        comment: "WI 9"
    },
    {
        sample_id: "26",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "800000",
        operations_mode_text: "Bäckerei",
        vvvo: "",
        comment: "EH 12"
    },
    {
        sample_id: "27",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "01000",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: " ",
        operations_mode_text: "Schlachthof",
        vvvo: "",
        comment: "SH7"
    },
    {
        sample_id: "28",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmittelgeschäft und (eigenständige) -verkaufsabteilung (incl. Supermarkt) ",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "29",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Hersteller die im wesentlichen auf der Stufe des Einzelhandels verkaufen",
        vvvo: "",
        comment: "EH 11"
    },
    {
        sample_id: "30",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL/AmpC-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "16",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Einzelhandel",
        vvvo: "",
        comment: "EH 13"
    },
    {
        sample_id: "31",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "32",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Klebsiella spp.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Hersteller von Fleisch und Fleischerzeugnissen",
        vvvo: "",
        comment: "EH  10"
    },
    {
        sample_id: "33",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L. monocytogenes",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "198765",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "34",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "2000000",
        operations_mode_text: "Erzeuger",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "35",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L. spp. (L.seeligeri)",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087031 ",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "15",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Dienstleistungsbetriebe",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "36",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L.Mono",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "15087xxx",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Fleischerei/Metzgerei ohne Schlachthaus",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "37",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L.monocytogenes quantitativ",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: " 15087031",
        sampling_location_zip: "06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "",
        matrix_text: "",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Milcherzeuger",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "38",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L.monocytogenes quantitativ 1,0e1",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3458007",
        sampling_location_zip: "06880",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "Direktvermarkter Geflügelfleisch Geflügelfleischerzeugnisse",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "39",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "L.monocytogenes quantitativ 1,5e1",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3458014",
        sampling_location_zip: "24929",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Fleischerei/Metzgerei mit Schlachthaus",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "40",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Liesteria spp.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3453004",
        sampling_location_zip: "29232",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "70",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Speisegaststätte",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "41",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3351023",
        sampling_location_zip: "29696",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "42",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Listeria mono.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "146254800300",
        sampling_location_zip: "31108",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "19",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Metzgereifiliale Fleischereifiliale und (eigenständige) -verkaufsabteilung",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "43",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Listeria monocytogenes",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "146270600200",
        sampling_location_zip: "32127",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Hersteller auf Einzelhandelsstufe",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "44",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Listeria monozytogenes",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3454018",
        sampling_location_zip: "45310",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Direktvermarkter Fleisch Fleischerzeugnisse Wurstwaren",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "45",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Listeria spp.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "145223100500",
        sampling_location_zip: "49393",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "EZ",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "46",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "SK1 L. mono",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "145242001000",
        sampling_location_zip: "69208",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "6040999",
        operations_mode_text: "Großhändler",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "47",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "SK1 L. mono.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "146120007430",
        sampling_location_zip: "72101",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "48",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "03361011",
        sampling_location_zip: "76401",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "15",
        matrix_adv: "102033",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "",
        operations_mode_text: "",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "49",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.15",
        isolation_date: "15.11.15",
        sampling_location_adv: "0591300",
        sampling_location_zip: "79411",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "181010",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "50",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "SK2 L. spp. (L. innocua)",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "145110009200",
        sampling_location_zip: "89151",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: ""
    },
    {
        sample_id: "61",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "SK2 L. spp. (L.innocua)",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.17",
        sampling_location_adv: "146271801000",
        sampling_location_zip: "nicht lesbar",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "62",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "STEC",
        pathogen_text: "",
        sampling_date: "14.11.06",
        isolation_date: "15.11.16",
        sampling_location_adv: "146272109",
        sampling_location_zip: " 06333",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "63",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia hermanii",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.06",
        sampling_location_adv: "146272109010",
        sampling_location_zip: "06333 ",
        sampling_location_text: "Arnstein, Stadt",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "64",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "147292600300",
        sampling_location_zip: " ",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "65",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "0801013",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3352011",
        sampling_location_zip: "0633x",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "101033",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Verbraucher-haushalt",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "66",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "3451004",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "120300",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "3",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli AmpC-bildend",
        pathogen_text: "",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "5116000",
        sampling_location_zip: "6258",
        sampling_location_text: "Schkopau",
        topic_adv: "15",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "1000000",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "3",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli",
        pathogen_text: "AmpC",
        sampling_date: "17.11.16",
        isolation_date: "18.11.16",
        sampling_location_adv: "5119000",
        sampling_location_zip: "062582",
        sampling_location_text: "Schkopau",
        topic_adv: "15",
        matrix_adv: "501011",
        matrix_text: "Wildschweine; Kot",
        process_state_adv: "",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "1000000",
        operations_mode_text: "Erzeuger (Urproduktion)",
        vvvo: "",
        comment: "Z2016-WI9"
    },
    {
        sample_id: "67",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "5366028",
        sampling_location_zip: "06258",
        sampling_location_text: "Aachen",
        topic_adv: "01",
        matrix_adv: "063502",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "81",
        sampling_reason_text: "Zoonosen-Monitoring - Planprobe",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "",
        sample_id_avv: "2016MEL098765",
        pathogen_adv: "Campylobacter sp.",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "Mainz",
        sampling_location_zip: "6333",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "101033",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: "52",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "",
        sample_id_avv: "",
        pathogen_adv: "L. spp. (L. innocua)",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "120300",
        matrix_text: "Hähnchen auch tiefgefroren",
        process_state_adv: " ",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "Z2016-EH10"
    },
    {
        sample_id: "70",
        sample_id_avv: "",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "",
        matrix_adv: "101030",
        matrix_text: "Masthähnchen/Masthühner; Haut mit Fett",
        process_state_adv: "052",
        sampling_reason_adv: "",
        sampling_reason_text: "",
        operations_mode_adv: "4010000",
        operations_mode_text: "Lebensmitteleinzelhandel",
        vvvo: "",
        comment: "EH  10"
    },
    {
        sample_id: "71",
        sample_id_avv: "",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.11.16",
        isolation_date: "15.11.16",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH10"
    },
    {
        sample_id: "72",
        sample_id_avv: "",
        pathogen_adv: "Escherichia coli ESBL-bildend",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "73",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "74",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "4010xxx",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "75",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "15",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "4000000",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "76",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "1000000",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "77",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063501",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "4000000",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    },
    {
        sample_id: "78",
        sample_id_avv: "",
        pathogen_adv: "Campylobacter",
        pathogen_text: "",
        sampling_date: "14.7.17",
        isolation_date: "15.7.17",
        sampling_location_adv: "",
        sampling_location_zip: "",
        sampling_location_text: "",
        topic_adv: "01",
        matrix_adv: "063499",
        matrix_text: "",
        process_state_adv: "",
        sampling_reason_adv: "81",
        sampling_reason_text: "",
        operations_mode_adv: "4000000",
        operations_mode_text: "",
        vvvo: "",
        comment: "EH15"
    }
];

const sampleArray = testArray.map(e => {
    return createSample(e);
})

const sampleCollection = createSampleCollection(sampleArray);
createCatalogRepository().then(
    (repo) => {
        const errors = validateSamples(sampleCollection).getSamples().forEach((s, i) => {
            const errors = s.getErrors();
            checkVal(errors, i, s.isZoMo)
        });
        // const one = validateSamples(sampleCollection).getSamples()[0]
        // checkVal(one.getErrors(), 0, one.isZoMo)
    }
).catch(
    err => console.log(err)
);

function checkVal(error: any, i: any, isZoMo: any) {
    const actual = getErrorCode(error);
    const expected = getExpCode(i + 1);
    const knimeNotJs = [...diff(expected, actual)];
    const jsNotKnime = [...diff(actual, expected)];_

    //knimeNotJs.length > 0 ? console.log("Zeile " + (i + 1) + ": Caught by Knime not by JS" + (isZoMo ? "(ZOMO)" : "") + ": ", knimeNotJs) : '';
    jsNotKnime.length > 0 ? console.log("Zeile " + (i + 1) + ": Caught by JS not by Knime: ", jsNotKnime) : '';

}

function diff(actual: any, expected: any) {
    return new Set(
        [...actual].filter(x => !expected.has(x)));
}

function getErrorCode(e: any) {
    const errorSet = new Set();
    _.forEach(e, i => {
        i.forEach((k: any) => {
            errorSet.add(k.code)
        })
    });
    return errorSet;

}

const expecetedErrors = [
    {
        Kommentar: "Code erkannt. '1' wurde durch '01' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 1,
        Original: "1",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 1,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '40' wurde durch '040' (Unverarbeitet/roh) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 5,
        Original: "40",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher ADV2-Code. 'S' wurde durch den zum ADV3-Code '501011' passenden Code '15' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 7,
        Original: "S",
        FehlerNr: null
    },
    {
        Kommentar: "Text entspricht dem ADV12-Text. 'Keine Angabe' wurde durch '999' ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 7,
        Original: "Keine Angabe",
        FehlerNr: null
    },
    {
        Kommentar: "Text entspricht dem ADV12-Text. 'Ohne Haut' wurde durch '052' ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 8,
        Original: "Ohne Haut",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text '[Leere Zelle]' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 8,
        Original: null,
        FehlerNr: null
    },
    {
        Kommentar: "Text entspricht dem ADV12-Text. 'Tiefgekühlt/tiefgefroren' wurde durch '023' ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 9,
        Original: "Tiefgekühlt/tiefgefroren",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '1xxxxxx' wurde durch '1000000' ersetzt.",
        Status: 4,
        Spalte: "16",
        Zeile: 9,
        Original: "1xxxxxx",
        FehlerNr: 46
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Escherichia coli AmpC-Resistenz' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 9,
        Original: "Escherichia coli AmpC-Resistenz",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '63502' wurde durch '063502' (Hähnchen auch tiefgefroren) ersetzt.",
        Status: 4,
        Spalte: "11",
        Zeile: 10,
        Original: "63502",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '401xxxx' wurde durch '4010000' ersetzt.",
        Status: 4,
        Spalte: "16",
        Zeile: 10,
        Original: "401xxxx",
        FehlerNr: 46
    },
    {
        Kommentar: "Text enthält kleine Abweichungen zum ADV12-Text. 'verzehrfähig vor-/zubereitet' wurde durch '037' (Verzehrsfähig vor-/zubereitet) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 11,
        Original: "verzehrfähig vor-/zubereitet",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 12,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 14,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "ADV16-Code '0501091' wurde erkannt und durch den entsprechenden ADV-Text 'Enterobacteriaceae ESBL-bildend' ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 14,
        Original: "0501091",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 15,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher ADV2-Code. '01' wurde durch den zum ADV3-Code '001001' passenden Code '15' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 16,
        Original: "01",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 16,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "ADV16-Code '0801014' wurde erkannt und durch den entsprechenden ADV-Text 'Escherichia coli Carbapenemase-bildend' ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 16,
        Original: "0801014",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 17,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "ADV16-Code '1002001' wurde erkannt und durch den entsprechenden ADV-Text 'Listeria monocytogenes' ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 17,
        Original: "1002001",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 18,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Fehlender ADV2-Code wurde anhand von ADV3-Code ergänzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 19,
        Original: "",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 19,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 20,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter spp' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 20,
        Original: "Campylobacter spp",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 21,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter spp.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 21,
        Original: "Campylobacter spp.",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 22,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'E. coli' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 22,
        Original: "E. coli",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 23,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'E.coli' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 23,
        Original: "E.coli",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 24,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'ESBL' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 24,
        Original: "ESBL",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 25,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'ESBL-verdächtig' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 25,
        Original: "ESBL-verdächtig",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '15087xxx' wurde durch '15087' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 25,
        Original: "15087xxx",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 26,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '4010xxx' wurde durch '4010000' ersetzt.",
        Status: 4,
        Spalte: "16",
        Zeile: 26,
        Original: "4010xxx",
        FehlerNr: 46
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 27,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 28,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 29,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Escherichia coli ESBL' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 29,
        Original: "Escherichia coli ESBL",
        FehlerNr: null
    },
    {
        Kommentar: "Fehlender ADV2-Code wurde anhand von ADV3-Code ergänzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 30,
        Original: null,
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 30,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 31,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Fehlender ADV2-Code wurde anhand von ADV3-Code ergänzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 32,
        Original: null,
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 32,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 33,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Klebsiella spp.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 33,
        Original: "Klebsiella spp.",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 34,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L. monocytogenes' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 34,
        Original: "L. monocytogenes",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 35,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher ADV2-Code. '15' wurde durch den zum ADV3-Code '063502' passenden Code '01' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 36,
        Original: "15",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 36,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L. spp. (L.seeligeri)' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 36,
        Original: "L. spp. (L.seeligeri)",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 37,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L.Mono' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 37,
        Original: "L.Mono",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '15087xxx' wurde durch '15087' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 37,
        Original: "15087xxx",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 38,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L.monocytogenes quantitativ' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 38,
        Original: "L.monocytogenes quantitativ",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L.monocytogenes quantitativ 1,0e1' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 39,
        Original: "L.monocytogenes quantitativ 1,0e1",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3458007' wurde durch '03458007' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 39,
        Original: "3458007",
        FehlerNr: 24
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L.monocytogenes quantitativ 1,5e1' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 40,
        Original: "L.monocytogenes quantitativ 1,5e1",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3458014' wurde durch '03458014' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 40,
        Original: "3458014",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '3453004' wurde durch '03453004' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 41,
        Original: "3453004",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 42,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3351023' wurde durch '03351023' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 42,
        Original: "3351023",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 43,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Listeria mono.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 43,
        Original: "Listeria mono.",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 44,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 45,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Listeria monozytogenes' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 45,
        Original: "Listeria monozytogenes",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3454018' wurde durch '03454018' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 45,
        Original: "3454018",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 46,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Listeria spp.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 46,
        Original: "Listeria spp.",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 47,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'SK1 L. mono' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 47,
        Original: "SK1 L. mono",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 48,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'SK1 L. mono.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 48,
        Original: "SK1 L. mono.",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 49,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 50,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 51,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'SK2 L. spp. (L. innocua)' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 51,
        Original: "SK2 L. spp. (L. innocua)",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 52,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'SK2 L. spp. (L.innocua)' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 52,
        Original: "SK2 L. spp. (L.innocua)",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 53,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'STEC' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 53,
        Original: "STEC",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 54,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Escherichia hermanii' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 54,
        Original: "Escherichia hermanii",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 55,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher ADV2-Code. '01' wurde durch den zum ADV3-Code '101033' passenden Code '15' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 56,
        Original: "01",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 56,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "ADV16-Code '0801013' wurde erkannt und durch den entsprechenden ADV-Text 'Escherichia coli ESBL/AmpC-bildend' ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 56,
        Original: "0801013",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3352011' wurde durch '03352011' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 56,
        Original: "3352011",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 57,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '3451004' wurde durch '03451004' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 57,
        Original: "3451004",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '5116000' wurde durch '05116000' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 58,
        Original: "5116000",
        FehlerNr: 24
    },
    {
        Kommentar: "Postleitzahl erkannt. '6258' wurde durch '06258' ersetzt.",
        Status: 4,
        Spalte: "8",
        Zeile: 58,
        Original: "6258",
        FehlerNr: 27
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Escherichia coli' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 59,
        Original: "Escherichia coli",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '5119000' wurde durch '05119000' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 59,
        Original: "5119000",
        FehlerNr: 24
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 60,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '5366028' wurde durch '05366028' ersetzt.",
        Status: 4,
        Spalte: "7",
        Zeile: 60,
        Original: "5366028",
        FehlerNr: 24
    },
    {
        Kommentar: "Falscher ADV2-Code. '01' wurde durch den zum ADV3-Code '101033' passenden Code '15' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 61,
        Original: "01",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '52' wurde durch '052' (Ohne Haut) ersetzt.",
        Status: 4,
        Spalte: "13",
        Zeile: 61,
        Original: "52",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter sp.' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 61,
        Original: "Campylobacter sp.",
        FehlerNr: null
    },
    {
        Kommentar: "Postleitzahl erkannt. '6333' wurde durch '06333' ersetzt.",
        Status: 4,
        Spalte: "8",
        Zeile: 61,
        Original: "6333",
        FehlerNr: 27
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'L. spp. (L. innocua)' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 62,
        Original: "L. spp. (L. innocua)",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 66,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Code erkannt. '4010xxx' wurde durch '4010000' ersetzt.",
        Status: 4,
        Spalte: "16",
        Zeile: 67,
        Original: "4010xxx",
        FehlerNr: 46
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 67,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher ADV2-Code. '15' wurde durch den zum ADV3-Code '063501' passenden Code '01' ersetzt.",
        Status: 4,
        Spalte: "10",
        Zeile: 68,
        Original: "15",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 68,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 69,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 70,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Erreger erkannt. Ursprünglicher Text 'Campylobacter' wurde durch Text aus ADV-Katalog Nr. 16 ersetzt.",
        Status: 4,
        Spalte: "3",
        Zeile: 71,
        Original: "Campylobacter",
        FehlerNr: null
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 1,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Falscher Code. ADV2-Codes bestehen aus 2 Ziffern.",
        Status: 2,
        Spalte: "10",
        Zeile: 2,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen aus 6 Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 2,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 4 enthalten",
        Status: 2,
        Spalte: "14",
        Zeile: 2,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Keine Probenummer angegeben",
        Status: 2,
        Spalte: "1;2",
        Zeile: 2,
        Original: null,
        FehlerNr: 69
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 2,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "1",
        Zeile: 3,
        Original: null,
        FehlerNr: 3
    },
    {
        Kommentar: "Falscher Code. ADV2-Codes bestehen aus 2 Ziffern.",
        Status: 2,
        Spalte: "10",
        Zeile: 3,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen aus 6 Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 3,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Falscher Code. ADV12-Codes bestehen aus 3 Ziffern.",
        Status: 2,
        Spalte: "13",
        Zeile: 3,
        Original: null,
        FehlerNr: 40
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen aus 2 Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 3,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 8 enthalten",
        Status: 2,
        Spalte: "16",
        Zeile: 3,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 3,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Probenummer kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "1",
        Zeile: 4,
        Original: null,
        FehlerNr: 3
    },
    {
        Kommentar: "Falscher Code. ADV2-Codes bestehen aus 2 Ziffern.",
        Status: 2,
        Spalte: "10",
        Zeile: 4,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 4,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Falscher Code. ADV12-Codes bestehen aus 3 Ziffern.",
        Status: 2,
        Spalte: "13",
        Zeile: 4,
        Original: null,
        FehlerNr: 40
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 8 enthalten",
        Status: 2,
        Spalte: "16",
        Zeile: 4,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 4,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 2 enthalten",
        Status: 2,
        Spalte: "10",
        Zeile: 5,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 5,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Falscher Code. ADV8-Codes bestehen aus 7 Ziffern.",
        Status: 2,
        Spalte: "16",
        Zeile: 5,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Kein Erreger eingetragen",
        Status: 2,
        Spalte: "3;4",
        Zeile: 5,
        Original: null,
        FehlerNr: 10
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 6,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Kein Erreger eingetragen",
        Status: 2,
        Spalte: "3;4",
        Zeile: 6,
        Original: null,
        FehlerNr: 10
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 7,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Falscher Code. ADV8-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "16",
        Zeile: 7,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 7,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Falscher Code. ADV8-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "16",
        Zeile: 8,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 9,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Falscher Code. ADV12-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "13",
        Zeile: 10,
        Original: null,
        FehlerNr: 40
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 10,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 11,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Kein Erreger eingetragen",
        Status: 2,
        Spalte: "3;4",
        Zeile: 11,
        Original: null,
        FehlerNr: 10
    },
    {
        Kommentar: "Falscher Code. ADV4-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "14",
        Zeile: 12,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 12,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Falscher Code. ADV2-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "10",
        Zeile: 13,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 13,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Dieses Datum gibt es nicht",
        Status: 2,
        Spalte: "5",
        Zeile: 13,
        Original: null,
        FehlerNr: 12
    },
    {
        Kommentar: "Datum liegt in der Zukunft",
        Status: 2,
        Spalte: "5",
        Zeile: 14,
        Original: null,
        FehlerNr: 13
    },
    {
        Kommentar: "Probenahme erfolgte nach der Isolierung?",
        Status: 2,
        Spalte: "5;6",
        Zeile: 14,
        Original: null,
        FehlerNr: 20
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 15,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Datum fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "5",
        Zeile: 15,
        Original: null,
        FehlerNr: 14
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 17,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Dieses Datum gibt es nicht",
        Status: 2,
        Spalte: "6",
        Zeile: 17,
        Original: null,
        FehlerNr: 16
    },
    {
        Kommentar: "Falscher Code. ADV2-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "10",
        Zeile: 18,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 18,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Falscher Code. ADV12-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "13",
        Zeile: 18,
        Original: null,
        FehlerNr: 40
    },
    {
        Kommentar: "Datum liegt in der Zukunft",
        Status: 2,
        Spalte: "6",
        Zeile: 18,
        Original: null,
        FehlerNr: 17
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 19,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Datum fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "6",
        Zeile: 19,
        Original: null,
        FehlerNr: 18
    },
    {
        Kommentar: "Falscher Code. ADV3-Codes bestehen ausschliesslich aus Ziffern.",
        Status: 2,
        Spalte: "11",
        Zeile: 20,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Datum fehlt",
        Status: 2,
        Spalte: "5;6",
        Zeile: 20,
        Original: null,
        FehlerNr: 19
    },
    {
        Kommentar: "Probenahme erfolgte nach der Isolierung?",
        Status: 2,
        Spalte: "5;6",
        Zeile: 21,
        Original: null,
        FehlerNr: 20
    },
    {
        Kommentar: "Falscher Code. ADV8-Codes bestehen aus 7 Ziffern.",
        Status: 2,
        Spalte: "16",
        Zeile: 25,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Falscher Code. ADV8-Codes bestehen aus 7 Ziffern.",
        Status: 2,
        Spalte: "16",
        Zeile: 27,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 27,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 28,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 28,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 30,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 2 enthalten",
        Status: 2,
        Spalte: "10",
        Zeile: 31,
        Original: null,
        FehlerNr: 30
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 32,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 3 enthalten",
        Status: 2,
        Spalte: "11",
        Zeile: 34,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Bitte geben Sie den ADV-Code für die Matrix an! (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "11",
        Zeile: 35,
        Original: null,
        FehlerNr: 34
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 35,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Bitte geben Sie eine Matrix an!",
        Status: 2,
        Spalte: "11;12",
        Zeile: 38,
        Original: null,
        FehlerNr: 37
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 39,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 40,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 40,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 12 enthalten",
        Status: 2,
        Spalte: "13",
        Zeile: 41,
        Original: null,
        FehlerNr: 40
    },
    {
        Kommentar: "Erreger nicht erkannt. Der Eintrag entspricht keinem Text oder Code in ADV-Katalog Nr. 16.",
        Status: 2,
        Spalte: "3",
        Zeile: 41,
        Original: null,
        FehlerNr: 8
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 41,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 42,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 42,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 4 enthalten",
        Status: 2,
        Spalte: "14",
        Zeile: 43,
        Original: null,
        FehlerNr: 42
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 43,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 43,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 44,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 44,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 45,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 46,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 8 enthalten",
        Status: 2,
        Spalte: "16",
        Zeile: 47,
        Original: null,
        FehlerNr: 46
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 47,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 47,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 48,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 48,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Keine Betriebsart angegeben (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "16;17",
        Zeile: 49,
        Original: null,
        FehlerNr: 48
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 49,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 9 enthalten oder es ist kein Code.",
        Status: 2,
        Spalte: "7",
        Zeile: 49,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 49,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 50,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 9 enthalten oder es ist kein Code.",
        Status: 2,
        Spalte: "7",
        Zeile: 50,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 50,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 51,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine gültige Postleitzahl.",
        Status: 2,
        Spalte: "8",
        Zeile: 51,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 52,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine Postleitzahl. Postleitzahlen bestehen aus 5 Ziffern.",
        Status: 2,
        Spalte: "8",
        Zeile: 52,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 53,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Probenahme erfolgte nach der Isolierung?",
        Status: 2,
        Spalte: "5;6",
        Zeile: 54,
        Original: null,
        FehlerNr: 20
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 54,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 55,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Falscher Code. ADV9-Codes sind maximal 8 Ziffern lang.",
        Status: 2,
        Spalte: "7",
        Zeile: 55,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Keine Postleitzahl. Postleitzahlen bestehen aus 5 Ziffern.",
        Status: 2,
        Spalte: "8",
        Zeile: 56,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 57,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Probenummer kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "1",
        Zeile: 58,
        Original: null,
        FehlerNr: 3
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 58,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Keine Postleitzahl. Postleitzahlen bestehen aus 5 Ziffern.",
        Status: 2,
        Spalte: "8",
        Zeile: 59,
        Original: null,
        FehlerNr: 27
    },
    {
        Kommentar: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)",
        Status: 2,
        Spalte: "2",
        Zeile: 60,
        Original: null,
        FehlerNr: 6
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 9 enthalten oder es ist kein Code.",
        Status: 2,
        Spalte: "7",
        Zeile: 61,
        Original: null,
        FehlerNr: 24
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 62,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Keine Probenummer angegeben",
        Status: 2,
        Spalte: "1;2",
        Zeile: 62,
        Original: null,
        FehlerNr: 69
    },
    {
        Kommentar: "Matrix-Code ist nicht eindeutig. Bitte Spalte 'Oberbegriff (Kodiersystem) der Matrizes' ausfüllen! Entweder '01' für 'Schellfisch (Melanogrammus aeglefinus) Seefisch' oder '15' für 'Masthähnchen/Masthühner; Haut mit Fett'.",
        Status: 2,
        Spalte: "10;11",
        Zeile: 63,
        Original: null,
        FehlerNr: 70
    },
    {
        Kommentar: "Keine Betriebsart angegeben (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "16;17",
        Zeile: 64,
        Original: null,
        FehlerNr: 48
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 64,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 64,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Keine Betriebsart angegeben (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "16;17",
        Zeile: 65,
        Original: null,
        FehlerNr: 48
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 65,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 65,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Keine Betriebsart angegeben (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "16;17",
        Zeile: 66,
        Original: null,
        FehlerNr: 48
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 66,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 66,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 67,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 67,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 67,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 68,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 68,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 68,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 69,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 69,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 70,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 70,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 70,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Code ist nicht im ADV-Katalog Nr. 3 enthalten",
        Status: 2,
        Spalte: "11",
        Zeile: 71,
        Original: null,
        FehlerNr: 33
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für den Verarbeitungszustand an! (Pflicht bei Betriebsart = Einzelhandel)",
        Status: 2,
        Spalte: "13",
        Zeile: 71,
        Original: null,
        FehlerNr: 39
    },
    {
        Kommentar: "Probenummer nach AVVData fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "2",
        Zeile: 71,
        Original: null,
        FehlerNr: 5
    },
    {
        Kommentar: "Ortsangabe fehlt (Pflicht bei ZoMo)",
        Status: 2,
        Spalte: "7;8;9",
        Zeile: 71,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 4,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 6,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Datum fehlt",
        Status: 1,
        Spalte: "5",
        Zeile: 12,
        Original: null,
        FehlerNr: 11
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 15,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Datum fehlt",
        Status: 1,
        Spalte: "5",
        Zeile: 15,
        Original: null,
        FehlerNr: 11
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 16,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Datum fehlt",
        Status: 1,
        Spalte: "6",
        Zeile: 16,
        Original: null,
        FehlerNr: 15
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 17,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 18,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "War die Isolierung wirklich über 1 Jahr nach der Probennahme?",
        Status: 1,
        Spalte: "5;6",
        Zeile: 18,
        Original: null,
        FehlerNr: 61
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 19,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 20,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 21,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 22,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Ortsangabe fehlt",
        Status: 1,
        Spalte: "7;8;9",
        Zeile: 22,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Ortsangabe fehlt",
        Status: 1,
        Spalte: "7;8;9",
        Zeile: 23,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 24,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 25,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 26,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Ortsname ohne PLZ angegeben",
        Status: 1,
        Spalte: "8;9",
        Zeile: 26,
        Original: null,
        FehlerNr: 25
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 27,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Ortsname ohne PLZ angegeben",
        Status: 1,
        Spalte: "8;9",
        Zeile: 27,
        Original: null,
        FehlerNr: 25
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 28,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 29,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "PLZ ohne Ortsname angegeben",
        Status: 1,
        Spalte: "8;9",
        Zeile: 29,
        Original: null,
        FehlerNr: 28
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 30,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 31,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 32,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für die Matrix an!",
        Status: 1,
        Spalte: "11",
        Zeile: 33,
        Original: null,
        FehlerNr: 32
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 33,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 34,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen ADV-Code für die Matrix an!",
        Status: 1,
        Spalte: "11",
        Zeile: 35,
        Original: null,
        FehlerNr: 32
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 35,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 36,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 37,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 38,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 39,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 40,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 41,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 44,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 45,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 46,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 47,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 48,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 49,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 50,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 51,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 52,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "War die Isolierung wirklich über 1 Jahr nach der Probennahme?",
        Status: 1,
        Spalte: "5;6",
        Zeile: 52,
        Original: null,
        FehlerNr: 61
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 53,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Datum liegt über 10 Jahre zurück",
        Status: 1,
        Spalte: "5",
        Zeile: 53,
        Original: null,
        FehlerNr: 62
    },
    {
        Kommentar: "War die Isolierung wirklich über 1 Jahr nach der Probennahme?",
        Status: 1,
        Spalte: "5;6",
        Zeile: 53,
        Original: null,
        FehlerNr: 61
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 54,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Datum liegt über 10 Jahre zurück",
        Status: 1,
        Spalte: "6",
        Zeile: 54,
        Original: null,
        FehlerNr: 63
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 55,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 56,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "PLZ ohne Ortsname angegeben",
        Status: 1,
        Spalte: "8;9",
        Zeile: 56,
        Original: null,
        FehlerNr: 28
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 57,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 58,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 59,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 60,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Wenn vorhanden, geben Sie bitte auch Ihre Probenummer ein.",
        Status: 1,
        Spalte: "1",
        Zeile: 61,
        Original: null,
        FehlerNr: 68
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 61,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "PLZ ohne Ortsname angegeben",
        Status: 1,
        Spalte: "8;9",
        Zeile: 61,
        Original: null,
        FehlerNr: 28
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 62,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Ortsangabe fehlt",
        Status: 1,
        Spalte: "7;8;9",
        Zeile: 62,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Bitte geben Sie einen Probenahme-Grund an!",
        Status: 1,
        Spalte: "14;15",
        Zeile: 63,
        Original: null,
        FehlerNr: 44
    },
    {
        Kommentar: "Ortsangabe fehlt",
        Status: 1,
        Spalte: "7;8;9",
        Zeile: 63,
        Original: null,
        FehlerNr: 64
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 64,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 65,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 66,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 69,
        Original: null,
        FehlerNr: 49
    },
    {
        Kommentar: "Kombination aus ADV2-Code, ADV3-Code, ADV8-Code und Jahr passt zu keinem Zoonose-Monitoring-Programm",
        Status: 1,
        Spalte: "11;14;15;16",
        Zeile: 71,
        Original: null,
        FehlerNr: 49
    }
]

function getExpCode(i: any) {
    const errorSet = new Set();
    _.filter(expecetedErrors, m => m.Zeile === i).forEach(i => {
        if (i.FehlerNr) {
            errorSet.add(i.FehlerNr)
        }
    })
    return errorSet;
}
