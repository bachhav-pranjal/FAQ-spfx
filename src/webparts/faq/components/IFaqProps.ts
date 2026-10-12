import { IFAQ } from "../../models/IFAQ";
import { FAQService } from "../../services/FAQService";
export interface IFaqProps {

  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  userDisplayName: string;
  faqs: IFAQ[];
  isAdmin: boolean;

  
faqService: FAQService;
  onFaqAdded: () => Promise<void>;
}
