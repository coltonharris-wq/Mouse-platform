import type { ProTemplate } from './schema';

import { foodRestaurantTemplates } from './verticals/food-restaurant';
import { realEstateTemplates } from './verticals/real-estate';
import { petsAnimalsTemplates } from './verticals/pets-animals';
import { automotiveTemplates } from './verticals/automotive';
import { beautyPersonalCareTemplates } from './verticals/beauty-personal-care';
import { homeServicesTemplates } from './verticals/home-services';
import { healthcareTemplates } from './verticals/healthcare';
import { legalTemplates } from './verticals/legal';
import { fitnessWellnessTemplates } from './verticals/fitness-wellness';
import { professionalServicesTemplates } from './verticals/professional-services';
import { constructionTradesTemplates } from './verticals/construction-trades';
import { educationTrainingTemplates } from './verticals/education-training';
import { retailTemplates } from './verticals/retail';
import { eventsEntertainmentTemplates } from './verticals/events-entertainment';
import { specialtyServicesTemplates } from './verticals/specialty-services';

export const allTemplates: ProTemplate[] = [
  ...foodRestaurantTemplates,
  ...realEstateTemplates,
  ...petsAnimalsTemplates,
  ...automotiveTemplates,
  ...beautyPersonalCareTemplates,
  ...homeServicesTemplates,
  ...healthcareTemplates,
  ...legalTemplates,
  ...fitnessWellnessTemplates,
  ...professionalServicesTemplates,
  ...constructionTradesTemplates,
  ...educationTrainingTemplates,
  ...retailTemplates,
  ...eventsEntertainmentTemplates,
  ...specialtyServicesTemplates,
];

export const templatesByVertical: Record<string, ProTemplate[]> = {
  'food-restaurant': foodRestaurantTemplates,
  'real-estate': realEstateTemplates,
  'pets-animals': petsAnimalsTemplates,
  'automotive': automotiveTemplates,
  'beauty-personal-care': beautyPersonalCareTemplates,
  'home-services': homeServicesTemplates,
  'healthcare': healthcareTemplates,
  'legal': legalTemplates,
  'fitness-wellness': fitnessWellnessTemplates,
  'professional-services': professionalServicesTemplates,
  'construction-trades': constructionTradesTemplates,
  'education-training': educationTrainingTemplates,
  'retail': retailTemplates,
  'events-entertainment': eventsEntertainmentTemplates,
  'specialty-services': specialtyServicesTemplates,
};

export function getTemplateById(id: string): ProTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplatesByVertical(vertical: string): ProTemplate[] {
  return templatesByVertical[vertical] ?? [];
}

export { type ProTemplate } from './schema';
