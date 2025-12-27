# 2025-12-27 12:15
- Fixed 'supabaseClient' redeclaration conflict in login.html.
- Converted 'let/const' to 'var' in supabase-config.js for safer global scope usage.
- Added robust existence checks in initSupabase.
- Fixed ReferenceError: initSupabase is not defined by ensuring scripts load in correct order and scope.
- Initial diagnostics and cleanup of login logic.
# 2025-12-27 12:09
- Initial diagnostics of login.html and supabase-config.js
- Identified identifier redeclaration conflict for 'supabaseClient' between login.html and supabase-config.js
- Created docs/ folder and initial documentation.
