
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
    const categories = new Set(
      this.props.faqs
        .filter(faq => faq.Status === 'Published')
        .map(faq => faq.Category)
    );

    return [
      { key: 'All', text: 'All Categories' },
      ...Array.from(categories).map(category => ({
        key: category,
        text: category
      }))
    ];
  };

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
              background: '#17365D',
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
            <DefaultButton
              text="User Dashboard"
              iconProps={{ iconName: 'Home' }}
              onClick={() => this._switchDashboard('user')}
              styles={{
                root: {
                  background: activeView === 'user'
                    ? '#ffffff'
                    : 'transparent',
                  borderColor: '#ffffff'
                },
                label: {
                  color: activeView === 'user'
                    ? '#17365D'
                    : '#ffffff'
                },
                icon: {
                  color: activeView === 'user'
                    ? '#17365D'
                    : '#ffffff'
                }
              }}
            />

            {isAdmin && (
              <DefaultButton
                text="Admin Dashboard"
                iconProps={{ iconName: 'Settings' }}
                onClick={() => this._switchDashboard('admin')}
                styles={{
                  root: {
                    background: activeView === 'admin'
                      ? '#ffffff'
                      : 'transparent',
                    borderColor: '#ffffff'
                  },
                  label: {
                    color: activeView === 'admin'
                      ? '#17365D'
                      : '#ffffff'
                  },
                  icon: {
                    color: activeView === 'admin'
                      ? '#17365D'
                      : '#ffffff'
                  }
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* ADMIN DASHBOARD */}
        {showAdminDashboard ? (
          <AdminFaq
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

    const categories = new Set(
      publishedFaqs.map(faq => faq.Category)
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
        <Stack
          horizontal
          tokens={{ childrenGap: 16 }}
          styles={{ root: { width: '100%' } }}
        >
          <Stack
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
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              {publishedFaqs.length}
            </Text>

            <Text
              variant="medium"
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              Published FAQs
            </Text>

            <Text
              variant="small"
              styles={{ root: { color: '#605e5c' } }}
            >
              All published questions
            </Text>
          </Stack>

          <Stack
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
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              {categories.size}
            </Text>

            <Text
              variant="medium"
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              Categories
            </Text>

            <Text
              variant="small"
              styles={{ root: { color: '#605e5c' } }}
            >
              Across your FAQs
            </Text>
          </Stack>
        </Stack>

        {/* POPULAR QUESTIONS */}
        {popularFaqs.length > 0 && (
          <Stack tokens={{ childrenGap: 12 }}>
            <Text
              variant="xLarge"
              styles={{
                root: {
                  fontWeight: 600,
                  color: '#323130'
                }
              }}
            >
              Popular Questions
            </Text>

            <Stack tokens={{ childrenGap: 8 }}>
              {popularFaqs.map(faq => (
                <DefaultButton
                  key={faq.Id}
                  onClick={() => this._toggleFaq(faq.Id)}
                  styles={{
                    root: {
                      height: 'auto',
                      minHeight: 58,
                      padding: '12px 16px',
                      border: '1px solid #edebe9',
                      borderRadius: 8,
                      background: '#ffffff',
                      textAlign: 'left'
                    },
                    rootHovered: {
                      background: '#f8f8f8',
                      borderColor: '#d2d0ce'
                    },
                    label: { width: '100%' }
                  }}
                >
                  <Stack
                    horizontal
                    horizontalAlign="space-between"
                    verticalAlign="center"
                    styles={{ root: { width: '100%' } }}
                  >
                    <Stack
                      horizontal
                      verticalAlign="center"
                      tokens={{ childrenGap: 10 }}
                    >
                      <Icon
                        iconName="FavoriteStarFill"
                        styles={{
                          root: {
                            fontSize: 16,
                            color: '#0078d4'
                          }
                        }}
                      />

                      <Stack tokens={{ childrenGap: 2 }}>
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

                        <Text
                          variant="small"
                          styles={{ root: { color: '#605e5c' } }}
                        >
                          {faq.Category}
                        </Text>
                      </Stack>
                    </Stack>

                    <Icon
                      iconName={
                        this.state.expandedFaqId === faq.Id
                          ? 'ChevronUp'
                          : 'ChevronDown'
                      }
                      styles={{
                        root: {
                          fontSize: 14,
                          color: '#605e5c'
                        }
                      }}
                    />
                  </Stack>

                  {this.state.expandedFaqId === faq.Id && (
                    <Text
                      variant="medium"
                      styles={{
                        root: {
                          display: 'block',
                          paddingTop: 12,
                          color: '#605e5c',
                          whiteSpace: 'normal'
                        }
                      }}
                    >
                      {faq.Answer}
                    </Text>
                  )}
                </DefaultButton>
              ))}
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
          tokens={{ childrenGap: 12 }}
          styles={{ root: { width: '100%' } }}
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
                minWidth: 250
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
            styles={{ root: { minWidth: 200 } }}
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
            styles={{ root: { minWidth: 220 } }}
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
                styles={{
                  root: {
                    fontSize: 28,
                    color: '#a19f9d'
                  }
                }}
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
            filteredFaqs.map(faq => (
              <Stack
                key={faq.Id}
                tokens={{ childrenGap: 0 }}
                styles={{
                  root: {
                    border: '1px solid #edebe9',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#ffffff'
                  }
                }}
              >
                <DefaultButton
                  onClick={() => this._toggleFaq(faq.Id)}
                  styles={{
                    root: {
                      height: 'auto',
                      minHeight: 64,
                      padding: '14px 18px',
                      background: '#ffffff',
                      border: 'none',
                      textAlign: 'left',
                      width: '100%'
                    },
                    rootHovered: { background: '#f8f8f8' },
                    label: { width: '100%' }
                  }}
                >
                  <Stack
                    horizontal
                    horizontalAlign="space-between"
                    verticalAlign="center"
                    styles={{ root: { width: '100%' } }}
                  >
                    <Stack
                      horizontal
                      verticalAlign="center"
                      tokens={{ childrenGap: 12 }}
                      styles={{ root: { minWidth: 0 } }}
                    >
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
                        styles={{
                          root: {
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: '#f3f2f1',
                            whiteSpace: 'nowrap'
                          }
                        }}
                      >
                        <Text
                          variant="small"
                          styles={{
                            root: {
                              color: '#605e5c',
                              fontWeight: 600
                            }
                          }}
                        >
                          {faq.Category}
                        </Text>
                      </Stack>
                    </Stack>

                    <Icon
                      iconName={
                        this.state.expandedFaqId === faq.Id
                          ? 'ChevronUp'
                          : 'ChevronDown'
                      }
                      styles={{
                        root: {
                          fontSize: 14,
                          color: '#605e5c',
                          marginLeft: 12
                        }
                      }}
                    />
                  </Stack>
                </DefaultButton>

                {this.state.expandedFaqId === faq.Id && (
                  <Stack
                    styles={{
                      root: {
                        padding: '18px 20px',
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
            ))
          )}
        </Stack>
      </Stack>
    );
  }
}
