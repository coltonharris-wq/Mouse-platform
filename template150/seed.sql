-- ============================================================================
-- Mouse Platform: Template 150 Seed Data
-- ============================================================================
-- This file seeds the pro_templates table with all 150 business templates.
-- Each template is stored as a JSONB blob for maximum flexibility.
--
-- Prerequisites:
--   CREATE TABLE pro_templates (
--     id TEXT PRIMARY KEY,
--     version TEXT NOT NULL DEFAULT '1.0.0',
--     vertical TEXT NOT NULL,
--     sub_vertical TEXT NOT NULL,
--     template JSONB NOT NULL,
--     required_plan TEXT NOT NULL DEFAULT 'pro',
--     tags TEXT[] DEFAULT '{}',
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
--   );
--
--   CREATE INDEX idx_pro_templates_vertical ON pro_templates(vertical);
--   CREATE INDEX idx_pro_templates_sub_vertical ON pro_templates(sub_vertical);
--   CREATE INDEX idx_pro_templates_tags ON pro_templates USING gin(tags);
-- ============================================================================

-- Truncate and re-seed (idempotent)
TRUNCATE TABLE pro_templates;

-- ============================================================================
-- FOOD & RESTAURANT (12 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('pizza-shop', 'food-restaurant', 'pizza-shop', 'pro', ARRAY['food', 'pizza', 'restaurant', 'delivery']),
  ('mexican-restaurant', 'food-restaurant', 'mexican-restaurant', 'pro', ARRAY['food', 'mexican', 'restaurant']),
  ('chinese-restaurant', 'food-restaurant', 'chinese-restaurant', 'pro', ARRAY['food', 'chinese', 'restaurant', 'takeout']),
  ('sushi-restaurant', 'food-restaurant', 'sushi-restaurant', 'pro', ARRAY['food', 'sushi', 'japanese', 'restaurant']),
  ('indian-restaurant', 'food-restaurant', 'indian-restaurant', 'pro', ARRAY['food', 'indian', 'restaurant']),
  ('thai-restaurant', 'food-restaurant', 'thai-restaurant', 'pro', ARRAY['food', 'thai', 'restaurant']),
  ('bbq-restaurant', 'food-restaurant', 'bbq-restaurant', 'pro', ARRAY['food', 'bbq', 'barbecue', 'restaurant']),
  ('bakery', 'food-restaurant', 'bakery', 'pro', ARRAY['food', 'bakery', 'pastry', 'cafe']),
  ('coffee-shop', 'food-restaurant', 'coffee-shop', 'pro', ARRAY['food', 'coffee', 'cafe']),
  ('food-truck', 'food-restaurant', 'food-truck', 'pro', ARRAY['food', 'food-truck', 'mobile']),
  ('ice-cream-shop', 'food-restaurant', 'ice-cream-shop', 'pro', ARRAY['food', 'ice-cream', 'dessert']),
  ('juice-smoothie-bar', 'food-restaurant', 'juice-smoothie-bar', 'pro', ARRAY['food', 'juice', 'smoothie', 'health']);

-- ============================================================================
-- REAL ESTATE (8 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('real-estate-agent', 'real-estate', 'real-estate-agent', 'pro', ARRAY['real-estate', 'agent', 'residential']),
  ('property-management', 'real-estate', 'property-management', 'pro', ARRAY['real-estate', 'property-management', 'landlord']),
  ('mortgage-broker', 'real-estate', 'mortgage-broker', 'pro', ARRAY['real-estate', 'mortgage', 'lending']),
  ('home-inspector', 'real-estate', 'home-inspector', 'pro', ARRAY['real-estate', 'inspection', 'home']),
  ('title-company', 'real-estate', 'title-company', 'pro', ARRAY['real-estate', 'title', 'closing']),
  ('commercial-real-estate', 'real-estate', 'commercial-real-estate', 'pro', ARRAY['real-estate', 'commercial', 'leasing']),
  ('real-estate-appraiser', 'real-estate', 'real-estate-appraiser', 'pro', ARRAY['real-estate', 'appraisal']),
  ('real-estate-investor', 'real-estate', 'real-estate-investor', 'pro', ARRAY['real-estate', 'investor', 'rental']);

-- ============================================================================
-- PETS & ANIMALS (7 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('veterinary-clinic', 'pets-animals', 'veterinary-clinic', 'pro', ARRAY['pets', 'veterinary', 'animal-care']),
  ('dog-grooming', 'pets-animals', 'dog-grooming', 'pro', ARRAY['pets', 'grooming', 'dogs']),
  ('dog-training', 'pets-animals', 'dog-training', 'pro', ARRAY['pets', 'training', 'dogs']),
  ('pet-boarding', 'pets-animals', 'pet-boarding', 'pro', ARRAY['pets', 'boarding', 'kennel']),
  ('dog-walking', 'pets-animals', 'dog-walking', 'pro', ARRAY['pets', 'walking', 'pet-sitting']),
  ('pet-photography', 'pets-animals', 'pet-photography', 'pro', ARRAY['pets', 'photography', 'portraits']),
  ('mobile-pet-grooming', 'pets-animals', 'mobile-pet-grooming', 'pro', ARRAY['pets', 'grooming', 'mobile']);

-- ============================================================================
-- AUTOMOTIVE (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('auto-repair-shop', 'automotive', 'auto-repair-shop', 'pro', ARRAY['automotive', 'repair', 'mechanic']),
  ('auto-body-shop', 'automotive', 'auto-body-shop', 'pro', ARRAY['automotive', 'body-shop', 'collision']),
  ('oil-change-shop', 'automotive', 'oil-change-shop', 'pro', ARRAY['automotive', 'oil-change', 'quick-lube']),
  ('tire-shop', 'automotive', 'tire-shop', 'pro', ARRAY['automotive', 'tires', 'wheels']),
  ('auto-detailing', 'automotive', 'auto-detailing', 'pro', ARRAY['automotive', 'detailing', 'car-wash']),
  ('car-dealership', 'automotive', 'car-dealership', 'pro', ARRAY['automotive', 'dealership', 'sales']),
  ('towing-service', 'automotive', 'towing-service', 'pro', ARRAY['automotive', 'towing', 'roadside']),
  ('transmission-shop', 'automotive', 'transmission-shop', 'pro', ARRAY['automotive', 'transmission', 'repair']),
  ('auto-glass', 'automotive', 'auto-glass', 'pro', ARRAY['automotive', 'glass', 'windshield']),
  ('motorcycle-shop', 'automotive', 'motorcycle-shop', 'pro', ARRAY['automotive', 'motorcycle', 'powersports']);

-- ============================================================================
-- BEAUTY & PERSONAL CARE (12 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('hair-salon', 'beauty-personal-care', 'hair-salon', 'pro', ARRAY['beauty', 'hair', 'salon']),
  ('barbershop', 'beauty-personal-care', 'barbershop', 'pro', ARRAY['beauty', 'barber', 'mens-grooming']),
  ('nail-salon', 'beauty-personal-care', 'nail-salon', 'pro', ARRAY['beauty', 'nails', 'manicure']),
  ('med-spa', 'beauty-personal-care', 'med-spa', 'pro', ARRAY['beauty', 'med-spa', 'aesthetics']),
  ('day-spa', 'beauty-personal-care', 'day-spa', 'pro', ARRAY['beauty', 'spa', 'massage']),
  ('massage-therapy', 'beauty-personal-care', 'massage-therapy', 'pro', ARRAY['beauty', 'massage', 'therapy']),
  ('waxing-salon', 'beauty-personal-care', 'waxing-salon', 'pro', ARRAY['beauty', 'waxing', 'hair-removal']),
  ('lash-studio', 'beauty-personal-care', 'lash-studio', 'pro', ARRAY['beauty', 'lashes', 'extensions']),
  ('brow-studio', 'beauty-personal-care', 'brow-studio', 'pro', ARRAY['beauty', 'brows', 'microblading']),
  ('tanning-salon', 'beauty-personal-care', 'tanning-salon', 'pro', ARRAY['beauty', 'tanning', 'spray-tan']),
  ('tattoo-parlor', 'beauty-personal-care', 'tattoo-parlor', 'pro', ARRAY['beauty', 'tattoo', 'body-art']),
  ('makeup-artist', 'beauty-personal-care', 'makeup-artist', 'pro', ARRAY['beauty', 'makeup', 'bridal']);

-- ============================================================================
-- HOME SERVICES (15 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('plumber', 'home-services', 'plumber', 'pro', ARRAY['home-services', 'plumbing', 'emergency']),
  ('electrician', 'home-services', 'electrician', 'pro', ARRAY['home-services', 'electrical', 'wiring']),
  ('hvac', 'home-services', 'hvac', 'pro', ARRAY['home-services', 'hvac', 'heating', 'cooling']),
  ('house-cleaning', 'home-services', 'house-cleaning', 'pro', ARRAY['home-services', 'cleaning', 'maid']),
  ('landscaping', 'home-services', 'landscaping', 'pro', ARRAY['home-services', 'landscaping', 'lawn']),
  ('pest-control', 'home-services', 'pest-control', 'pro', ARRAY['home-services', 'pest-control', 'exterminator']),
  ('roofing', 'home-services', 'roofing', 'pro', ARRAY['home-services', 'roofing', 'roof-repair']),
  ('painting', 'home-services', 'painting', 'pro', ARRAY['home-services', 'painting', 'interior', 'exterior']),
  ('locksmith', 'home-services', 'locksmith', 'pro', ARRAY['home-services', 'locksmith', 'security']),
  ('carpet-cleaning', 'home-services', 'carpet-cleaning', 'pro', ARRAY['home-services', 'carpet', 'cleaning']),
  ('tree-service', 'home-services', 'tree-service', 'pro', ARRAY['home-services', 'tree', 'removal', 'trimming']),
  ('fence-company', 'home-services', 'fence-company', 'pro', ARRAY['home-services', 'fence', 'installation']),
  ('garage-door', 'home-services', 'garage-door', 'pro', ARRAY['home-services', 'garage-door', 'repair']),
  ('pool-service', 'home-services', 'pool-service', 'pro', ARRAY['home-services', 'pool', 'maintenance']),
  ('handyman', 'home-services', 'handyman', 'pro', ARRAY['home-services', 'handyman', 'repair']);

-- ============================================================================
-- HEALTHCARE (12 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('dental-office', 'healthcare', 'dental-office', 'pro', ARRAY['healthcare', 'dental', 'dentist']),
  ('chiropractic', 'healthcare', 'chiropractic', 'pro', ARRAY['healthcare', 'chiropractic', 'spine']),
  ('optometry', 'healthcare', 'optometry', 'pro', ARRAY['healthcare', 'optometry', 'vision', 'eye-care']),
  ('physical-therapy', 'healthcare', 'physical-therapy', 'pro', ARRAY['healthcare', 'physical-therapy', 'rehabilitation']),
  ('mental-health', 'healthcare', 'mental-health', 'pro', ARRAY['healthcare', 'mental-health', 'therapy', 'counseling']),
  ('dermatology', 'healthcare', 'dermatology', 'pro', ARRAY['healthcare', 'dermatology', 'skin']),
  ('pediatrics', 'healthcare', 'pediatrics', 'pro', ARRAY['healthcare', 'pediatrics', 'children']),
  ('urgent-care', 'healthcare', 'urgent-care', 'pro', ARRAY['healthcare', 'urgent-care', 'walk-in']),
  ('pharmacy', 'healthcare', 'pharmacy', 'pro', ARRAY['healthcare', 'pharmacy', 'prescription']),
  ('home-health', 'healthcare', 'home-health', 'pro', ARRAY['healthcare', 'home-health', 'senior-care']),
  ('acupuncture', 'healthcare', 'acupuncture', 'pro', ARRAY['healthcare', 'acupuncture', 'holistic']),
  ('hearing-aid', 'healthcare', 'hearing-aid', 'pro', ARRAY['healthcare', 'hearing', 'audiology']);

-- ============================================================================
-- LEGAL (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('personal-injury-lawyer', 'legal', 'personal-injury-lawyer', 'pro', ARRAY['legal', 'personal-injury', 'attorney']),
  ('family-law-attorney', 'legal', 'family-law-attorney', 'pro', ARRAY['legal', 'family-law', 'divorce']),
  ('criminal-defense-lawyer', 'legal', 'criminal-defense-lawyer', 'pro', ARRAY['legal', 'criminal-defense', 'attorney']),
  ('immigration-lawyer', 'legal', 'immigration-lawyer', 'pro', ARRAY['legal', 'immigration', 'visa']),
  ('estate-planning-attorney', 'legal', 'estate-planning-attorney', 'pro', ARRAY['legal', 'estate-planning', 'wills']),
  ('bankruptcy-attorney', 'legal', 'bankruptcy-attorney', 'pro', ARRAY['legal', 'bankruptcy', 'debt']),
  ('real-estate-attorney', 'legal', 'real-estate-attorney', 'pro', ARRAY['legal', 'real-estate', 'closing']),
  ('business-law-attorney', 'legal', 'business-law-attorney', 'pro', ARRAY['legal', 'business-law', 'corporate']),
  ('dui-lawyer', 'legal', 'dui-lawyer', 'pro', ARRAY['legal', 'dui', 'traffic']),
  ('workers-comp-attorney', 'legal', 'workers-comp-attorney', 'pro', ARRAY['legal', 'workers-comp', 'injury']);

-- ============================================================================
-- FITNESS & WELLNESS (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('gym-fitness-center', 'fitness-wellness', 'gym-fitness-center', 'pro', ARRAY['fitness', 'gym', 'fitness-center']),
  ('yoga-studio', 'fitness-wellness', 'yoga-studio', 'pro', ARRAY['fitness', 'yoga', 'wellness']),
  ('martial-arts-studio', 'fitness-wellness', 'martial-arts-studio', 'pro', ARRAY['fitness', 'martial-arts', 'karate']),
  ('personal-training-studio', 'fitness-wellness', 'personal-training-studio', 'pro', ARRAY['fitness', 'personal-training', 'coaching']),
  ('pilates-studio', 'fitness-wellness', 'pilates-studio', 'pro', ARRAY['fitness', 'pilates', 'reformer']),
  ('crossfit-box', 'fitness-wellness', 'crossfit-box', 'pro', ARRAY['fitness', 'crossfit', 'functional']),
  ('dance-studio', 'fitness-wellness', 'dance-studio', 'pro', ARRAY['fitness', 'dance', 'classes']),
  ('swim-school', 'fitness-wellness', 'swim-school', 'pro', ARRAY['fitness', 'swimming', 'lessons', 'water-safety']),
  ('cycling-spin-studio', 'fitness-wellness', 'cycling-spin-studio', 'pro', ARRAY['fitness', 'cycling', 'spin']),
  ('wellness-center', 'fitness-wellness', 'wellness-center', 'pro', ARRAY['fitness', 'wellness', 'holistic']);

-- ============================================================================
-- PROFESSIONAL SERVICES (12 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('accountant-cpa', 'professional-services', 'accountant-cpa', 'pro', ARRAY['professional', 'accountant', 'cpa', 'tax']),
  ('insurance-agent', 'professional-services', 'insurance-agent', 'pro', ARRAY['professional', 'insurance', 'agent']),
  ('financial-advisor', 'professional-services', 'financial-advisor', 'pro', ARRAY['professional', 'financial', 'advisor']),
  ('tax-preparation', 'professional-services', 'tax-preparation', 'pro', ARRAY['professional', 'tax', 'preparation']),
  ('marketing-agency', 'professional-services', 'marketing-agency', 'pro', ARRAY['professional', 'marketing', 'agency']),
  ('it-support-msp', 'professional-services', 'it-support-msp', 'pro', ARRAY['professional', 'it', 'tech-support']),
  ('consulting-firm', 'professional-services', 'consulting-firm', 'pro', ARRAY['professional', 'consulting', 'advisory']),
  ('staffing-agency', 'professional-services', 'staffing-agency', 'pro', ARRAY['professional', 'staffing', 'recruiting']),
  ('photographer', 'professional-services', 'photographer', 'pro', ARRAY['professional', 'photography', 'portrait']),
  ('videographer', 'professional-services', 'videographer', 'pro', ARRAY['professional', 'video', 'production']),
  ('bookkeeper', 'professional-services', 'bookkeeper', 'pro', ARRAY['professional', 'bookkeeping', 'accounting']),
  ('notary-public', 'professional-services', 'notary-public', 'pro', ARRAY['professional', 'notary', 'signing']);

-- ============================================================================
-- CONSTRUCTION & TRADES (12 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('general-contractor', 'construction-trades', 'general-contractor', 'pro', ARRAY['construction', 'contractor', 'remodeling']),
  ('flooring-company', 'construction-trades', 'flooring-company', 'pro', ARRAY['construction', 'flooring', 'hardwood']),
  ('window-door-installer', 'construction-trades', 'window-door-installer', 'pro', ARRAY['construction', 'windows', 'doors']),
  ('kitchen-remodeler', 'construction-trades', 'kitchen-remodeler', 'pro', ARRAY['construction', 'kitchen', 'remodeling']),
  ('bathroom-remodeler', 'construction-trades', 'bathroom-remodeler', 'pro', ARRAY['construction', 'bathroom', 'remodeling']),
  ('concrete-company', 'construction-trades', 'concrete-company', 'pro', ARRAY['construction', 'concrete', 'flatwork']),
  ('solar-installer', 'construction-trades', 'solar-installer', 'pro', ARRAY['construction', 'solar', 'energy']),
  ('masonry-company', 'construction-trades', 'masonry-company', 'pro', ARRAY['construction', 'masonry', 'brick', 'stone']),
  ('welding-shop', 'construction-trades', 'welding-shop', 'pro', ARRAY['construction', 'welding', 'fabrication']),
  ('cabinet-maker', 'construction-trades', 'cabinet-maker', 'pro', ARRAY['construction', 'cabinets', 'custom', 'woodworking']),
  ('countertop-company', 'construction-trades', 'countertop-company', 'pro', ARRAY['construction', 'countertops', 'granite', 'quartz']),
  ('septic-service', 'construction-trades', 'septic-service', 'pro', ARRAY['construction', 'septic', 'pumping']);

-- ============================================================================
-- EDUCATION & TRAINING (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('tutoring-center', 'education-training', 'tutoring-center', 'pro', ARRAY['education', 'tutoring', 'academic']),
  ('driving-school', 'education-training', 'driving-school', 'pro', ARRAY['education', 'driving', 'lessons']),
  ('music-lessons', 'education-training', 'music-lessons', 'pro', ARRAY['education', 'music', 'lessons']),
  ('art-classes', 'education-training', 'art-classes', 'pro', ARRAY['education', 'art', 'painting']),
  ('language-school', 'education-training', 'language-school', 'pro', ARRAY['education', 'language', 'esl']),
  ('test-prep-center', 'education-training', 'test-prep-center', 'pro', ARRAY['education', 'test-prep', 'sat', 'act']),
  ('daycare-center', 'education-training', 'daycare-center', 'pro', ARRAY['education', 'daycare', 'childcare']),
  ('preschool', 'education-training', 'preschool', 'pro', ARRAY['education', 'preschool', 'early-learning']),
  ('after-school-program', 'education-training', 'after-school-program', 'pro', ARRAY['education', 'after-school', 'enrichment']),
  ('cooking-classes', 'education-training', 'cooking-classes', 'pro', ARRAY['education', 'cooking', 'culinary']);

-- ============================================================================
-- RETAIL (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('clothing-boutique', 'retail', 'clothing-boutique', 'pro', ARRAY['retail', 'clothing', 'fashion', 'boutique']),
  ('jewelry-store', 'retail', 'jewelry-store', 'pro', ARRAY['retail', 'jewelry', 'fine-jewelry', 'repairs']),
  ('gift-shop', 'retail', 'gift-shop', 'pro', ARRAY['retail', 'gift-shop', 'gifts', 'specialty']),
  ('pet-store', 'retail', 'pet-store', 'pro', ARRAY['retail', 'pet-store', 'pets', 'pet-supplies']),
  ('hardware-store', 'retail', 'hardware-store', 'pro', ARRAY['retail', 'hardware', 'home-improvement', 'tools']),
  ('florist', 'retail', 'florist', 'pro', ARRAY['retail', 'florist', 'flowers', 'delivery']),
  ('thrift-store', 'retail', 'thrift-store', 'pro', ARRAY['retail', 'thrift', 'secondhand', 'nonprofit']),
  ('sporting-goods', 'retail', 'sporting-goods', 'pro', ARRAY['retail', 'sporting-goods', 'sports', 'team-sales']),
  ('bookstore', 'retail', 'bookstore', 'pro', ARRAY['retail', 'bookstore', 'books', 'independent']),
  ('furniture-store', 'retail', 'furniture-store', 'pro', ARRAY['retail', 'furniture', 'home-furnishings', 'delivery']);

-- ============================================================================
-- EVENTS & ENTERTAINMENT (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('dj-service', 'events-entertainment', 'dj-service', 'pro', ARRAY['events', 'dj', 'entertainment', 'music']),
  ('event-planner', 'events-entertainment', 'event-planner', 'pro', ARRAY['events', 'event-planner', 'planning', 'coordination']),
  ('wedding-photographer', 'events-entertainment', 'wedding-photographer', 'pro', ARRAY['events', 'photography', 'wedding', 'portrait']),
  ('wedding-venue', 'events-entertainment', 'wedding-venue', 'pro', ARRAY['events', 'venue', 'wedding-venue', 'weddings']),
  ('party-rental', 'events-entertainment', 'party-rental', 'pro', ARRAY['events', 'party-rental', 'tent-rental', 'equipment']),
  ('photo-booth', 'events-entertainment', 'photo-booth', 'pro', ARRAY['events', 'photo-booth', 'photography', 'entertainment']),
  ('limo-service', 'events-entertainment', 'limo-service', 'pro', ARRAY['events', 'limo', 'transportation', 'luxury']),
  ('wedding-planner', 'events-entertainment', 'wedding-planner', 'pro', ARRAY['events', 'wedding-planner', 'weddings', 'planning']),
  ('live-band', 'events-entertainment', 'live-band', 'pro', ARRAY['events', 'live-band', 'music', 'entertainment']),
  ('karaoke-bar', 'events-entertainment', 'karaoke-bar', 'pro', ARRAY['events', 'karaoke', 'bar', 'nightlife']);

-- ============================================================================
-- SPECIALTY SERVICES (10 templates)
-- ============================================================================
INSERT INTO pro_templates (id, vertical, sub_vertical, required_plan, tags) VALUES
  ('storage-facility', 'specialty-services', 'storage-facility', 'pro', ARRAY['specialty', 'storage', 'self-storage', 'rental']),
  ('laundromat', 'specialty-services', 'laundromat', 'pro', ARRAY['specialty', 'laundromat', 'laundry', 'wash-fold']),
  ('dry-cleaner', 'specialty-services', 'dry-cleaner', 'pro', ARRAY['specialty', 'dry-cleaner', 'laundry', 'garment-care']),
  ('moving-company', 'specialty-services', 'moving-company', 'pro', ARRAY['specialty', 'moving', 'movers', 'relocation']),
  ('junk-removal', 'specialty-services', 'junk-removal', 'pro', ARRAY['specialty', 'junk-removal', 'hauling', 'cleanout']),
  ('appliance-repair', 'specialty-services', 'appliance-repair', 'pro', ARRAY['specialty', 'appliance-repair', 'repair', 'home-service']),
  ('phone-repair', 'specialty-services', 'phone-repair', 'pro', ARRAY['specialty', 'phone-repair', 'device-repair', 'tech']),
  ('tailor-shop', 'specialty-services', 'tailor-shop', 'pro', ARRAY['specialty', 'tailor', 'alterations', 'sewing']),
  ('print-shop', 'specialty-services', 'print-shop', 'pro', ARRAY['specialty', 'print-shop', 'printing', 'custom-apparel']),
  ('funeral-home', 'specialty-services', 'funeral-home', 'pro', ARRAY['specialty', 'funeral-home', 'end-of-life', 'grief-support']);

-- ============================================================================
-- Verify count
-- ============================================================================
DO $$
DECLARE
  template_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO template_count FROM pro_templates;
  IF template_count != 150 THEN
    RAISE EXCEPTION 'Expected 150 templates, found %', template_count;
  END IF;
  RAISE NOTICE '✓ Successfully seeded % templates across 15 verticals', template_count;
END $$;
