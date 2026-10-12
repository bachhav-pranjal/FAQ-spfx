
import { SPFI } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { IFAQ } from "../models/IFAQ";

export class FAQService {
  private _sp: SPFI;

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  // Get FAQs from SharePoint
  public async getFAQs(): Promise<IFAQ[]> {
    const items = await this._sp
      .web
      .lists
      .getByTitle("FAQs")
      .items
      .select(
        "Id",
        "Title",
        "Answer",
        "Category",
        "IsActive",
        "IsFeatured",
        "DisplayOrder"
      )();

    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      Answer: item.Answer,
      Category: item.Category,
      Status: item.IsActive ? "Published" : "Draft",
      IsFeatured: item.IsFeatured,
      DisplayOrder: item.DisplayOrder
    }));
  }

  // Add a new FAQ to SharePoint
  public async addFAQ(faq: {
    Title: string;
    Answer: string;
    Category: string;
    IsFeatured: boolean;
    DisplayOrder: number;
    IsActive: string;
  }): Promise<void> {
    console.log("FAQ data being sent:", faq);

    await this._sp
      .web
      .lists
      .getByTitle("FAQs")
      .items
      .add(faq);
  }

  // Update an existing FAQ in SharePoint
  public async updateFAQ(
    id: number,
    faq: {
      Title: string;
      Answer: string;
      Category: string;
      IsFeatured: boolean;
      DisplayOrder: number;
      IsActive: string;
    }
  ): Promise<void> {
    await this._sp
      .web
      .lists
      .getByTitle("FAQs")
      .items
      .getById(id)
      .update(faq);
  }
}
