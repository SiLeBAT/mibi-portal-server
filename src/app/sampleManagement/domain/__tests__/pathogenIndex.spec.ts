import { createPathogenIndex, IPathogenIndex } from './../pathogenIndex.entity';

describe('Pathogen Index', () => {
    // tslint:disable-next-line
    let testSample: any;
    let data: Record<string, string | number>[];
    beforeEach(() => {
        data = [{
            ADV16_Int: 801001,
            DatumGueltigkeit: '19990330',
            Katalog: '016',
            Kode: '0801001',
            Kodiersystem: '000',
            'P-Code1': '',
            'P-Code2': '',
            'P-Code3': 'Escherichia coli',
            Text1: 'Escherichia coli',
            Text2: '',
            Text3: '',
            Text4: '',
            Text5: '',
            Text6: ''
        },
        {
            ADV16_Int: 801004,
            DatumGueltigkeit: '20110609',
            Katalog: '016',
            Kode: '0801001',
            Kodiersystem: '000',
            'P-Code1': '',
            'P-Code2': '',
            'P-Code3': '',
            Text1: 'Escherichia coli O157:H7',
            Text2: '',
            Text3: '',
            Text4: '',
            Text5: '',
            Text6: ''
        },
        {
            ADV16_Int: 803101,
            DatumGueltigkeit: '19990330',
            Katalog: '016',
            Kode: '0803101',
            Kodiersystem: '000',
            'P-Code1': 'SA070110009',
            'P-Code2': '',
            'P-Code3': 'S.Typhi',
            Text1: 'Salmonella Typhi',
            Text2: '',
            Text3: '',
            Text4: '',
            Text5: '',
            Text6: ''
        }];
    });

    it('should contain entry for pathogens', () => {
        let entry = 'Escherichia coli';
        const pathogenIndex: IPathogenIndex = createPathogenIndex(data);
        let contains: boolean = pathogenIndex.contains(entry);
        expect(contains).toBe(true);
        entry = 'S. Typhi';
        contains = pathogenIndex.contains(entry);
        expect(contains).toBe(true);
    });

    it('should not contain entry for non-pathogen', () => {
        const entry = 'Bob the Builder';
        const pathogenIndex: IPathogenIndex = createPathogenIndex(data);
        const contains: boolean = pathogenIndex.contains(entry);
        expect(contains).toBe(false);
    });

    it('should contain entry for pathogen strain', () => {
        const entry = 'Escherichia coli O157:H7';
        const pathogenIndex: IPathogenIndex = createPathogenIndex(data);
        const contains: boolean = pathogenIndex.contains(entry);
        expect(contains).toBe(true);
    });

    it('should contain entry for ADV code', () => {
        const entry = '0803101';
        const pathogenIndex: IPathogenIndex = createPathogenIndex(data);
        const contains: boolean = pathogenIndex.contains(entry);
        expect(contains).toBe(true);
    });
});
