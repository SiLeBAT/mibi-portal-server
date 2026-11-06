import { Response } from 'express';
import _ from 'lodash';
import { VersionRootController } from '../model/controller.model';
import { AbstractController } from './abstract.controller';
import { AppServerConfiguration } from '../model/server.model';
import openAPI from './../doc/openapi_v2.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type APIDefinition = any;

export class DefaultVersionRootController
    extends AbstractController
    implements VersionRootController
{
    private publicAPI: APIDefinition;
    constructor(configuration: AppServerConfiguration) {
        super();
        // A copy, as the revealer deletes from the definition it is given.
        const definition = _.cloneDeep(openAPI);
        // The routes follow the configuration, so the documented base URL does too.
        definition.servers = [
            { url: `${configuration.apiRoot}/${configuration.apiVersion}` }
        ];
        this.publicAPI = this.documentationRevealer(
            definition,
            configuration.publicAPIDoc
        );
    }
    async getAPIDefinition(res: Response) {
        await this.handleRequest(res, this.getAPIDefinition.name, () => {
            this.ok(res, this.publicAPI);
        });
    }

    protected handleError(res: Response) {
        this.fail(res, 'Unable to retrieve documentation');
    }

    private search(term: string, object: APIDefinition, found: string[] = []) {
        Object.keys(object).forEach(key => {
            if (key === term) {
                found.push(object[key]);
                return found;
            }
            if (typeof object[key] === 'object' && object[key] !== null) {
                this.search(term, object[key], found);
            }
        });
        return found;
    }

    private documentationRevealer(
        definition: APIDefinition,
        filter: { [keys: string]: string[] }
    ) {
        // Delete unwanted paths
        for (const path of Object.keys(definition.paths)) {
            if (!_.includes(Object.keys(filter), path)) {
                delete definition.paths[path];
            } else {
                for (const operation of Object.keys(definition.paths[path])) {
                    if (!_.includes(filter[path], operation)) {
                        delete definition.paths[path][operation];
                    }
                }
                if (_.isEmpty(definition.paths[path])) {
                    delete definition.paths[path];
                }
            }
        }
        // Parse remaining document & note left-over tags and refs
        let remainingTags: string[] = [];
        let remainingRefs: Set<string>;
        const remainingSecuritySchemes = new Set<string>();
        for (const path of Object.keys(definition.paths)) {
            for (const operation of Object.keys(definition.paths[path])) {
                if (definition.paths[path][operation].tags) {
                    remainingTags = remainingTags.concat(
                        definition.paths[path][operation].tags
                    );
                }
                for (const requirement of definition.paths[path][operation]
                    .security ?? []) {
                    Object.keys(requirement).forEach(scheme =>
                        remainingSecuritySchemes.add(scheme)
                    );
                }
            }
        }

        // remove security schemes no longer needed. They are referenced by
        // name in `security`, never by $ref.
        for (const scheme of Object.keys(
            definition.components.securitySchemes
        )) {
            if (!remainingSecuritySchemes.has(scheme)) {
                delete definition.components.securitySchemes[scheme];
            }
        }
        remainingRefs = new Set<string>(this.search('$ref', definition));

        // remove tags no longer needed
        const tags: string[] = definition.tags.map(
            (t: { name: string }) => t.name
        );

        tags.forEach(tag => {
            if (!_.includes(remainingTags, tag)) {
                _.remove(
                    definition.tags,
                    (t: { name: string }) => t.name === tag
                );
            }
        });

        // removes refs no longer needed.
        let currentRemainingRefs = remainingRefs.size;
        let lastRemainingRefs = 0;

        const refString = '#/components';
        while (currentRemainingRefs !== lastRemainingRefs) {
            lastRemainingRefs = currentRemainingRefs;
            // remove refs. Security schemes were handled above.
            for (const component of Object.keys(definition.components)) {
                if (component === 'securitySchemes') {
                    continue;
                }
                for (const ref of Object.keys(
                    definition.components[component]
                )) {
                    const reference = [refString, component, ref].join('/');
                    if (!remainingRefs.has(reference)) {
                        delete definition.components[component][ref];
                    }
                }
            }
            // set new refs
            remainingRefs = new Set<string>(this.search('$ref', definition));
            currentRemainingRefs = remainingRefs.size;
        }
        return definition;
    }
}
