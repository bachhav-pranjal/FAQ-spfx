
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

  import '@pnp/sp/site-users/web';

  export interface IFaqWebPartProps {
    description: string;
  }

  export default class FaqWebPart
    extends BaseClientSideWebPart<IFaqWebPartProps> {

    private _sp!: SPFI;
    private _faqService!: FAQService;
    private _faqs: IFAQ[] = [];
    private _categories: string[] = [];

    private _isDarkTheme: boolean = false;
    private _environmentMessage: string = '';
    private _isAdmin: boolean = false;

    protected async onInit(): Promise<void> {
      await super.onInit();

      // Initialize PnP JS
      this._sp = spfi().using(SPFx(this.context));

      // Initialize FAQ service
      this._faqService = new FAQService(this._sp);

      // Check whether the current user belongs to the admin group
      this._isAdmin = await this._checkAdminAccess();

      console.log('Is FAQ Admin:', this._isAdmin);

      // Load FAQs from SharePoint
      this._faqs = await this._faqService.getFAQs();
      this._categories = await this._faqService.getCategoriesWithFaqs();

      // Get the current environment message
      this._environmentMessage = await this._getEnvironmentMessage();

      // Render the web part
      this.render();
    }

    private async _checkAdminAccess(): Promise<boolean> {
      try {
        const groups = await this._sp.web.currentUser.groups();

        const isAdmin = groups.some(
          group => group.Title === 'FAQ Portal Admins'
        );

        return isAdmin;
      } catch (error) {
        console.error('Error checking FAQ admin access:', error);

        // If the membership check fails, do not grant admin UI access
        return false;
      }
    }

    public render(): void {
      const element: React.ReactElement<IFaqProps> =
        React.createElement(Faq, {
          description: this.properties.description,
          isDarkTheme: this._isDarkTheme,
          environmentMessage: this._environmentMessage,
          userDisplayName: this.context.pageContext.user.displayName,
          faqs: this._faqs,
          isAdmin: this._isAdmin,
          categories: this._categories,
          faqService: this._faqService,

          onFaqAdded: async () => {
            
          this._faqs = await this._faqService.getFAQs();  // Load FAQs from SharePoint


          this._categories = await this._faqService.getCategoriesWithFaqs(); // Load categories that have FAQ items
            this.render();
          }
        });

      ReactDom.render(element, this.domElement);
    }

    private _getEnvironmentMessage(): Promise<string> {
      if (!!this.context.sdks.microsoftTeams) {
        // Running in Teams, Office.com or Outlook
        return this.context.sdks.microsoftTeams.teamsJs.app
          .getContext()
          .then(context => {
            let environmentMessage: string = '';

            switch (context.app.host.name) {
              case 'Office':
                environmentMessage = this.context.isServedFromLocalhost
                  ? strings.AppLocalEnvironmentOffice
                  : strings.AppOfficeEnvironment;
                break;

              case 'Outlook':
                environmentMessage = this.context.isServedFromLocalhost
                  ? strings.AppLocalEnvironmentOutlook
                  : strings.AppOutlookEnvironment;
                break;

              case 'Teams':
              case 'TeamsModern':
                environmentMessage = this.context.isServedFromLocalhost
                  ? strings.AppLocalEnvironmentTeams
                  : strings.AppTeamsTabEnvironment;
                break;

              default:
                environmentMessage = strings.UnknownEnvironment;
            }

            return environmentMessage;
          });
      }

      return Promise.resolve(
        this.context.isServedFromLocalhost
          ? strings.AppLocalEnvironmentSharePoint
          : strings.AppSharePointEnvironment
      );
    }

    protected onThemeChanged(
      currentTheme: IReadonlyTheme | undefined
    ): void {
      if (!currentTheme) {
        return;
      }

      this._isDarkTheme = !!currentTheme.isInverted;

      const { semanticColors } = currentTheme;

      if (semanticColors) {
        this.domElement.style.setProperty(
          '--bodyText',
          semanticColors.bodyText || null
        );

        this.domElement.style.setProperty(
          '--link',
          semanticColors.link || null
        );

        this.domElement.style.setProperty(
          '--linkHovered',
          semanticColors.linkHovered || null
        );
      }
    }

    protected onDispose(): void {
      ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
      return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration():
      IPropertyPaneConfiguration {
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
