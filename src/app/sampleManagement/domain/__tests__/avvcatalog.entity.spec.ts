import { createAVVCatalog } from '../avvcatalog.entity';
import {
    AVV324Eintraege,
    AVVCatalog,
    AVVCatalogData,
    FuzzyEintrag,
    MibiEintraege,
    MibiFacetten
} from '../../model/catalog.model';

describe('list catalog Parameter 324', () => {
    let testData: AVVCatalogData;
    let testEintraege: MibiEintraege;
    let testTextEintraege: AVV324Eintraege;
    let testFuzzyEintraege: FuzzyEintrag[];
    let avvCatalog: AVVCatalog<AVVCatalogData>;

    beforeEach(() => {
        testData = {
            version: '1.0',
            gueltigAb: '2024-01-01',
            katalogNummer: '324',
            katalogName: 'Parameter',
            facettenErlaubt: false,
            eintraege: testEintraege,
            textEintraege: testTextEintraege,
            fuzzyEintraege: testFuzzyEintraege
        };

        testEintraege = {
            '10807|186333|': {
                Text: 'Escherichia coli',
                Basiseintrag: true
            },
            '11475|2965|': {
                Text: 'Salmonella Colindale',
                Basiseintrag: true
            },
            '11488|1400|': {
                Text: 'Salmonella Dublin',
                Basiseintrag: true
            },
            '66684|57386|': {
                Text: 'Escherichia coli Carbapenemase-bildend',
                Basiseintrag: true
            }
        };

        testTextEintraege = {
            'Escherichia coli': '10807|186333|',
            'Salmonella Colindale': '11475|2965|',
            'Salmonella Dublin': '11488|1400|',
            'Escherichia coli Carbapenemase-bildend': '66684|57386|'
        };

        testFuzzyEintraege = [
            {
                Kode: '10807|186333|',
                Text: 'Escherichia coli',
                Basiseintrag: true
            },
            {
                Kode: '11475|2965|',
                Text: 'Salmonella Colindale',
                Basiseintrag: true
            },
            {
                Kode: '11488|1400|',
                Text: 'Salmonella Dublin',
                Basiseintrag: true
            },
            {
                Kode: '66684|57386|',
                Text: 'Escherichia coli Carbapenemase-bildend',
                Basiseintrag: true
            }
        ];

        avvCatalog = createAVVCatalog(testData, 'Kode');
    });

    it('should dump test data', () => {
        expect(avvCatalog.dump()).toEqual(testData);
    });

    it('should have Unique Id: Kode', () => {
        expect(avvCatalog.getUniqueId()).toEqual('Kode');
    });

    it('should contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('11488|1400|')).toBe(true);
    });

    it('should not contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('123456|6789|')).toBe(
            false
        );
    });

    it('should contain text entry with Salmonella Colindale', () => {
        expect(avvCatalog.containsTextEintrag('Salmonella Colindale')).toBe(
            true
        );
    });

    it('should not contain text entry with Bacillus fantasia', () => {
        expect(avvCatalog.containsTextEintrag('Bacillus fantasia')).toBe(false);
    });

    it('should get entry with avv code', () => {
        const eintrag = {
            Text: 'Escherichia coli Carbapenemase-bildend',
            Basiseintrag: true
        };
        const code = '66684|57386|';

        const result = avvCatalog.getEintragWithAVVKode(code);

        expect(result).toEqual(eintrag);
    });

    it('should not get entry with avv code', () => {
        const code = '12345|6789|';

        const result = avvCatalog.getEintragWithAVVKode(code);

        expect(result).toBeUndefined();
    });

    it('should transform begriffsId and id to AVV code', () => {
        const begriffsId = '11488';
        const id = '1400';
        const avvCode = '11488|1400|';

        const result = avvCatalog.assembleAVVKode(begriffsId, id);

        expect(result).toEqual(avvCode);
    });

    it('should get the text with AVV code', () => {
        const text = 'Salmonella Dublin';
        const avvCode = '11488|1400|';

        const result = avvCatalog.getTextWithAVVKode(avvCode, false);

        expect(result).toEqual(text);
    });

    it('should not get the text with AVV code', () => {
        const avvCode = '12345|6789|';

        const result = avvCatalog.getTextWithAVVKode(avvCode, false);

        expect(result).toEqual('');
    });
});

describe('monochierachical catalog Gemeindeschluessel 313', () => {
    let testData: AVVCatalogData;
    let testEintraege: MibiEintraege;
    let avvCatalog: AVVCatalog<AVVCatalogData>;

    beforeEach(() => {
        testData = {
            version: '1.0',
            gueltigAb: '2024-01-01',
            katalogNummer: '313',
            katalogName: 'Amtliche Gemeindeschlüssel',
            facettenErlaubt: false,
            eintraege: testEintraege
        };

        testEintraege = {
            '37389|171950|': {
                Text: 'Hagen',
                Basiseintrag: true,
                PLZ: '',
                Name: '01060031'
            },
            '37387|171939|': {
                Text: 'Groß Niendorf',
                Basiseintrag: true,
                PLZ: '',
                Name: '01060029'
            },
            '37385|171933|': {
                Text: 'Großenaspe',
                Basiseintrag: true,
                PLZ: '',
                Name: '01060027'
            },
            '37386|171929|': {
                Text: 'Groß Kummerfeld',
                Basiseintrag: true,
                PLZ: '',
                Name: '01060028'
            }
        };

        avvCatalog = createAVVCatalog(testData, 'Kode');
    });

    it('should dump test data', () => {
        expect(avvCatalog.dump()).toEqual(testData);
    });

    it('should have Unique Id: Kode', () => {
        expect(avvCatalog.getUniqueId()).toEqual('Kode');
    });

    it('should contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('37389|171950|')).toBe(
            true
        );
    });

    it('should not contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('123456|6789|')).toBe(
            false
        );
    });

    it('should not contain text entry with Berlin', () => {
        expect(avvCatalog.containsTextEintrag('Berlin')).toBe(false);
    });

    it('should get entry with avv code', () => {
        const eintrag = {
            Text: 'Groß Niendorf',
            Basiseintrag: true,
            PLZ: '',
            Name: '01060029'
        };
        const code = '37387|171939|';

        const result = avvCatalog.getAVV313EintragWithAVVKode(code);

        expect(result).toEqual(eintrag);
    });

    it('should not get entry with avv code', () => {
        const code = '12345|6789|';

        const result = avvCatalog.getAVV313EintragWithAVVKode(code);

        expect(result).toBeUndefined();
    });

    it('should get the text with AVV code', () => {
        const text = 'Groß Kummerfeld';
        const avvCode = '37386|171929|';

        const result = avvCatalog.getTextWithAVVKode(avvCode, false);

        expect(result).toEqual(text);
    });

    it('should not get the text with AVV code', () => {
        const avvCode = '12345|6789|';

        const result = avvCatalog.getTextWithAVVKode(avvCode, false);

        expect(result).toEqual('');
    });
});

describe('facetten catalog matrizes 319', () => {
    let testData: AVVCatalogData;
    let testEintraege: MibiEintraege;
    let testFacetten: MibiFacetten;
    let avvCatalog: AVVCatalog<AVVCatalogData>;

    beforeEach(() => {
        testData = {
            version: '1.0',
            gueltigAb: '2024-01-01',
            katalogNummer: '319',
            katalogName: 'Matrizes',
            facettenErlaubt: true,
            eintraege: testEintraege,
            facetten: testFacetten
        };

        testEintraege = {
            '187036|183974|': {
                Text: 'Kot (Hygieneproben (LFGB-Bereich))',
                Basiseintrag: true,
                FacettenIds: [942, 945]
            },
            '182166|184019|': {
                Text: 'Bratwurst gebrüht',
                Basiseintrag: true,
                FacettenIds: [930, 938, 945, 935, 936, 939, 946, 949]
            }
        };

        testFacetten = {
            '8871': {
                FacettenId: 942,
                MehrfachAuswahl: true,
                Text: 'Kontakt',
                FacettenWerte: {
                    '8874': {
                        Text: 'LM-Kontakt'
                    },
                    '183629': {
                        Text: 'direkter LM-Kontakt'
                    }
                }
            },
            '183670': {
                FacettenId: 945,
                MehrfachAuswahl: true,
                Text: 'Pflanze/Tier/Stoff/relevante Zutat',
                FacettenWerte: {
                    '1086': {
                        Text: 'Schwein'
                    },
                    '1101': {
                        Text: 'Wildschwein'
                    },
                    '1104': {
                        Text: 'Ziege'
                    }
                }
            },
            '6843': {
                FacettenId: 930,
                MehrfachAuswahl: true,
                Text: 'Be- und Verarbeitung',
                FacettenWerte: {
                    '6844': {
                        Text: 'Abgefüllt'
                    },
                    '6846': {
                        Text: 'Aufbereitet'
                    },
                    '6847': {
                        Text: 'Aufgeschlossen'
                    },
                    '6853': {
                        Text: 'Ausgenommen'
                    },
                    '6855': {
                        Text: 'Blanchiert'
                    }
                }
            }
        };

        avvCatalog = createAVVCatalog(testData, 'Kode');
    });

    it('should dump test data', () => {
        expect(avvCatalog.dump()).toEqual(testData);
    });

    it('should have Unique Id: Kode', () => {
        expect(avvCatalog.getUniqueId()).toEqual('Kode');
    });

    it('should contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('187036|183974|')).toBe(
            true
        );
    });

    it('should not contain entry with avv code', () => {
        expect(avvCatalog.containsEintragWithAVVKode('123456|6789|')).toBe(
            false
        );
    });

    it('should not contain text entry with Eier', () => {
        expect(avvCatalog.containsTextEintrag('Eier')).toBe(false);
    });

    it('should get entry with avv code', () => {
        const eintrag = {
            Text: 'Kot (Hygieneproben (LFGB-Bereich))',
            Basiseintrag: true,
            FacettenIds: [942, 945]
        };
        const code = '187036|183974|';

        const result = avvCatalog.getEintragWithAVVKode(code);

        expect(result).toEqual(eintrag);
    });

    it('should not get entry with avv code', () => {
        const code = '12345|6789|';

        const result = avvCatalog.getEintragWithAVVKode(code);

        expect(result).toBeUndefined();
    });

    it('should contain facette with begriffsId', () => {
        const begriffsId = '183670';

        const result = avvCatalog.containsFacetteWithBegriffsId(begriffsId);

        expect(result).toBe(true);
    });

    it('should not contain facette with begriffsId', () => {
        const begriffsId = '12345';

        const result = avvCatalog.containsFacetteWithBegriffsId(begriffsId);

        expect(result).toBe(false);
    });

    it('should get facetten ids with avv code', () => {
        const code = '187036|183974|';
        const expected = [942, 945];

        const result = avvCatalog.getFacettenIdsWithKode(code);

        expect(result).toEqual(expected);
    });

    it('should not get facetten ids with avv code', () => {
        const code = '12345|6789|';

        const result = avvCatalog.getFacettenIdsWithKode(code);

        expect(result).toBeUndefined();
    });

    it('should get facette with begriffsId', () => {
        const begriffsId = '8871';
        const expected = {
            FacettenId: 942,
            MehrfachAuswahl: true,
            Text: 'Kontakt',
            FacettenWerte: {
                '8874': {
                    Text: 'LM-Kontakt'
                },
                '183629': {
                    Text: 'direkter LM-Kontakt'
                }
            }
        };

        const result = avvCatalog.getFacetteWithBegriffsId(begriffsId);

        expect(result).toEqual(expected);
    });

    it('should not get facette with begriffsId', () => {
        const begriffsId = '12345';

        const result = avvCatalog.getFacetteWithBegriffsId(begriffsId);

        expect(result).toBeUndefined();
    });

    it('should get facettenWert with begriffsId', () => {
        const facettenWertId = '8874';
        const facettenBegriffsId = '8871';

        const expected = {
            Text: 'LM-Kontakt'
        };

        const result = avvCatalog.getFacettenWertWithBegriffsId(
            facettenWertId,
            facettenBegriffsId
        );

        expect(result).toEqual(expected);
    });

    it('should not get facettenWert with begriffsId', () => {
        const facettenWertId = '1234';
        const facettenBegriffsId = '8871';

        const result = avvCatalog.getFacettenWertWithBegriffsId(
            facettenWertId,
            facettenBegriffsId
        );

        expect(result).toBeUndefined();
    });

    it('should get text with avv code', () => {
        const code = '187036|183974|8871-8874,183670-1086';
        const expected =
            'Kot (Hygieneproben (LFGB-Bereich)); Kontakt - LM-Kontakt; Pflanze/Tier/Stoff/relevante Zutat - Schwein';

        const result = avvCatalog.getTextWithAVVKode(code, true);

        expect(result).toEqual(expected);
    });

    it('should not get text with avv code', () => {
        const code = '1234|56789|';
        const expected = '';

        const result = avvCatalog.getTextWithAVVKode(code, true);

        expect(result).toEqual(expected);
    });

    it('should get text with avv facetten code', () => {
        const code = '187036|183974|8871-8874,183670-1086';
        const expected =
            'Kot (Hygieneproben (LFGB-Bereich)); Kontakt - LM-Kontakt; Pflanze/Tier/Stoff/relevante Zutat - Schwein';

        const result = avvCatalog.getTextWithFacettenCode(code);

        expect(result).toEqual(expected);
    });

    it('should not get text with wrong avv facetten code', () => {
        const code = '1234|5678|8871-8874,183670-1086';
        const expected = '';

        const result = avvCatalog.getTextWithFacettenCode(code);

        expect(result).toEqual(expected);
    });

    describe('regular expression for basic code and facetten code', () => {
        describe('should validate without errors', () => {
            it.each([
                ['1234|56789|', true],
                ['1|5|', true]
            ])(
                'because %s is a correct basic code format',
                (inputKode, expectedResult) => {
                    const result = avvCatalog.isBasicCode(inputKode);

                    expect(result).toEqual(expectedResult);
                }
            );

            it.each([
                ['1234|56789|', true],
                ['1|5|', true],
                ['2464|186528|1212-905', true],
                ['2464|186528|1212-905,1334-1356,63421-1512', true],
                [
                    '182272|184169|6843-6909:183390:183393,183670-2296,185085-6986:3',
                    true
                ]
            ])(
                'because %s is a correct facetten code format',
                (inputKode, expectedResult) => {
                    const result = avvCatalog.hasFacettenInfo(inputKode);

                    expect(result).toEqual(expectedResult);
                }
            );
        });

        describe('should not validate', () => {
            it.each([
                ['1234|56789', false],
                ['1234|56789||', false],
                ['1234|56789|%', false],
                ['1234|56789Y', false]
            ])(
                'because %s is not a correct basic code format',
                (inputKode, expectedResult) => {
                    const result = avvCatalog.isBasicCode(inputKode);

                    expect(result).toEqual(expectedResult);
                }
            );

            it.each([
                ['1234|56789', false],
                ['1234|56789||', false],
                ['1234|56789|%', false],
                ['1234|56789Y', false],
                ['185770|183467|183670', false],
                ['2464|186528|1212-905,1334-1356,63421-1512|', false],
                ['2464|186528|1212-905,1334-1356,63421-1512Ä', false],
                [
                    '182272|184169|6843-6909:183390:183393,183670-2296,185085:3',
                    false
                ],
                ['182272|184169|6843-6909:183390:183393,183670-', false]
            ])(
                'because %s is not a correct facetten code format',
                (inputKode, expectedResult) => {
                    const result = avvCatalog.hasFacettenInfo(inputKode);

                    expect(result).toEqual(expectedResult);
                }
            );
        });
    });
});
