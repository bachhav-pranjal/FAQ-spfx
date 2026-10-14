
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

      console.log("FAQs returned from SharePoint:", items);

    return items.map(item => ({
      Id: item.Id,
      Title: item.Title,
      Answer: item.Answer,
      Category: item.Category,
      Status: item.IsActive ,
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

  
  // Delete an FAQ from SharePoint
  public async deleteFAQ(id: number): Promise<void> {
    await this._sp
      .web
      .lists
      .getByTitle("FAQs")
      .items
      .getById(id)
      .delete();
  }

  public async getCategories(): Promise<string[]> {
  const field = await this._sp
    .web
    .lists
    .getByTitle("FAQs")
    .fields
    .getByInternalNameOrTitle("Category")
    .select("Choices")();

  return (field.Choices || []) as string[];
}



public async getCategoriesWithFaqs(): Promise<string[]> {
  const items = await this._sp
    .web
    .lists
    .getByTitle("FAQs")
    .items
    .select("Category")();

  const categories = items
   
    .map(item => item.Category)
    .filter((category): category is string =>
      typeof category === "string" && category.trim() !== ""
    );

  return Array.from(new Set(categories)).sort();
}


public async getCategoriesWithPublishedFaqs(): Promise<string[]> {
  const items = await this._sp
    .web
    .lists
    .getByTitle("FAQs")
    .items
    .select("Category", "IsActive")();

  const categories = items
    .filter(item => item.IsActive === "Published")
    .map(item => item.Category)
    .filter((category): category is string => !!category);

  return Array.from(new Set(categories)).sort();
}


}

