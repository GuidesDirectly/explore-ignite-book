-- Recreate view to also expose credential fields
CREATE OR REPLACE VIEW guide_profiles_public AS
SELECT id,
    user_id,
    service_areas,
    status,
    created_at,
    translations,
    jsonb_build_object(
      'firstName', form_data -> 'firstName',
      'lastName', form_data -> 'lastName',
      'biography', form_data -> 'biography',
      'languages', form_data -> 'languages',
      'specializations', form_data -> 'specializations',
      'tourTypes', form_data -> 'tourTypes',
      'targetAudience', form_data -> 'targetAudience',
      'insuranceCompanyName', form_data -> 'insuranceCompanyName',
      'licenseNumber', form_data -> 'licenseNumber',
      'licensingAuthority', form_data -> 'licensingAuthority',
      'certifications', form_data -> 'certifications'
    ) AS form_data
   FROM guide_profiles
  WHERE status = 'approved';