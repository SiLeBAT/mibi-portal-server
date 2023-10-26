import _ from 'lodash';
import Fuse from 'fuse.js';
import {
    AVVCatalog,
    MibiCatalogData,
    MibiCatalogFacettenData,
    MibiEintrag,
    MibiFacettenEintrag,
    MibiFacette,
    MibiFacettenWert,
    AVV324Data,
    AVV313Eintrag,
    AVVCatalogData,
    FuzzyEintrag
} from '../model/catalog.model';

class AVVDefaultCatalog<T extends AVVCatalogData> implements AVVCatalog<T> {

    constructor(private data: T, private uId: string = '') { }

    containsEintragWithAVVKode(kode: string): boolean {
        return kode in this.data.eintraege;
    }

    containsTextEintrag(value: string): boolean {
        if (this.isAVV324Data(this.dump())) {
            return value in (this.data as AVV324Data).textEintraege;
        }
        return false;
    }

    getEintragWithAVVKode(kode: string): MibiEintrag | MibiFacettenEintrag | undefined {
        return this.containsEintragWithAVVKode(kode) ? this.data.eintraege[kode] : undefined;
    }

    getAVV313EintragWithAVVKode(kode: string): AVV313Eintrag | undefined {
        const eintrag = this.getEintragWithAVVKode(kode);
        if (eintrag && this.isAVV313Eintrag(eintrag)) {
            return eintrag;
        }
        return undefined;
    }

    getAttributeWithAVVKode(kode: string): string[] | undefined {
        const eintrag = this.getEintragWithAVVKode(kode);
        if (eintrag && this.isMibiFacettenEintrag(eintrag) && 'Attribute' in eintrag) {
            return eintrag.Attribute?.split(':');
        }
        return undefined;
    }

    containsFacetteWithBegriffsId(begriffsId: string): boolean {
        if (this.isMibiCatalogFacettenData(this.data)) {
            return begriffsId in this.data.facetten;
        }
        return false;
    }

    getFacettenIdsWithKode(kode: string): number[] | undefined {
        const eintrag = this.getEintragWithAVVKode(kode);
        if (eintrag && this.isMibiFacettenEintrag(eintrag)) {
            return eintrag.FacettenIds;
        }
        return undefined;
    }

    getFacetteWithBegriffsId(begriffsId: string): MibiFacette | undefined {
        if (this.isMibiCatalogFacettenData(this.data)) {
            return this.data.facetten[begriffsId];
        }
        return undefined;
    }

    getFacettenWertWithBegriffsId(facettenWertId: string, facettenBegriffsId: string): MibiFacettenWert | undefined {
        const facette = this.getFacetteWithBegriffsId(facettenBegriffsId);
        if (facette) {
            return facette.FacettenWerte[facettenWertId];
        }
        return undefined;
    }

    assembleAVVKode(begriffsIdEintrag: string, id: string) {
        return `${begriffsIdEintrag}|${id}|`;
    }

    private isMibiCatalogFacettenData(data: MibiCatalogData | MibiCatalogFacettenData): data is MibiCatalogFacettenData {
        return 'facetten' in data;
    }

    private isMibiFacettenEintrag(eintrag: MibiEintrag | MibiFacettenEintrag): eintrag is MibiFacettenEintrag {
        return 'FacettenIds' in eintrag;
    }

    private isAVV324Data(data: AVVCatalogData): data is AVV324Data {
        return 'fuzzyEintraege' in data && 'textEintraege' in data;
    }

    private isAVV313Eintrag(eintrag: MibiEintrag | AVV313Eintrag): eintrag is AVV313Eintrag {
        return 'PLZ' in eintrag && 'Name' in eintrag;
    }

    getUniqueId(): string {
        return this.uId;
    }

    dump(): T {
        return this.data;
    }

    getFuzzyIndex(
        options: Fuse.IFuseOptions<FuzzyEintrag>,
        enhancements: FuzzyEintrag[] = []
    ): Fuse<FuzzyEintrag> {
        const data = this.dump() as AVV324Data;
        return new Fuse([...data.fuzzyEintraege, ...enhancements], options);
    }
}

function createAVVCatalog<T extends AVVCatalogData>(
    data: T,
    uId: string = ''
): AVVCatalog<T> {
    return new AVVDefaultCatalog(data, uId);
}

export { createAVVCatalog };
