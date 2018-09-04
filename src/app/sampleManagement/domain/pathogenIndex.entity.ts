import * as _ from 'lodash';

export interface IPathogenIndex {
    contains(entry: string): boolean;
}

interface IPathogenSet {
    key: string;
    contains(entry: string): boolean;
    isResponsibleFor(pathogen: string): boolean;
    add(s: string): void;
}

class ADV16PathogenSet implements IPathogenSet {

    private pathogenTypes: string[] = [];
    constructor(public key: string, private synonyms: string[] = []) { }

    contains(entry: string): boolean {
        const modifiedEntry = this.modifyEntry(entry);
        return !!_.find(this.pathogenTypes, e => this.isLowerCaseTextContained(modifiedEntry, e));
    }

    isResponsibleFor(pathogen: string) {
        const responsibility = [this.key, ...this.synonyms];
        for (let i = 0; i < responsibility.length; i++) {
            if (this.isLowerCaseTextContained(pathogen, responsibility[i])) {
                return true;
            }
        }
        return false;
    }

    add(s: string) {
        this.pathogenTypes.push(s.toLowerCase());
    }

    private modifyEntry(entry: string): string {
        const newEntry = this.removeSpace(entry);
        return this.expandSynonym(newEntry);
    }

    private removeSpace(entry: string): string {
        return entry.replace(/\s/g, '');
    }

    private expandSynonym(entry: string): string {
        let newEntry = entry.toLowerCase();
        this.synonyms.forEach(s => {
            if (this.isLowerCaseTextContained(newEntry, s)) {
                newEntry = newEntry.replace(s, this.key);
            }
        });
        return newEntry;
    }

    private isLowerCaseTextContained(container: string, test: string) {
        return container.toLowerCase().indexOf(test) > -1;
    }
}

class ADV16PathogenIndex implements IPathogenIndex {
    private pathogenSets: IPathogenSet[] = [
        new ADV16PathogenSet('escherichia', ['e.']),
        new ADV16PathogenSet('salmonella', ['s.']),
        new ADV16PathogenSet('campylobacter', ['c.'])
    ];
    private defaultPathogenSet = new ADV16PathogenSet('');
    private codeList: string[] = [];

    private ADVCodeRegEx: RegExp = /\d{7}/;

    constructor(data: Record<string, string | number>[]) {
        data.forEach(
            e => {
                this.codeList.push(e.Kode as string);
                let added = false;
                for (let i = 0; i < this.pathogenSets.length; i++) {
                    if (this.isLowerCaseTextContained(e.Text1 as string, this.pathogenSets[i].key)) {
                        this.pathogenSets[i].add((e.Text1 as string).replace(/\s/g, ''));
                        added = true;
                        break;
                    }
                }
                if (!added) {
                    this.defaultPathogenSet.add((e.Text1 as string).replace(/\s/g, ''));
                }
            }
        );
    }

    contains(entry: string) {
        return this.isADVCode(entry) ? true : this.isKnownPathogen(entry);
    }

    private isKnownPathogen(entry: string) {
        const set = this.determineSet(entry);
        return set.contains(entry);
    }

    private isADVCode(entry: string) {
        if (this.ADVCodeRegEx.test(entry)) {
            return _.findIndex(this.codeList, e => e === entry) > -1;
        }
        return false;
    }

    private determineSet(entry: string): IPathogenSet {
        for (let i = 0; i < this.pathogenSets.length; i++) {
            if (this.pathogenSets[i].isResponsibleFor(entry)) {
                return this.pathogenSets[i];
            }
        }
        return this.defaultPathogenSet;
    }

    private isLowerCaseTextContained(container: string, test: string) {
        return container.toLowerCase().indexOf(test) > -1;
    }
}

function createPathogenIndex(data: Record<string, string | number>[]): IPathogenIndex {
    return new ADV16PathogenIndex(data);
}
export {
    createPathogenIndex
};
