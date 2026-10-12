import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'FaqWebPartStrings';
import Faq from './components/Faq';
import { IFaqProps } from './components/IFaqProps';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import { FAQService } from '../services/FAQService';
import { IFAQ } from '../models/IFAQ';
import "@pnp/sp/fields";

export interface IFaqWebPartProps {
  description: string;
}

export default class FaqWebPart extends BaseClientSideWebPart<IFaqWebPartProps> {

   
  private _sp!: SPFI;
  private _faqService!: FAQService;
  private _faqs: IFAQ[] = [];

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _isAdmin: boolean = false;


  public render(): void {
    const element: React.ReactElement<IFaqProps> = React.createElement(
      Faq,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        userDisplayName: this.context.pageContext.user.displayName,
        faqs: this._faqs,
         isAdmin: this._isAdmin,
         faqService: this._faqService,

        onFaqAdded: async () => {
        this._faqs = await this._faqService.getFAQs();
        this.render();
        }
      }
    );
     

    ReactDom.render(element, this.domElement);
  }

protected async onInit(): Promise<void> {
  this._sp = spfi().using(SPFx(this.context));

  this._faqService = new FAQService(this._sp);

  this._isAdmin = true;


  this._faqs = await this._faqService.getFAQs();
  console.log("FAQs from SharePoint:", this._faqs);

  const message = await this._getEnvironmentMessage();
  this._environmentMessage = message;



  this._faqService = new FAQService(this._sp);
  await this._faqService.checkFAQFields();

  this.render();
}



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
