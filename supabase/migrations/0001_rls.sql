-- RLS is the second line of defence. The API re-checks ownership in services.
-- Apply with: supabase db push, or paste into the SQL editor after migrations.
-- Prisma connects with a privileged role and bypasses these policies.

alter table "User" enable row level security;
alter table "DeveloperProfile" enable row level security;
alter table "UserSkill" enable row level security;
alter table "UserLanguage" enable row level security;
alter table "CvFile" enable row level security;
alter table "Selection" enable row level security;
alter table "ProgressEvent" enable row level security;
alter table "IgnoredIssue" enable row level security;
alter table "SavedList" enable row level security;
alter table "SavedItem" enable row level security;
alter table "ChatConversation" enable row level security;
alter table "ChatMessage" enable row level security;
alter table "Notification" enable row level security;
alter table "NotificationPreference" enable row level security;
alter table "AiUsage" enable row level security;
alter table "PublicProfile" enable row level security;
alter table "OutreachRequest" enable row level security;
alter table "OutreachConversation" enable row level security;
alter table "OutreachMessage" enable row level security;
alter table "BlockedUser" enable row level security;

create policy "own user row" on "User"
  for select using ("authId" = auth.uid()::text);
create policy "own user update" on "User"
  for update using ("authId" = auth.uid()::text);

create policy "own profile" on "DeveloperProfile"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own skills" on "UserSkill"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own languages" on "UserLanguage"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own cv" on "CvFile"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));

create policy "own selections" on "Selection"
  for select using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own progress events" on "ProgressEvent"
  for select using ("selectionId" in (
    select s.id from "Selection" s join "User" u on u.id = s."userId"
    where u."authId" = auth.uid()::text
  ));
create policy "own ignored" on "IgnoredIssue"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));

create policy "own saved lists" on "SavedList"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own saved items" on "SavedItem"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));

create policy "own conversations" on "ChatConversation"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own messages" on "ChatMessage"
  for all using ("conversationId" in (
    select c.id from "ChatConversation" c join "User" u on u.id = c."userId"
    where u."authId" = auth.uid()::text
  ));

create policy "own notifications" on "Notification"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own preferences" on "NotificationPreference"
  for all using ("userId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "own usage" on "AiUsage"
  for select using ("userId" in (select id from "User" where "authId" = auth.uid()::text));

create policy "public profiles readable" on "PublicProfile"
  for select using (published = true);
create policy "own public profile" on "PublicProfile"
  for update using ("userId" in (select id from "User" where "authId" = auth.uid()::text));

create policy "received requests" on "OutreachRequest"
  for select using ("recipientId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "sent requests" on "OutreachRequest"
  for select using ("senderId" in (select id from "User" where "authId" = auth.uid()::text));
create policy "participant conversations" on "OutreachConversation"
  for select using ("requestId" in (
    select r.id from "OutreachRequest" r join "User" u on u.id in (r."senderId", r."recipientId")
    where u."authId" = auth.uid()::text
  ));
create policy "participant messages" on "OutreachMessage"
  for select using ("conversationId" in (
    select c.id from "OutreachConversation" c
    join "OutreachRequest" r on r.id = c."requestId"
    join "User" u on u.id in (r."senderId", r."recipientId")
    where u."authId" = auth.uid()::text
  ));
create policy "own blocks" on "BlockedUser"
  for all using ("blockerId" in (select id from "User" where "authId" = auth.uid()::text));
