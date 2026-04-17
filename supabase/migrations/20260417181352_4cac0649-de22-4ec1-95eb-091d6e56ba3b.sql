UPDATE public.subscription_plans SET name='Founding', slug='founding', price_monthly=0  WHERE slug='free';
UPDATE public.subscription_plans SET name='Pro',      slug='pro',      price_monthly=29 WHERE slug='professional';
UPDATE public.subscription_plans SET name='Featured', slug='featured', price_monthly=59 WHERE slug='premium';