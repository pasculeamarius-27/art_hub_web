# Access tests to implement before merging

Use local Supabase Auth user sessions and a second workspace, not only a privileged SQL connection. Assert anon cannot read drafts; a member reads only its own draft; a curator with an artwork grant creates a source/version on that artwork only; revoked grant blocks further access; forged `created_by` and `author_user_id` are denied; inserting approvals, memberships and curator grants from a client is denied. Test both allowed and denied requests. No hosted deployment until this suite passes.
