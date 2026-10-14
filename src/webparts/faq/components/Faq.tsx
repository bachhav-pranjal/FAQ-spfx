import * as React from 'react';

import {
  Stack,
  Text,
  SearchBox,
  Dropdown,
  IDropdownOption,
  DefaultButton,
  Icon
} from '@fluentui/react';

import type { IFaqProps } from './IFaqProps';
import { IFAQ } from '../../models/IFAQ';
import AdminFaq from './AdminFaq';

type DashboardView = 'user' | 'admin';

const BRAND_COLOR = '#17365D';

export interface IFaqState {
  // eslint-disable-next-line @rushstack/no-new-null
  expandedFaqId: number | null;
  searchText: string;
  selectedCategory: string;
  sortOrder: string;
  activeView: DashboardView;
}

export default class Faq extends React.Component<IFaqProps, IFaqState> {

  public state: IFaqState = {
    expandedFaqId: null,
    searchText: '',
    selectedCategory: 'All',
    sortOrder: 'Ascending',
    activeView: 'user'
  };

  // Switch dashboard
  private _switchDashboard = (view: DashboardView): void => {
    this.setState({
      activeView: view
    });
  };

  // Expand / collapse FAQ
  private _toggleFaq = (id: number): void => {
    this.setState({
      expandedFaqId:
        this.state.expandedFaqId === id ? null : id
    });
  };

  // Get filtered and sorted FAQs
  private _getFilteredFaqs = (): IFAQ[] => {
    const { faqs } = this.props;
    const { searchText, selectedCategory, sortOrder } = this.state;

    return faqs
      .filter(faq => faq.Status === 'Published')
      .filter(faq => {
        const matchesSearch = faq.Title
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' ||
          faq.Category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'Ascending') {
          return a.DisplayOrder - b.DisplayOrder;
        }

        return b.DisplayOrder - a.DisplayOrder;
      });
  };

  // Get categories for dropdown
  private _getCategories = (): IDropdownOption[] => {
  const categories: string[] = this.props.categories || [];

  return [
    {
      key: 'All',
      text: 'All Categories'
    },
    ...categories.map((category: string) => ({
      key: category,
      text: category
    }))
  ];
};

  // Shared dropdown styles (40px height to match the SearchBox)
  private _getDropdownStyles = (width: number, minWidth: number) => ({
    root: { width, minWidth, height: 40 },
    dropdown: { height: 40, boxSizing: 'border-box' as const },
    title: {
      height: 40,
      lineHeight: '38px',
      boxSizing: 'border-box' as const
    },
    caretDownWrapper: { height: 40, lineHeight: '38px' }
  });


  // Shared styles for the navbar buttons
  private _getNavButtonStyles = (isActive: boolean) => ({
    root: {
      background: isActive ? '#ffffff' : 'transparent',
      borderColor: '#ffffff'
    },
    rootHovered: {
      background: '#e8eef6',
      borderColor: '#ffffff'
    },
    rootPressed: {
      background: '#dbe5f1',
      borderColor: '#ffffff'
    },
    label: { color: isActive ? BRAND_COLOR : '#ffffff' },
    labelHovered: { color: BRAND_COLOR },
    icon: { color: isActive ? BRAND_COLOR : '#ffffff' },
    iconHovered: { color: BRAND_COLOR },
    iconPressed: { color: BRAND_COLOR }
  });

  public render(): React.ReactElement<IFaqProps> {
    const { faqs, isAdmin } = this.props;
    const { activeView } = this.state;

    // If the user is not an admin, always show the user dashboard.
    // This also prevents switching to the admin dashboard through this UI.

    const showAdminDashboard = isAdmin && activeView === 'admin';

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

        {/* NAVBAR */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
          styles={{
            root: {
              padding: '14px 18px',
              background: BRAND_COLOR,
              borderRadius: 8
            }
          }}
        >
          <Stack
            horizontal
            verticalAlign="center"
            tokens={{ childrenGap: 10 }}
          >
            <Icon
              iconName="Help"
              styles={{
                root: {
                  fontSize: 24,
                  color: '#ffffff'
                }
              }}
            />

            <Text
              variant="large"
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#ffffff'
                }
              }}
            >
              FAQ Portal
            </Text>
          </Stack>

          <Stack
            horizontal
            wrap
            verticalAlign="center"
            tokens={{ childrenGap: 8 }}
          >

            {isAdmin && (
            <DefaultButton
              text="User Dashboard"
              iconProps={{ iconName: 'Home' }}
              onClick={() => this._switchDashboard('user')}
              styles={this._getNavButtonStyles(activeView === 'user')}
            />
            )}

            {isAdmin && (
              <DefaultButton
                text="Admin Dashboard"
                iconProps={{ iconName: 'Settings' }}
                onClick={() => this._switchDashboard('admin')}
                styles={this._getNavButtonStyles(activeView === 'admin')}

              />
            )}
          </Stack>
        </Stack>

        {/* ADMIN DASHBOARD */}
        {showAdminDashboard ? (
          <AdminFaq
            categories={this.props.categories}
            faqs={faqs}
            faqService={this.props.faqService}
            onFaqAdded={this.props.onFaqAdded}
          />
        ) : (

          /* USER DASHBOARD */
          this._renderUserDashboard()
        )}

      </Stack>
    );
  }

  private _renderUserDashboard(): React.ReactElement {
    const { faqs } = this.props;

    const publishedFaqs = faqs.filter(
      faq => faq.Status === 'Published'
    );

    

    const popularFaqs = publishedFaqs
      .filter(faq => faq.IsFeatured)
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
      .slice(0, 3);

    const filteredFaqs = this._getFilteredFaqs();

    return (
      <Stack tokens={{ childrenGap: 20 }}>

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
              Smart FAQ Manager
            </Text>

            <Text
              variant="medium"
              styles={{
                root: {
                  color: '#605e5c'
                }
              }}
            >
              Find answers quickly and manage frequently asked questions
            </Text>
          </Stack>

          <Icon
            iconName="Help"
            styles={{
              root: {
                fontSize: 28,
                color: '#0078d4'
              }
            }}
          />
        </Stack>

        {/* STATISTICS */}
        
        
       

        {/* POPULAR QUESTIONS */}
        {popularFaqs.length > 0 && (
          <Stack tokens={{ childrenGap: 12 }}>
            <Text
              variant="xLarge"
              styles={{ root: { fontWeight: 600, color: '#323130' } }}
            >
              Popular Questions
            </Text>

            <Stack tokens={{ childrenGap: 10 }}>
              {popularFaqs.map(faq => {
                const isOpen = this.state.expandedFaqId === faq.Id;

                return (
                  <Stack
                    key={faq.Id}
                    styles={{
                      root: {
                        border: '1px solid #edebe9',
                        borderLeft: `4px solid ${BRAND_COLOR}`,
                        borderRadius: 8,
                        background: '#ffffff',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'box-shadow 0.2s ease',
                        selectors: {
                          ':hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                          }
                        }
                      }
                    }}
                  >
                    <Stack
                      horizontal
                      horizontalAlign="space-between"
                      verticalAlign="center"
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onClick={() => this._toggleFaq(faq.Id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          this._toggleFaq(faq.Id);
                        }
                      }}
                      styles={{
                        root: {
                          padding: '14px 18px',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Stack
                        horizontal
                        verticalAlign="center"
                        tokens={{ childrenGap: 14 }}
                        styles={{ root: { minWidth: 0 } }}
                      >
                        <Stack
                          horizontalAlign="center"
                          verticalAlign="center"
                          styles={{
                            root: {
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: '#e8eef6',
                              flexShrink: 0
                            }
                          }}
                        >
                          <Icon
                            iconName="FavoriteStarFill"
                            styles={{
                              root: { fontSize: 16, color: BRAND_COLOR }
                            }}
                          />
                        </Stack>

                        <Stack tokens={{ childrenGap: 2 }}>
                          <Text
                            variant="medium"
                            styles={{
                              root: { fontWeight: 600, color: '#323130' }
                            }}
                          >
                            {faq.Title}
                          </Text>
                          
                        </Stack>
                      </Stack>

                      <Icon
                        iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
                        styles={{
                          root: {
                            fontSize: 14,
                            color: '#605e5c',
                            marginLeft: 12
                          }
                        }}
                      />
                    </Stack>

                    {isOpen && (
                      <Stack
                        styles={{
                          root: {
                            padding: '14px 18px 16px 68px',
                            background: '#faf9f8',
                            borderTop: '1px solid #edebe9'
                          }
                        }}
                      >
                        <Text
                          variant="medium"
                          styles={{
                            root: {
                              color: '#605e5c',
                              lineHeight: '1.6',
                              whiteSpace: 'pre-wrap'
                            }
                          }}
                        >
                          {faq.Answer}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        )}

        {/* FAQ HEADER */}
        <Text
          variant="xLarge"
          styles={{
            root: {
              fontWeight: 600,
              color: '#323130'
            }
          }}
        >
          Frequently Asked Questions
        </Text>

        {/* SEARCH AND FILTERS */}
        <Stack
          horizontal
          wrap
          verticalAlign="center"
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              width: '100%',
              boxSizing: 'border-box',
              padding: 16,
              border: '1px solid #edebe9',
              borderRadius: 8,
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
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
                flexGrow: 1,
                minWidth: 250,
                height: 40,
                boxSizing: 'border-box',
                alignItems: 'center'
              }
            }}
          />

          <Dropdown
            placeholder="All Categories"
            selectedKey={this.state.selectedCategory}
            options={this._getCategories()}
            onChange={(_, option) => {
              if (option) {
                this.setState({
                  selectedCategory: option.key as string
                });
              }
            }}
            styles={this._getDropdownStyles(250, 200)}
            
          />

   

          <Dropdown
            selectedKey={this.state.sortOrder}
            options={[
              {
                key: 'Ascending',
                text: 'Display Order: Low to High'
              },
              {
                key: 'Descending',
                text: 'Display Order: High to Low'
              }
            ]}
            onChange={(_, option) => {
              if (option) {
                this.setState({
                  sortOrder: option.key as string
                });
              }
            }}
            styles={this._getDropdownStyles(225, 180)}
          />
        </Stack>

        {/* FAQ LIST */}
        <Stack tokens={{ childrenGap: 10 }}>
          {filteredFaqs.length === 0 ? (
            <Stack
              horizontalAlign="center"
              tokens={{ childrenGap: 8 }}
              styles={{
                root: {
                  padding: 30,
                  border: '1px solid #edebe9',
                  borderRadius: 8,
                  background: '#ffffff'
                }
              }}
            >
              <Icon
                iconName="SearchIssue"
                styles={{ root: { fontSize: 28, color: '#a19f9d' } }}
              />

              <Text
                variant="medium"
                styles={{ root: { color: '#605e5c' } }}
              >
                No published FAQs found.
              </Text>

              <Text
                variant="small"
                styles={{ root: { color: '#a19f9d' } }}
              >
                Try changing your search or category filter.
              </Text>
            </Stack>
          ) : (
            filteredFaqs.map(faq => {
              const isOpen = this.state.expandedFaqId === faq.Id;

              return (
                <Stack
                  key={faq.Id}
                  styles={{
                    root: {
                      border: '1px solid #edebe9',
                      borderLeft:`4px solid ${BRAND_COLOR}`,
                      borderRadius: 8,
                      background: '#ffffff',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s ease, border-left-color 0.2s ease',
                      selectors: {
                        ':hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                        }
                      }
                    }
                  }}
                >
                  <Stack
                    horizontal
                    horizontalAlign="space-between"
                    verticalAlign="center"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => this._toggleFaq(faq.Id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this._toggleFaq(faq.Id);
                      }
                    }}
                    styles={{
                      root: {
                        padding: '16px 18px',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Stack
                      horizontal
                      verticalAlign="center"
                      wrap
                      tokens={{ childrenGap: 12 }}
                      styles={{ root: { minWidth: 0 } }}
                    >
                      <Text
                        variant="medium"
                        styles={{
                          root: { fontWeight: 600, color: '#323130' }
                        }}
                      >
                        {faq.Title}
                      </Text>

                      <Stack
                        horizontal
                        verticalAlign="center"
                        styles={{
                          root: {
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: '#e8eef6',
                            whiteSpace: 'nowrap'
                          }
                        }}
                      >
                        <Text
                          variant="small"
                          styles={{
                            root: { color: BRAND_COLOR, fontWeight: 600 }
                          }}
                        >
                          {faq.Category}
                        </Text>
                      </Stack>
                    </Stack>

                    <Icon
                      iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
                      styles={{
                        root: {
                          fontSize: 14,
                          color: '#605e5c',
                          marginLeft: 12
                        }
                      }}
                    />
                  </Stack>

                  {isOpen && (
                    <Stack
                      styles={{
                        root: {
                          padding: '14px 18px 16px 18px',
                          background: '#faf9f8',
                          borderTop: '1px solid #edebe9'
                        }
                      }}
                    >
                      <Text
                        variant="medium"
                        styles={{
                          root: {
                            color: '#605e5c',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }
                        }}
                      >
                        {faq.Answer}
                      </Text>
                    </Stack>
                  )}
                </Stack>
              );
            })
          )}
        </Stack>
      </Stack>
    );
  }
}