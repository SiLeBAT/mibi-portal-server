import * as _ from 'lodash';
import { createSample, createSampleCollection, ISample } from '../app/sampleManagement/domain';
import { createFormAutoCorrectionService, createCatalogService } from '../app/sampleManagement/application';
import { initialiseCatalogRepository } from '../infrastructure/persistence/repositories';
import { ISampleData } from '../app/sampleManagement/domain/sample.entity';

// tslint:disable
const testArray = [
    {
        pathogen_adv: "Escherichia coli mit eae - Gen"
    },
    {
        pathogen_adv: "Escherichia coli O157:H7"
    },
    {
        pathogen_adv: "Escherichia coli O157"
    },
    {
        pathogen_adv: "Escherichia coli O104:H4"
    },
    {
        pathogen_adv: "Escherichia coli O104"
    },
    {
        pathogen_adv: "Escherichia coli ESBL/AmpC-bildend"
    },
    {
        pathogen_adv: "Escherichia coli ESBL-bildend"
    },
    {
        pathogen_adv: "Escherichia coli AmpC-bildend"
    },
    {
        pathogen_adv: "Escherichia coli Carbapenemase-bildend"
    },
    {
        pathogen_adv: "Escherichia coli Stx I-Toxinbildner"
    },
    {
        pathogen_adv: "Escherichia coli Stx II-Toxinbildner"
    },
    {
        pathogen_adv: "Escherichia coli Verotoxinbildende"
    },
    {
        pathogen_adv: "Escherichia coli Toxinbildner"
    },
    {
        pathogen_adv: "Escherichia coli"
    },
    {
        pathogen_adv: "Genus Escherichia"
    },
    {
        pathogen_adv: "Enterococcus faecalis"
    },
    {
        pathogen_adv: "Enterococcus faecium"
    },
    {
        pathogen_adv: "Enterococcus"
    },
    {
        pathogen_adv: "Listeria monocytogenes"
    },
    {
        pathogen_adv: "Listeria denitrificans"
    },
    {
        pathogen_adv: "Listeria grayi"
    },
    {
        pathogen_adv: "Listeria innocua"
    },
    {
        pathogen_adv: "Listeria ivanovii"
    },
    {
        pathogen_adv: "Listeria murrayi"
    },
    {
        pathogen_adv: "Listeria seeligeri"
    },
    {
        pathogen_adv: "Listeria welshimeri"
    },
    {
        pathogen_adv: "Genus Listeria"
    },
    {
        pathogen_adv: "Campylobacter jejuni"
    },
    {
        pathogen_adv: "Campylobacter coli"
    },
    {
        pathogen_adv: "Campylobacter lari"
    },
    {
        pathogen_adv: "Campylobacter upsaliensis"
    },
    {
        pathogen_adv: "Campylobacter spp., thermophil"
    },
    {
        pathogen_adv: "Campylobacter spp., mesophil"
    },
    {
        pathogen_adv: "Genus Campylobacter"
    },
    {
        pathogen_adv: "Salmonella Paratyphi"
    }, {
        pathogen_adv: "Salmonella Reading"
    },
    {
        pathogen_adv: "Salmonella Eppendorf"
    },
    {
        pathogen_adv: "Salmonella Duisburg"
    },
    {
        pathogen_adv: "Salmonella Bredeney"
    },
    {
        pathogen_adv: "Salmonella Schwarzengrund"
    },
    {
        pathogen_adv: "Salmonella Agona"
    },
    {
        pathogen_adv: "Salmonella Heidelberg"
    },
    {
        pathogen_adv: "Salmonella Saintpaul"
    },
    {
        pathogen_adv: "Salmonella Indiana"
    },
    {
        pathogen_adv: "Salmonella Typhimurium"
    },
    {
        pathogen_adv: "Salmonella Typhi"
    },
    {
        pathogen_adv: "Salmonella Mons"
    },
    {
        pathogen_adv: "Salmonella Stanleyville"
    },
    {
        pathogen_adv: "Salmonella Brandenburg"
    },
    {
        pathogen_adv: "Salmonella Essen"
    },
    {
        pathogen_adv: "Salmonella Derby"
    },
    {
        pathogen_adv: "Salmonella Chester"
    },
    {
        pathogen_adv: "Genus Salmonella"
    },
    {
        pathogen_adv: "Genus Staphylococcus - koagulasepositiv"
    },
    {
        pathogen_adv: "Genus Staphylococcus - koagulasenegativ"
    },
    {
        pathogen_adv: "Staphylococcus aureus - Thermonukleasebildner"
    },
    {
        pathogen_adv: "Staphylococcus aureus - Toxinbildner"
    },
    {
        pathogen_adv: "Staphylococcus aureus, MRSA positiv"
    },
    {
        pathogen_adv: "Staphylococcus aureus, MRSA verdaechtig"
    },
    {
        pathogen_adv: "Staphylococcus aureus"
    },
    {
        pathogen_adv: "Genus Staphylococcus"
    },
    {
        pathogen_adv: "Vibrio parahaemolyticus"
    },
    {
        pathogen_adv: "Vibrio cholerae El Tor"
    },
    {
        pathogen_adv: "Vibrio cholerae"
    },
    {
        pathogen_adv: "Vibrio vulnificus"
    },
    {
        pathogen_adv: "Vibrio alginolyticus"
    },
    {
        pathogen_adv: "Vibrio mimicus"
    },
    {
        pathogen_adv: "Vibrio fluvialis"
    },
    {
        pathogen_adv: "Genus Vibrio"
    },
    {
        pathogen_adv: "Yersinia pseudotuberculosis"
    },
    {
        pathogen_adv: "Yersinia enterocolitica O:3"
    },
    {
        pathogen_adv: "Yersinia enterocolitica O:8"
    },
    {
        pathogen_adv: "Yersinia enterocolitica O:9"
    },
    {
        pathogen_adv: "Yersinia enterocolitica O:5,27"
    },
    {
        pathogen_adv: "Yersinia enterocolitica"
    },
    {
        pathogen_adv: "Genus Yersinia"
    },
    {
        pathogen_adv: "Clostridium botulinum"
    },
    {
        pathogen_adv: "Clostridium perfringens - Toxinbildner"
    },
    {
        pathogen_adv: "Clostridium perfringens"
    },
    {
        pathogen_adv: "Clostridium difficile"
    },
    {
        pathogen_adv: "Clostridium tetani"
    },
    {
        pathogen_adv: "Clostridium sporogenes"
    },
    {
        pathogen_adv: "Genus Clostridium"
    },
    {
        pathogen_adv: "Bacillus cereus praesumtiv"
    },
    {
        pathogen_adv: "Bacillus cereus"
    },
    {
        pathogen_adv: "Bacillus thuringiensis"
    },
    {
        pathogen_adv: "Bacillus sphaericus"
    },
    {
        pathogen_adv: "Bacillus alvei"
    },
    {
        pathogen_adv: "Bacillus larvae"
    },
    {
        pathogen_adv: "Bacillus anthracis"
    },
    {
        pathogen_adv: "Bacillus megaterium"
    },
    {
        pathogen_adv: "Bacillus stearothermophilus"
    },
    {
        pathogen_adv: "Bacillus subtilis"
    },
    {
        pathogen_adv: "Bacillus licheniformis"
    },
    {
        pathogen_adv: "Bacillus cytotoxicus"
    },
    {
        pathogen_adv: "Genus Bacillus"
    },
    {
        pathogen_adv: "Genus Klebsiella"
    },
    {
        pathogen_adv: "Klebsiella planticola"
    },
    {
        pathogen_adv: "Klebsiella pneumoniae"
    },
    {
        pathogen_adv: "Klebsiella oxytoca"
    }
];

function runTest() {
    const sampleArray = testArray.map(e => {
        return createSample(e as ISampleData);
    })

    const sampleCollection = createSampleCollection(sampleArray);

    initialiseCatalogRepository().then(
        repo => {
            const catalogService = createCatalogService(repo);
            const autoCorrectionService = createFormAutoCorrectionService(catalogService);
            const corrections = autoCorrectionService.applyAutoCorrection(sampleCollection);
        }
    );
}

export {
    runTest
};
