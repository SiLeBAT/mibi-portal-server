export const APPLICATION_TYPES = {
    ApplicationConfiguration: Symbol.for('ApplicationConfiguration'),

    ConfigurationService: Symbol.for('ConfigurationService'),
    NotificationService: Symbol.for('NotificationService'),
    ExcelUnmarshalService: Symbol.for('ExcelUnmarshalService'),
    InstituteService: Symbol.for('InstituteService'),
    UserService: Symbol.for('UserService'),
    JSONMarshalService: Symbol.for('JSONMarshalService'),

    SampleSheetConstants: Symbol.for('SampleSheetConstants'),
    SampleSheetService: Symbol.for('SampleSheetService'),
    PDFService: Symbol.for('PDFService'),
    PDFConstants: Symbol.for('PDFConstants'),
    PDFCreatorService: Symbol.for('PDFCreatorService'),
    PDFConfigProviderService: Symbol.for('PDFConfigProviderService'),

    TokenService: Symbol.for('TokenService'),
    SampleService: Symbol.for('SampleService'),
    CatalogService: Symbol.for('CatalogService'),
    AVVFormatProvider: Symbol.for('AVVFormatProvider'),
    ValidationErrorProvider: Symbol.for('ValidationErrorProvider'),
    RegistrationService: Symbol.for('RegistrationService'),
    PasswordService: Symbol.for('PasswordService'),
    LoginService: Symbol.for('LoginService'),
    NRLService: Symbol.for('NRLService'),
    FormAutoCorrectionService: Symbol.for('FormAutoCorrectionService'),
    FormValidatorService: Symbol.for('FormValidatorService'),
    SampleFactory: Symbol.for('SampleFactory'),

    CatalogRepository: Symbol.for('CatalogRepository'),
    AVVCatalogRepository: Symbol.for('AVVCatalogRepository'),
    SearchAliasRepository: Symbol.for('SearchAliasRepository'),
    FileRepository: Symbol.for('FileRepository'),

    ParseUserRepository: Symbol.for('ParseUserRepository'),
    ParseInstituteRepository: Symbol.for('ParseInstituteRepository'),
    ParseNRLRepository: Symbol.for('ParseNRLRepository'),
    ParseTokenRepository: Symbol.for('ParseTokenRepository'),
    ParseStateRepository: Symbol.for('ParseStateRepository'),
    ParseValidationErrorRepository: Symbol.for('ParseValidationErrorRepository')
};
