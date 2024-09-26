import EnvironmentEnum from 'src/enums/environment';

const Config = {
  Env: process.env.REACT_APP_NODE_ENV,
  Common: {
    Subdomain: 'admin',
    ApiBaseUrl: 'http://localhost:8080',
    ApiKey: 'testerino',
    AppName: 'Viviboom',
    FrontEndUrl: 'http://localhost:3028',
    AdminFrontEndUrl: 'http://localhost:3029',
    MobileAppUrl: 'https://mobile.viviboom.co',
    SupportEmailName: 'mail',
    SupportEmailDomain: 'mail.com',
    CometChatAppId: 'CometChatAppId',
    CometChatRegion: 'eu',
    CometChatApiKey: 'CometChatApiKey',
    BuilderAppId: 'BuilderAppId',
  },
};

if (process.env.REACT_APP_NODE_ENV === EnvironmentEnum.Release) {
  Config.Common.ApiBaseUrl = 'https://release-api.viviboom.co';
  Config.Common.FrontEndUrl = 'https://www.release.viviboom.co';
  Config.Common.AdminFrontEndUrl = 'https://www.release-admin.viviboom.co';
  Config.Common.CometChatAppId = 'CometChatAppId';
  Config.Common.BuilderAppId = 'BuilderAppId';
}

if (process.env.REACT_APP_NODE_ENV === EnvironmentEnum.Production) {
  Config.Common.ApiBaseUrl = 'https://api.viviboom.co';
  Config.Common.FrontEndUrl = 'https://viviboom.co';
  Config.Common.AdminFrontEndUrl = 'https://www.admin.viviboom.co';
  Config.Common.CometChatAppId = 'CometChatAppId';
  Config.Common.CometChatApiKey = 'cometChatApiKey';
  Config.Common.BuilderAppId = 'builderAppId';
}

Config.Common.CloudFrontFull = `${Config.Common.CloudFrontUrl}/${Config.Common.CloudFrontIndentifier}`;

export default Config;
