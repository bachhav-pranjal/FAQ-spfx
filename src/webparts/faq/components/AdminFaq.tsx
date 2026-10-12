
import * as React from 'react';

import {
  Stack,
  Text,
  SearchBox,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  Panel,
  PanelType,
  TextField,
  Toggle,
  MessageBar,
  MessageBarType
} from '@fluentui/react';

import { IFAQ } from '../../models/IFAQ';
import { FAQService } from '../../services/FAQService';

interface IAdminFaqProps {
  faqs: IFAQ[];
   faqService: FAQService;
  onFaqAdded: () => Promise<void>;
}

interface IAdminFaqState {
  searchText: string;
  selectedCategory: string;
  selectedStatus: string;
  isFormOpen: boolean;
  question: string;
  answer: string;
  formCategory: string;
  formStatus: string;
  isFeatured: boolean;
  displayOrder: number;
  successMessage: string;
  errorMessage: string;
}

export default class AdminFaq extends React.Component<
  IAdminFaqProps,
  IAdminFaqState
> {

  public state: IAdminFaqState = {
    searchText: '',
    selectedCategory: 'All',
    selectedStatus: 'All',
    isFormOpen: false,
    question: '',
    answer: '',
    formCategory: 'Other',
    formStatus: 'Draft',
    isFeatured: false,
    displayOrder: 0,
    successMessage: '',
    errorMessage: ''
  };

  private _formCategoryOptions: IDropdownOption[] = [
    { key: 'IT Support', text: 'IT Support' },
    { key: 'Microsoft Teams', text: 'Microsoft Teams' },
    { key: 'SharePoint', text: 'SharePoint' },
    { key: 'HR', text: 'HR' },
    { key: 'Microsoft 365', text: 'Microsoft 365' },
    { key: 'Power Apps', text: 'Power Apps' },
    { key: 'Power Automate', text: 'Power Automate' },
    { key: 'Other', text: 'Other' }
  ];

  private _formStatusOptions: IDropdownOption[] = [
    { key: 'Published', text: 'Published' },
    { key: 'Draft', text: 'Draft' },
    { key: 'Archived', text: 'Archived' }
  ];

  private _openAddForm = (): void => {
    this.setState({
      isFormOpen: true,
      question: '',
      answer: '',
      formCategory: 'Other',
      formStatus: 'Draft',
      isFeatured: false,
      displayOrder: 0
    });
  };

  private _closeForm = (): void => {
    this.setState({ isFormOpen: false });
  };

  private _getFilteredFaqs = (): IFAQ[] => {
    const {
      searchText,
      selectedCategory,
      selectedStatus
    } = this.state;

    return this.props.faqs.filter(faq => {
      const matchesSearch = (faq.Title || '')
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        faq.Category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' ||
        faq.Status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  public render(): React.ReactElement<IAdminFaqProps> {
    const { faqs } = this.props;

    const totalFaqs = faqs.length;

    const publishedFaqs = faqs.filter(
      faq => faq.Status === 'Published'
    ).length;

    const draftFaqs = faqs.filter(
      faq => faq.Status === 'Draft'
    ).length;

    const archivedFaqs = faqs.filter(
      faq => faq.Status === 'Archived'
    ).length;

    const categories = new Set<string>(
      faqs.map((faq: IFAQ) => faq.Category)
    );

    const filteredFaqs = this._getFilteredFaqs();

    const categoryOptions: IDropdownOption[] = [
      { key: 'All', text: 'All Categories' },
      ...Array.from(categories).map((category: string) => ({
        key: category,
        text: category
      }))
    ];

    const filterStatusOptions: IDropdownOption[] = [
      { key: 'All', text: 'All Statuses' },
      { key: 'Published', text: 'Published' },
      { key: 'Draft', text: 'Draft' },
      { key: 'Archived', text: 'Archived' }
    ];

    return (
      <Stack
        tokens={{ childrenGap: 20 }}
        styles={{
          root: {
            padding: 24,
            maxWidth: 1000,
            margin: '0 auto'
          }
        }}
      >

        {/* HEADER */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack tokens={{ childrenGap: 6 }}>
            <Text
              variant="xxLarge"
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              FAQ Administration
            </Text>

            <Text
              variant="medium"
              styles={{
                root: {
                  color: '#605e5c'
                }
              }}
            >
              Manage frequently asked questions
            </Text>
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DefaultButton
              text="Categories"
              iconProps={{ iconName: 'Tag' }}
            />

            <PrimaryButton
              text="Add FAQ"
              onClick={this._openAddForm}
              iconProps={{ iconName: 'Add' }}
            />
          </Stack>
        </Stack>

        {/* STATISTICS */}
        <Stack horizontal tokens={{ childrenGap: 16 }}>
          {[
            { label: 'Total FAQs', count: totalFaqs },
            { label: 'Published', count: publishedFaqs },
            { label: 'Draft', count: draftFaqs },
            { label: 'Archived', count: archivedFaqs }
          ].map(stat => (
            <Stack
              key={stat.label}
              tokens={{ childrenGap: 6 }}
              styles={{
                root: {
                  flex: 1,
                  padding: 20,
                  border: '1px solid #edebe9',
                  borderRadius: 8,
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Text
                variant="xxLarge"
                styles={{ root: { fontWeight: 600 } }}
              >
                {stat.count}
              </Text>

              <Text
                variant="medium"
                styles={{ root: { fontWeight: 600 } }}
              >
                {stat.label}
              </Text>
            </Stack>
          ))}
        </Stack>

        {/* SEARCH AND FILTERS */}
        <Stack
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          <SearchBox
            placeholder="Search questions..."
            value={this.state.searchText}
            onChange={(_, newValue) =>
              this.setState({ searchText: newValue || '' })
            }
            styles={{
              root: {
                flex: '1 1 0',
                minWidth: 200,
                height: 40,
                boxSizing: 'border-box'
              }
            }}
          />

          <Dropdown
            placeholder="All Categories"
            selectedKey={this.state.selectedCategory}
            options={categoryOptions}
            onChange={(_, option) => {
              if (option) {
                this.setState({
                  selectedCategory: String(option.key)
                });
              }
            }}
            styles={{
              root: {
                width: 200,
                minWidth: 200,
                flexShrink: 0
              },
              dropdown: { height: 40 },
              title: {
                height: 40,
                lineHeight: '38px'
              }
            }}
          />

          <Dropdown
            placeholder="All Statuses"
            selectedKey={this.state.selectedStatus}
            options={filterStatusOptions}
            onChange={(_, option) => {
              if (option) {
                this.setState({
                  selectedStatus: String(option.key)
                });
              }
            }}
            styles={{
              root: {
                width: 225,
                minWidth: 180,
                flexShrink: 0
              },
              dropdown: { height: 40 },
              title: {
                height: 40,
                lineHeight: '38px'
              }
            }}
          />
        </Stack>

        {this.state.successMessage && (
          <MessageBar
          messageBarType={MessageBarType.success}
          isMultiline={false}
          onDismiss={() => this.setState({ successMessage: '' })}
           dismissButtonAriaLabel="Close"
           >
          {this.state.successMessage}
        </MessageBar>
        )}
        {this.state.errorMessage && (
  <MessageBar
    messageBarType={MessageBarType.error}
    isMultiline={false}
    onDismiss={() => this.setState({ errorMessage: '' })}
  >
    {this.state.errorMessage}
  </MessageBar>
)}

        {/* FAQ LIST */}
        <Stack
          tokens={{ childrenGap: 10 }}
          styles={{ root: { width: '100%' } }}
        >
          {filteredFaqs.map(faq => (
            <Stack
              key={faq.Id}
              horizontal
              horizontalAlign="space-between"
              verticalAlign="center"
              styles={{
                root: {
                  padding: 18,
                  border: '1px solid #edebe9',
                  borderRadius: 8,
                  background: '#ffffff'
                }
              }}
            >
              <Stack tokens={{ childrenGap: 6 }}>
                <Text
                  variant="medium"
                  styles={{
                    root: {
                      fontWeight: 600,
                      color: '#323130'
                    }
                  }}
                >
                  {faq.Title}
                </Text>

                <Stack
                  horizontal
                  verticalAlign="center"
                  tokens={{ childrenGap: 10 }}
                >
                  <Text
                    variant="small"
                    styles={{ root: { color: '#605e5c' } }}
                  >
                    {faq.Category}
                  </Text>

                  <Stack
                    styles={{
                      root: {
                        padding: '3px 10px',
                        borderRadius: 20,
                        background:
                          faq.Status === 'Published'
                            ? '#dff6dd'
                            : faq.Status === 'Draft'
                              ? '#fff4ce'
                              : '#f3f2f1'
                      }
                    }}
                  >
                    <Text
                      variant="small"
                      styles={{
                        root: {
                          fontWeight: 600,
                          color: '#323130'
                        }
                      }}
                    >
                      {faq.Status}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>

              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <DefaultButton
                  iconProps={{ iconName: 'Edit' }}
                  text="Edit"
                />

                <DefaultButton
                  iconProps={{ iconName: 'Delete' }}
                  text="Delete"
                />
              </Stack>
            </Stack>
          ))}

          {filteredFaqs.length === 0 && (
            <Text variant="medium">
              No FAQs found matching your filters.
            </Text>
          )}
        </Stack>

        {/* ADD FAQ PANEL */}
        <Panel
          isOpen={this.state.isFormOpen}
          onDismiss={this._closeForm}
          type={PanelType.medium}
          headerText="Add New FAQ"
          closeButtonAriaLabel="Close"
        >
          <Stack
            tokens={{ childrenGap: 15 }}
            styles={{ root: { paddingTop: 20 } }}
          >
            <TextField
              label="Question"
              placeholder="Enter the FAQ question"
              required
              value={this.state.question}
              onChange={(_, value) =>
                this.setState({ question: value || '' })
              }
            />

            <TextField
              label="Answer"
              placeholder="Enter the answer"
              required
              multiline
              rows={5}
              value={this.state.answer}
              onChange={(_, value) =>
                this.setState({ answer: value || '' })
              }
            />

            <Dropdown
              label="Category"
              options={this._formCategoryOptions}
              selectedKey={this.state.formCategory}
              onChange={(_, option) => {
                if (option) {
                  this.setState({
                    formCategory: String(option.key)
                  });
                }
              }}
              required
            />

            <Dropdown
              label="Status"
              options={this._formStatusOptions}
              selectedKey={this.state.formStatus}
              onChange={(_, option) => {
                if (option) {
                  this.setState({
                    formStatus: String(option.key)
                  });
                }
              }}
              required
            />

            <Toggle
              label="Featured FAQ"
              checked={this.state.isFeatured}
              onChange={(_, checked) =>
                this.setState({ isFeatured: !!checked })
              }
            />

            <TextField
              label="Display Order"
              type="number"
              value={String(this.state.displayOrder)}
              onChange={(_, value) =>
                this.setState({
                  displayOrder: Number(value) || 0
                })
              }
            />

            <Stack horizontal tokens={{ childrenGap: 10 }}>
             
<PrimaryButton
  text="Save FAQ"
  onClick={async () => {
    const question = this.state.question.trim();
    const answer = this.state.answer.trim();
    const displayOrder = Number(this.state.displayOrder);

    if (!question || !answer) {
      this.setState({
        errorMessage: 'Please enter both the question and answer.',
        successMessage: ''
      });
      return;
    }

    if (
      this.state.displayOrder === 0 ||
      !Number.isFinite(displayOrder)
    ) {
      this.setState({
        errorMessage: 'Please enter a valid display order.',
        successMessage: ''
      });
      return;
    }

    try {
      await this.props.faqService.addFAQ({
        Title: question,
        Answer: answer,
        Category: this.state.formCategory,
        IsFeatured: this.state.isFeatured,
        DisplayOrder: displayOrder,
        IsActive: this.state.formStatus
      });

      await this.props.onFaqAdded();

      this.setState({
        isFormOpen: false,
        question: '',
        answer: '',
        errorMessage: '',
        successMessage: 'FAQ saved successfully!'
      });
    } catch (error) {
      console.error('Error saving FAQ:', error);

      this.setState({
        errorMessage: 'Could not save the FAQ. Please try again.',
        successMessage: ''
      });
    }
  }}
/>


              <DefaultButton
                text="Cancel"
                onClick={this._closeForm}
              />
            </Stack>
          </Stack>
        </Panel>

      </Stack>
    );
  }
}
