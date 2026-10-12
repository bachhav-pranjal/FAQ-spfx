
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
  MessageBarType,
  Dialog,
  DialogType,
  DialogFooter
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
  editingId: number | null;
  isDeleteDialogOpen: boolean;
  faqToDelete: IFAQ | null;
  isDeleting: boolean;
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
    displayOrder: 1,
    successMessage: '',
    errorMessage: '',
    editingId: null,
    isDeleteDialogOpen: false,
    faqToDelete: null,
    isDeleting: false
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

  // Open a blank form to add an FAQ
  private _openAddForm = (): void => {
    this.setState({
      isFormOpen: true,
      editingId: null,
      question: '',
      answer: '',
      formCategory: 'Other',
      formStatus: 'Draft',
      isFeatured: false,
      displayOrder: 1,
      errorMessage: '',
      successMessage: ''
    });
  };

  // Open the form with the selected FAQ's existing values
  private _handleEdit = (faq: IFAQ): void => {
    this.setState({
      isFormOpen: true,
      editingId: faq.Id,
      question: faq.Title || '',
      answer: faq.Answer || '',
      formCategory: faq.Category || 'Other',
      formStatus: faq.Status || 'Draft',
      isFeatured: !!faq.IsFeatured,
      displayOrder: Number(faq.DisplayOrder) || 1,
      errorMessage: '',
      successMessage: ''
    });
  };

  private _closeForm = (): void => {
    this.setState({
      isFormOpen: false,
      editingId: null,
      errorMessage: ''
    });
  };

  // Open the custom delete confirmation dialog
  private _openDeleteDialog = (faq: IFAQ): void => {
    this.setState({
      isDeleteDialogOpen: true,
      faqToDelete: faq,
      errorMessage: '',
      successMessage: ''
    });
  };

  // Close the dialog without deleting
  private _closeDeleteDialog = (): void => {
    if (this.state.isDeleting) {
      return;
    }

    this.setState({
      isDeleteDialogOpen: false,
      faqToDelete: null
    });
  };

  // Delete the selected FAQ from SharePoint
  private _confirmDelete = async (): Promise<void> => {
    const faq = this.state.faqToDelete;

    if (!faq || this.state.isDeleting) {
      return;
    }

    this.setState({
      isDeleting: true,
      errorMessage: ''
    });

    try {
      await this.props.faqService.deleteFAQ(faq.Id);
      await this.props.onFaqAdded();

      this.setState({
        isDeleteDialogOpen: false,
        faqToDelete: null,
        isDeleting: false,
        successMessage: 'FAQ deleted successfully!',
        errorMessage: ''
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);

      this.setState({
        isDeleting: false,
        errorMessage: 'Could not delete the FAQ. Please try again.'
      });
    }
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
    const { editingId } = this.state;

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
      faqs.map(faq => faq.Category)
    );

    const filteredFaqs = this._getFilteredFaqs();

    const categoryOptions: IDropdownOption[] = [
      { key: 'All', text: 'All Categories' },
      ...Array.from(categories).map(category => ({
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

        {/* SUCCESS MESSAGE */}
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

        {/* ERROR MESSAGE */}
        {this.state.errorMessage && (
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            onDismiss={() => this.setState({ errorMessage: '' })}
            dismissButtonAriaLabel="Close"
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
                  onClick={() => this._handleEdit(faq)}
                />

                <DefaultButton
                  iconProps={{ iconName: 'Delete' }}
                  text="Delete"
                  onClick={() => this._openDeleteDialog(faq)}
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

        {/* ADD / EDIT FAQ PANEL */}
        <Panel
          isOpen={this.state.isFormOpen}
          onDismiss={this._closeForm}
          type={PanelType.medium}
          headerText={
            editingId !== null ? 'Edit FAQ' : 'Add New FAQ'
          }
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
                  displayOrder: value === '' ? 0 : Number(value)
                })
              }
            />

            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton
                text={
                  editingId !== null ? 'Update FAQ' : 'Save FAQ'
                }
                onClick={async () => {
                  const question = this.state.question.trim();
                  const answer = this.state.answer.trim();
                  const displayOrder = Number(this.state.displayOrder);

                  if (!question || !answer) {
                    this.setState({
                      errorMessage:
                        'Please enter both the question and answer.',
                      successMessage: ''
                    });
                    return;
                  }

                  if (
                    !Number.isFinite(displayOrder) ||
                    displayOrder <= 0
                  ) {
                    this.setState({
                      errorMessage:
                        'Please enter a display order greater than 0.',
                      successMessage: ''
                    });
                    return;
                  }

                  try {
                    const faqData = {
                      Title: question,
                      Answer: answer,
                      Category: this.state.formCategory,
                      IsFeatured: this.state.isFeatured,
                      DisplayOrder: displayOrder,
                      IsActive: this.state.formStatus
                    };

                    if (this.state.editingId !== null) {
                      await this.props.faqService.updateFAQ(
                        this.state.editingId,
                        faqData
                      );
                    } else {
                      await this.props.faqService.addFAQ(faqData);
                    }

                    await this.props.onFaqAdded();

                    this.setState({
                      isFormOpen: false,
                      editingId: null,
                      question: '',
                      answer: '',
                      formCategory: 'Other',
                      formStatus: 'Draft',
                      isFeatured: false,
                      displayOrder: 1,
                      errorMessage: '',
                      successMessage:
                        editingId !== null
                          ? 'FAQ updated successfully!'
                          : 'FAQ added successfully!'
                    });
                  } catch (error) {
                    console.error('Error saving FAQ:', error);

                    this.setState({
                      errorMessage:
                        editingId !== null
                          ? 'Could not update the FAQ. Please try again.'
                          : 'Could not save the FAQ. Please try again.',
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

        {/* CUSTOM DELETE CONFIRMATION DIALOG */}
        <Dialog
          hidden={!this.state.isDeleteDialogOpen}
          onDismiss={this._closeDeleteDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Delete FAQ?',
            subText:
              'This action cannot be undone. The selected FAQ will be permanently removed from SharePoint.'
          }}
          modalProps={{
            isBlocking: true,
            styles: {
              main: {
                borderRadius: 8,
                maxWidth: 450
              }
            }
          }}
        >
          <Stack tokens={{ childrenGap: 12 }}>
            {this.state.faqToDelete && (
              <Stack
                styles={{
                  root: {
                    padding: 14,
                    background: '#f3f2f1',
                    borderRadius: 6,
                    borderLeft: '4px solid #d13438'
                  }
                }}
              >
                <Text
                  variant="medium"
                  styles={{ root: { fontWeight: 600 } }}
                >
                  {this.state.faqToDelete.Title}
                </Text>

                <Text
                  variant="small"
                  styles={{ root: { color: '#605e5c' } }}
                >
                  {this.state.faqToDelete.Category}
                </Text>
              </Stack>
            )}
          </Stack>

          <DialogFooter>
            <PrimaryButton
              text={
                this.state.isDeleting ? 'Deleting...' : 'Delete FAQ'
              }
              onClick={this._confirmDelete}
              disabled={this.state.isDeleting}
              styles={{
                root: {
                  background: '#d13438',
                  borderColor: '#d13438'
                },
                rootHovered: {
                  background: '#a4262c',
                  borderColor: '#a4262c'
                },
                rootPressed: {
                  background: '#8e1f24',
                  borderColor: '#8e1f24'
                }
              }}
            />

            <DefaultButton
              text="Cancel"
              onClick={this._closeDeleteDialog}
              disabled={this.state.isDeleting}
            />
          </DialogFooter>
        </Dialog>
      </Stack>
    );
  }
}
