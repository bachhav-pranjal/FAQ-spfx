
import { SPFI } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

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

    console.log("FAQs:", items);

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

  // Check SharePoint column types
  public async checkFAQFields(): Promise<void> {

    const fields = await this._sp
      .web
      .lists
      .getByTitle("FAQs")
      .fields
      .select(
        "Title",
        "InternalName",
        "TypeAsString"
      )();

    console.table(
      fields.map(field => ({
        DisplayName: field.Title,
        InternalName: field.InternalName,
        Type: field.TypeAsString
      }))
    );
  }
}
