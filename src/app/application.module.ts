import { ContainerModule, interfaces } from 'inversify';
import { APPLICATION_TYPES } from './application.types';
import { DefaultInstituteService } from './authentication/application/institute.service';
import { DefaultLoginService } from './authentication/application/login.service';
import { DefaultPasswordService } from './authentication/application/password.service';
import { DefaultRegistrationService } from './authentication/application/registration.service';
import { DefaultTokenService } from './authentication/application/token.service';
import { DefaultUserService } from './authentication/application/user.service';
import { InstituteService } from './authentication/model/institute.model';
import {
    LoginService,
    PasswordService
} from './authentication/model/login.model';
import { RegistrationService } from './authentication/model/registration.model';
import { TokenService } from './authentication/model/token.model';
import { UserService } from './authentication/model/user.model';
import { DefaultConfigurationService } from './core/application/configuration.service';
import { DefaultNotificationService } from './core/application/notification.service';
import {
    ApplicationConfiguration,
    ConfigurationService
} from './core/model/configuration.model';
import { NotificationService } from './core/model/notification.model';
import { DefaultPDFService } from './pdf/pdf.service';
import { DefaultAVVFormatProvider } from './sampleManagement/application/avv-format-provider.service';
import { DefaultCatalogService } from './sampleManagement/application/catalog.service';
import { DefaultExcelUnmarshalService } from './sampleManagement/application/excel-unmarshal.service';
import { DefaultFormAutoCorrectionService } from './sampleManagement/application/form-auto-correction.service';
import { DefaultFormValidatorService } from './sampleManagement/application/form-validation.service';
import { DefaultJSONMarshalService } from './sampleManagement/application/json-marshal.service';
import { DefaultNRLService } from './sampleManagement/application/nrl.service';
import { DefaultPDFConfigProviderService } from './sampleManagement/application/pdf-config-provider.service';
import { DefaultPDFCreatorService } from './sampleManagement/application/pdf-creator.service';
import { DefaultSampleSheetService } from './sampleManagement/application/sample-sheet.service';
import { DefaultSampleService } from './sampleManagement/application/sample.service';
import { DefaultValidationErrorProvider } from './sampleManagement/application/validation-error-provider.service';
import { sampleSheetPDFConfig } from './sampleManagement/domain/sample-sheet/sample-sheet-pdf.config';
import { sampleSheetPDFStyles } from './sampleManagement/domain/sample-sheet/sample-sheet-pdf.styles';
import { sampleSheetConfig } from './sampleManagement/domain/sample-sheet/sample-sheet.config';
import {
    sampleSheetMetaStrings,
    sampleSheetNRLStrings,
    sampleSheetSamplesStrings
} from './sampleManagement/domain/sample-sheet/sample-sheet.strings';
import {
    sampleSheetDefaultStyle,
    sampleSheetStyles
} from './sampleManagement/domain/sample-sheet/sample-sheet.styles';
import { DefaultSampleFactory } from './sampleManagement/domain/sample.factory';
import { FormAutoCorrectionService } from './sampleManagement/model/autocorrection.model';
import { CatalogService } from './sampleManagement/model/catalog.model';
import {
    ExcelUnmarshalService,
    JSONMarshalService
} from './sampleManagement/model/excel.model';
import { NRLService } from './sampleManagement/model/nrl.model';
import {
    PDFConfigProviderService,
    PDFConstants,
    PDFCreatorService
} from './sampleManagement/model/pdf.model';
import { SampleSheetConstants } from './sampleManagement/model/sample-sheet.model';
import {
    SampleFactory,
    SampleService
} from './sampleManagement/model/sample.model';
import {
    AVVFormatProvider,
    FormValidatorService,
    ValidationErrorProvider
} from './sampleManagement/model/validation.model';

export function getApplicationContainerModule(
    appConfiguration: ApplicationConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(APPLICATION_TYPES.ApplicationConfiguration).toConstantValue(
                appConfiguration
            );

            bind<ConfigurationService>(
                APPLICATION_TYPES.ConfigurationService
            ).to(DefaultConfigurationService);

            bind<NotificationService>(APPLICATION_TYPES.NotificationService).to(
                DefaultNotificationService
            );

            bind<ExcelUnmarshalService>(
                APPLICATION_TYPES.ExcelUnmarshalService
            ).to(DefaultExcelUnmarshalService);

            bind<UserService>(APPLICATION_TYPES.UserService).to(
                DefaultUserService
            );

            bind<InstituteService>(APPLICATION_TYPES.InstituteService).to(
                DefaultInstituteService
            );

            bind<JSONMarshalService>(APPLICATION_TYPES.JSONMarshalService).to(
                DefaultJSONMarshalService
            );

            bind<SampleSheetConstants>(
                APPLICATION_TYPES.SampleSheetConstants
            ).toConstantValue({
                config: sampleSheetConfig,
                defaultStyle: sampleSheetDefaultStyle,
                styles: sampleSheetStyles,
                metaStrings: sampleSheetMetaStrings,
                samplesStrings: sampleSheetSamplesStrings,
                nrlStrings: sampleSheetNRLStrings
            });

            bind(APPLICATION_TYPES.SampleSheetService).to(
                DefaultSampleSheetService
            );

            bind(APPLICATION_TYPES.PDFService).to(DefaultPDFService);

            bind<PDFConstants>(APPLICATION_TYPES.PDFConstants).toConstantValue({
                config: sampleSheetPDFConfig,
                styles: sampleSheetPDFStyles
            });

            bind<PDFConfigProviderService>(
                APPLICATION_TYPES.PDFConfigProviderService
            ).to(DefaultPDFConfigProviderService);

            bind<PDFCreatorService>(APPLICATION_TYPES.PDFCreatorService).to(
                DefaultPDFCreatorService
            );

            bind<TokenService>(APPLICATION_TYPES.TokenService).to(
                DefaultTokenService
            );

            bind<SampleService>(APPLICATION_TYPES.SampleService).to(
                DefaultSampleService
            );

            bind<CatalogService>(APPLICATION_TYPES.CatalogService).to(
                DefaultCatalogService
            );

            bind<AVVFormatProvider>(APPLICATION_TYPES.AVVFormatProvider).to(
                DefaultAVVFormatProvider
            );

            bind<ValidationErrorProvider>(
                APPLICATION_TYPES.ValidationErrorProvider
            ).to(DefaultValidationErrorProvider);

            bind<RegistrationService>(APPLICATION_TYPES.RegistrationService).to(
                DefaultRegistrationService
            );

            bind<PasswordService>(APPLICATION_TYPES.PasswordService).to(
                DefaultPasswordService
            );
            bind<LoginService>(APPLICATION_TYPES.LoginService).to(
                DefaultLoginService
            );

            bind<FormAutoCorrectionService>(
                APPLICATION_TYPES.FormAutoCorrectionService
            ).to(DefaultFormAutoCorrectionService);

            bind<FormValidatorService>(
                APPLICATION_TYPES.FormValidatorService
            ).to(DefaultFormValidatorService);

            bind<NRLService>(APPLICATION_TYPES.NRLService).to(
                DefaultNRLService
            );

            bind<SampleFactory>(APPLICATION_TYPES.SampleFactory).to(
                DefaultSampleFactory
            );
        }
    );
}
