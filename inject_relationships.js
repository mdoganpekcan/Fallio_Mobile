const fs = require("fs");
const path =
  "c:/Users/velcr/Documents/GITHUB_PROJECTS/Fallio/Fallio_Mobile/Fallio/types/supabase.ts";
let content = fs.readFileSync(path, "utf8");

if (content.includes("Relationships: any[];")) {
  console.log("Already injected.");
} else {
  content = content.replace(/Update: \{[\s\S]*?\};/g, (match) => {
    return (
      match +
      "\n        Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[]; }[];"
    );
  });
  fs.writeFileSync(path, content, "utf8");
  console.log("Successfully injected Relationships into types/supabase.ts");
}
