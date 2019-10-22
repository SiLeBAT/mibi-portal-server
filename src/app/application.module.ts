import { ContainerModule, interfaces } from 'inversify';
import {
    ConfigurationService,
    ApplicationConfiguration
} from './core/model/configuration.model';
import { DefaultConfigurationService } from './core/application/configuration.service';
import { NotificationService } from './core/model/notification.model';
import { DefaultNotificationService } from './core/application/notification.service';
import {
    ExcelUnmarshalService,
    JSONMarshalService
} from './sampleManagement/model/excel.model';
import { DefaultExcelUnmarshalService } from './sampleManagement/application/excel-unmarshal.service';
import { UserService } from './authentication/model/user.model';
import { DefaultUserService } from './authentication/application/user.service';
import { InstituteService } from './authentication/model/institute.model';
import { DefaultInstituteService } from './authentication/application/institute.service';
import { TokenService } from './authentication/model/token.model';
import { DefaultTokenService } from './authentication/application/token.service';
import {
    SampleService,
    SampleFactory
} from './sampleManagement/model/sample.model';
import { DefaultSampleService } from './sampleManagement/application/sample.service';
import { CatalogService } from './sampleManagement/model/catalog.model';
import { DefaultCatalogService } from './sampleManagement/application/catalog.service';
import {
    AVVFormatProvider,
    ValidationErrorProvider,
    FormValidatorService
} from './sampleManagement/model/validation.model';
import { DefaultAVVFormatProvider } from './sampleManagement/application/avv-format-provider.service';
import { DefaultValidationErrorProvider } from './sampleManagement/application/validation-error-provider.service';
import { RegistrationService } from './authentication/model/registration.model';
import { DefaultRegistrationService } from './authentication/application/registration.service';
import {
    PasswordService,
    LoginService
} from './authentication/model/login.model';
import { DefaultPasswordService } from './authentication/application/password.service';
import { DefaultLoginService } from './authentication/application/login.service';
import { FormAutoCorrectionService } from './sampleManagement/model/autocorrection.model';
import { DefaultFormAutoCorrectionService } from './sampleManagement/application/form-auto-correction.service';
import { DefaultFormValidatorService } from './sampleManagement/application/form-validation.service';
import { APPLICATION_TYPES } from './application.types';
import { NRLService, NRLConstants } from './sampleManagement/model/nrl.model';
import { DefaultNRLService } from './sampleManagement/application/nrl.service';
import {
    PDFCreatorService,
    PDFConfigProviderService,
    PDFConstants
} from './sampleManagement/model/pdf.model';
import { DefaultPDFCreatorService } from './sampleManagement/application/pdf-creator.service';
import { DefaultJSONMarshalService } from './sampleManagement/application/json-marshal.service';
import { DefaultPDFConfigProviderService } from './sampleManagement/application/pdf-config-provider.service';
import { sampleSheetConfig } from './sampleManagement/domain/sample-sheet/sample-sheet.config';
import { sampleSheetPDFConfig } from './sampleManagement/domain/sample-sheet/sample-sheet-pdf.config';
import {
    sampleSheetMetaStrings,
    sampleSheetSamplesStrings
} from './sampleManagement/domain/sample-sheet/sample-sheet.strings';
import {
    sampleSheetDefaultStyle,
    sampleSheetStyles
} from './sampleManagement/domain/sample-sheet/sample-sheet.styles';
import { sampleSheetPDFStyles } from './sampleManagement/domain/sample-sheet/sample-sheet-pdf.styles';
import { nrlLongNames } from './sampleManagement/domain/nrl';
import { SampleSheetConstants } from './sampleManagement/model/sample-sheet.model';
import { DefaultPDFService } from './pdf/pdf.service';
import { DefaultSampleFactory } from './sampleManagement/domain/sample.factory';

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
                samplesStrings: sampleSheetSamplesStrings
            });

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

            bind<NRLConstants>(APPLICATION_TYPES.NRLConstants).toConstantValue({
                longNames: nrlLongNames
            });

            bind<NRLService>(APPLICATION_TYPES.NRLService).to(
                DefaultNRLService
            );

            bind<SampleFactory>(APPLICATION_TYPES.SampleFactory).to(
                DefaultSampleFactory
            );
        }
    );
}
