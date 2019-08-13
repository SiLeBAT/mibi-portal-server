const SERVER_TYPES = {
    AppServerConfiguration: Symbol.for('AppServerConfiguration'),
    InfoController: Symbol.for('InfoController'),
    InstitutesController: Symbol.for('InstitutesController'),
    UsersController: Symbol.for('UsersController'),
    SamplesController: Symbol.for('SamplesController'),
    TokensController: Symbol.for('TokensController'),
    VersionRootController: Symbol.for('VersionRootController'),
    APIDocsController: Symbol.for('APIDocsController'),
    MulterMW: Symbol.for('MulterMW'),
    SwaggerMW: Symbol.for('SwaggerMW')
};

export default SERVER_TYPES;
