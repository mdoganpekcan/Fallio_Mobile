const fs = require("fs");
const path = require("path");

function rxReplace(file, search, replace) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, "utf8");
  content = content.replace(search, replace);
  fs.writeFileSync(fullPath, content, "utf8");
}

// 1. services/auth.ts
rxReplace(
  "services/auth.ts",
  /email: authUser\.email \|\| undefined/g,
  "email: authUser.email as string",
);
rxReplace("services/auth.ts", /catch \(e\) \{/g, "catch (e: any) {");
rxReplace(
  "services/auth.ts",
  /const userData = await this\.getUserData\(user\);/g,
  "const userData = await this.getUserData(user) as any;",
);
rxReplace(
  "services/auth.ts",
  /const profileData = result;/g,
  "const profileData = result as any;",
);
rxReplace("services/auth.ts", /\(data as unknown as User\)/g, "(data as any)");
rxReplace("services/auth.ts", /data: userDataRaw/g, "data: userDataRawRaw"); // avoid collision
rxReplace(
  "services/auth.ts",
  /const \{ data: userData,/g,
  "const { data: userDataRaw,",
);
rxReplace(
  "services/auth.ts",
  /error: userError \} = await supabase\.rpc\('get_full_user_profile', \{ p_auth_user_id: user\.id \}\);/g,
  "error: userError } = await supabase.rpc('get_full_user_profile', { p_auth_user_id: user.id });\n      const userData = userDataRaw as any;",
);
rxReplace(
  "services/auth.ts",
  /export const updateProfile = async \(userData\) => \{/g,
  "export const updateProfile = async (userData: any) => {",
);
rxReplace("services/auth.ts", /\(b\) => b/g, "(b: any) => b");
rxReplace(
  "services/auth.ts",
  /birth_date: userData\.birthDate/g,
  "birth_date: userData.birth_date",
);

// 2. services/wallet.ts
rxReplace("services/wallet.ts", /return data\[0\]/g, "return (data as any)[0]");

// 3. services/logger.ts
rxReplace("services/logger.ts", /details = null/g, "details: any = null");
rxReplace(
  "services/logger.ts",
  /\.from\('app_logs'\)/g,
  ".from('app_logs' as any)",
);

// 4. services/revenueCat.ts
rxReplace("services/revenueCat.ts", /catch \(e\) \{/g, "catch (e: any) {");

// 5. services/notifications.ts
rxReplace("services/notifications.ts", /catch \(e\) \{/g, "catch (e: any) {");
rxReplace("services/notifications.ts", /data => \{/g, "(data: any) => {");
rxReplace("services/notifications.ts", /extra\?\.eas/g, "extra as any)?.eas");

// 6. UI Components
rxReplace(
  "app/profile/edit.tsx",
  /data=\{zodiacSigns\}/g,
  "data={zodiacSigns as any[]}",
);
rxReplace(
  "app/profile/edit.tsx",
  /data=\{genderOptions\}/g,
  "data={genderOptions as any[]}",
);
rxReplace("app/(tabs)/profile.tsx", /birthDate/g, "birth_date");
rxReplace("app/auth/register.tsx", /birthDate/g, "birth_date");
rxReplace(
  "app/auth/reset-password.tsx",
  /typography\.h1/g,
  "typography.heading",
);
rxReplace("app/auth/reset-password.tsx", /typography\.h3/g, "typography.body");
rxReplace("app/auth/reset-password.tsx", /shadows\.md/g, "shadows.medium");
rxReplace("app/credits/buy.tsx", /typography\.h1/g, "typography.heading");
rxReplace("app/credits/buy.tsx", /typography\.h2/g, "typography.heading");
rxReplace("app/credits/buy.tsx", /typography\.h3/g, "typography.body");
rxReplace("app/credits/buy.tsx", /shadows\.md/g, "shadows.medium");
rxReplace(
  "components/FortuneShareCard.tsx",
  /typography\.captionBold/g,
  "typography.body",
);

console.log("Regex patch completed.");
