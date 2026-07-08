const slug = "login-history";
const moduleName = "LoginHistory";

const blockLF = `          <Route
            path="${slug}"
            element={
              <RequirePermission requiredPermission="${slug}_view">
                <${moduleName}List />
              </RequirePermission>
            }
          />
          <Route
            path="${slug}/create"
            element={
              <RequirePermission requiredPermission="${slug}_add">
                <${moduleName}Form />
              </RequirePermission>
            }
          />
          <Route
            path="${slug}/edit/:id"
            element={
              <RequirePermission requiredPermission="${slug}_edit">
                <${moduleName}Form />
              </RequirePermission>
            }
          />\n`;

const blockCRLF = blockLF.replace(/\n/g, "\r\n");

// Strategy: match from <Route path="slug" to the last /> that closes the edit route's element
// Key insight: the last /> is always preceded by } (closing element={...})
// We need to match: } \n (spaces) /> 
// Try greedy for inner part, lazy for outer

// Approach 1: find everything from first <Route path="slug" to the 3rd />
// Count on the structure: <Route ... path="slug/edit/:id" ... />
const regex1 = new RegExp(`\\s*<Route[^>]*path=["']${slug}["'][\\s\\S]*?path=["']${slug}\\/edit\\/:id["'][\\s\\S]*?\\/>`);

// Approach 2: same but end on newline+spaces+/>  
const regex2 = new RegExp(`\\s*<Route[^>]*path=["']${slug}["'][\\s\\S]*?path=["']${slug}\\/edit\\/:id["'][\\s\\S]*?\\n\\s*\\/>`);

// Approach 3: greedy inner, specific end
const regex3 = new RegExp(`\\s*<Route\\s[\\s\\S]*?path=["']${slug}["'][\\s\\S]*?path=["']${slug}\\/edit\\/:id["'][\\s\\S]*?\\r?\\n\\s*\\/>`);

[regex1, regex2, regex3].forEach((regex, i) => {
  console.log(`\nRegex ${i+1}: ${regex.source.substring(0, 80)}...`);
  
  const mLF = blockLF.match(regex);
  console.log("LF Match:", mLF ? "✅" : "❌");
  if (mLF) console.log("LF Leftover:", JSON.stringify(blockLF.replace(regex, "").trim()) === '""' ? "✅ EMPTY" : blockLF.replace(regex, "").trim());
  
  const mCRLF = blockCRLF.match(regex);
  console.log("CRLF Match:", mCRLF ? "✅" : "❌");
  if (mCRLF) console.log("CRLF Leftover:", JSON.stringify(blockCRLF.replace(regex, "").trim()) === '""' ? "✅ EMPTY" : blockCRLF.replace(regex, "").trim());
});
