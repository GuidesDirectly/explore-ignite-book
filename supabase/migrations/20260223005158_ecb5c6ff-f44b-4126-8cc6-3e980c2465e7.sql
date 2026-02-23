
-- Insert test verification requests for 3 guides
INSERT INTO verification_requests (guide_user_id, status, submitted_at)
VALUES
  ('ddac2066-17a2-44f2-afe6-9829814fac97', 'pending', now() - interval '2 days'),
  ('1675e538-3027-4461-9391-2236d3732fcc', 'pending', now() - interval '1 day'),
  ('d2cec764-6f94-4299-9e00-087ae2aa7848', 'pending', now() - interval '3 hours');

-- Insert test documents for each request
INSERT INTO verification_documents (request_id, doc_type, file_url)
SELECT id, 'license', 'https://oegfwomloaihzwomwypx.supabase.co/storage/v1/object/public/branding/sample-license.pdf'
FROM verification_requests WHERE guide_user_id = 'ddac2066-17a2-44f2-afe6-9829814fac97' AND status = 'pending' LIMIT 1;

INSERT INTO verification_documents (request_id, doc_type, file_url)
SELECT id, 'permit', 'https://oegfwomloaihzwomwypx.supabase.co/storage/v1/object/public/branding/sample-permit.pdf'
FROM verification_requests WHERE guide_user_id = 'ddac2066-17a2-44f2-afe6-9829814fac97' AND status = 'pending' LIMIT 1;

INSERT INTO verification_documents (request_id, doc_type, file_url)
SELECT id, 'license', 'https://oegfwomloaihzwomwypx.supabase.co/storage/v1/object/public/branding/sample-license.pdf'
FROM verification_requests WHERE guide_user_id = '1675e538-3027-4461-9391-2236d3732fcc' AND status = 'pending' LIMIT 1;

INSERT INTO verification_documents (request_id, doc_type, file_url)
SELECT id, 'certificate', 'https://oegfwomloaihzwomwypx.supabase.co/storage/v1/object/public/branding/sample-cert.pdf'
FROM verification_requests WHERE guide_user_id = 'd2cec764-6f94-4299-9e00-087ae2aa7848' AND status = 'pending' LIMIT 1;
