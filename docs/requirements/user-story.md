# **1. Product Backlog: User Stories** 

<u>https://drive.google.com/file/d/1CP5MnqhjeXjU9Zs4v4yAjXembSRXlDf4/view?usp=drive_link</u> 

### **FR-1 Manage Authentication** 

|**Sign up**|**Story**|
|---|---|
|**As a**new user||



**I need to** create an account with my name, email, and password or with GitHub **So that** I can start using the platform 

- Given I am on the sign-up page, when I submit a valid name, email, and password, then my account is created and I am logged in. 

- Given I choose "Sign up with GitHub", when I authorize the OAuth request, then an account is created and linked to my GitHub account. 

- Given I submit an email that is already registered or an invalid password, when I press sign up, then I see an error and no account is created. 

|Log in and out<br>Story|
|---|



As a registered user I need to log in with my email and password or GitHub and log out So that my account stays secure 

- Given I have an account, when I enter correct credentials or use GitHub login, then a session starts and I reach my dashboard. 

- Given I am logged in, when I press log out, then my session ends and protected pages are no longer accessible. 

- Given I enter wrong credentials, when I try to log in, then I see an error and no session is created. 

Reset password Story 

As a user who forgot my password I need to reset it through my registered email So that I can regain access to my account 

- Given I enter my registered email, when I request a reset, then a reset link is sent to that email. 

- Given I open a valid reset link, when I set a new valid password, then my password is updated and I can log in with it. 

Connect or disconnect GitHub Story 

#### As a developer 

I need to connect or disconnect my GitHub account from my settings So that the platform can read my repository, issue, and Pull Request data 

- Given I am in account settings, when I connect GitHub and authorize, then my GitHub account is linked and the token is stored encrypted. 

- Given my GitHub is connected, when I disconnect it, then the link is removed and the 

platform stops reading my GitHub data. 

|Role-based access<br>Story|
|---|



As an Admin I need access to be restricted by role So that only authorized users reach protected features 

- Given I am a Developer, when I open an Admin-only page, then access is denied. ● Given I am an Admin, when I open the Admin pages, then access is granted. 

### **FR-2 Manage Developer Information** 

|Set skills and experience<br>Story|
|---|



#### As a developer 

I need to describe my skills and interests and select my experience level So that recommendations fit me 

- Given I am on my developer profile, when I enter my skills and choose Beginner, Intermediate, or Advanced, then the information is saved. 

- Given I saved my profile, when I reopen it, then I see the same values. 

|Select preferred languages|Story|
|---|---|



#### As a developer 

I need to select my preferred programming languages and technologies So that I get Issues in the stack I like 

- Given I open the language selector, when I choose one or more items and save, then they are stored in my profile. 

|Required profile before recommendations<br>Story|
|---|



#### As a developer 

I need to update my information at any time and be prompted to complete the required fields So that my recommendations stay accurate 

- Given I have no experience level or no language, when I request recommendations, then I am asked to complete these fields first. 

- Given I update my profile, when I request new recommendations, then the updated information is used. 

### **FR-3 Manage CV Extraction** 

|Upload a CV<br>Story|
|---|



As a developer I need to upload or replace my CV So that the platform can read my skills 

- Given I select a CV in a supported type and size, when I upload it, then the file is accepted and its text is extracted. 

- Given I select an unsupported type or oversized file, when I upload it, then I see an error and it is rejected. 

- Given I already have a CV, when I upload a new one, then the previous extraction is replaced. 

Track extraction status Story As a developer I need to see the status of the CV extraction So that I know when my results are ready 

- Given I uploaded a CV, when the extraction is running, then I see a "processing" status. 

- Given the extraction completes, when I view the page, then the status shows "completed" with the results. 

Review and correct extracted skills Story As a developer I need to review and edit the extracted skills, technologies, and experience level So that my profile is accurate 

- Given extraction is complete, when I open the results, then I see the skills, technologies, and level found. 

- Given I add, edit, or remove a skill and save, when I reopen my profile, then my corrections are stored. 

### **FR-4 Manage Issue Discovery** 

#### Search for issues from my profile 

|Story|
|---|



#### As a developer 

I need to request an issue search based on my profile So that I find open Issues without searching manually 

- Given my profile is complete, when I request a search, then open Issues matching my languages, technologies, and level are retrieved from GitHub. 

#### Filter the search 

#### Story 

#### As a developer 

I need to filter by language, label, repository activity, organization, or repository So that I can narrow the results 

- Given I apply a language or "good first issue" label filter, when I search, then only matching Issues are returned. 

- Given I restrict the search to an organization or repository, when I search, then Issues come only from it. 

|Exclude unsuitable issues<br>Story|
|---|



#### As a developer 

I need closed, assigned, inactive, selected, or ignored Issues removed So that I only see Issues I can work on 

- Given the search finds closed, assigned, or inactive Issues, when the pool is built, then they are excluded. 

- Given I already selected or ignored an Issue, when I search, then it does not appear. 

- Given candidates remain, when the pool is built, then repository context is attached and the pool is passed to matching. 

|Handle empty results|Story|
|---|---|



#### As a developer 

I need to be told when no suitable Issues are found So that I can broaden my filters 

- Given no Issues match, when the search ends, then I see a "no suitable issues" message with an offer to broaden the filters. 

### **FR-5 Manage Issue Matching** 

|Get top three recommendations<br>Story|
|---|



#### As a developer 

I need to receive the three Issues that best match my profile So that I can pick a suitable contribution 

- Given a candidate pool exists, when matching runs, then the AI ranks it and I receive the three highest-ranked Issues. 

- Given recommendations are requested, when they are ready, then they are displayed within 10 seconds for most requests. 

#### View issue details and reason 

#### Story 

#### As a developer 

I need to see each recommended Issue's repository details, requirements, and why it was recommended So that I can judge the fit 

- Given I see recommendations, when I open one, then I see the repository name, description, link, required technologies, level, and prerequisites. 

- Given I view a recommendation, when it loads, then I see a short explanation of why it fits me. 

#### Regenerate recommendations 

#### Story 

#### As a developer 

I need to regenerate the recommendations So that I can see three different Issues 

- Given I have three recommendations, when I press regenerate, then I receive three Issues different from the previous ones. 

- Given I regenerate, when it completes, then the suggestion and regeneration are recorded for the Admin Dashboard. 

### **FR-6 Manage Issue Selection** 

View details and select an issue 

|Story|
|---|



As a developer I need to view the full details of an Issue before selecting it So that I choose with confidence 

- Given I see recommended Issues, when I open one, then I see its complete details. 

- Given I decide to work on it, when I choose select, then I am asked to confirm. 

Confirm selection As a developer I need to confirm my selected Issue So that it is tracked on my account 

|Story|
|---|



- Given I pressed select, when I confirm, then the Issue is associated with my account with status In Progress. 

- Given I do not confirm, when I cancel, then no selection is made. 

|Ignore an issue<br>Story|
|---|



- As a developer I need to ignore an Issue I do not want So that it is not recommended again ● Given I ignore an Issue, when I request new recommendations, then that Issue never appears again. 

|Select from saved items<br>Story|
|---|



As a developer I need to select an Issue from my saved items So that I can start one I bookmarked earlier ● Given I have saved Issues, when I choose one and confirm, then it becomes my selected Issue. 

### **FR-7 Manage Saved Items** 

Bookmark and organize Story 

#### As a developer 

I need to bookmark repositories and Issues in named lists and move or remove them So that I keep what interests me 

- Given I view a repository or Issue, when I bookmark it, then it appears in my saved items. 

- Given I create a named list, when I move or remove items, then the changes are saved. 

- Given another user, when they try to open my lists, then access is denied. 

#### Track saved issue state 

|Story|
|---|



As a developer I need to see whether a saved Issue is still open, closed, or taken So that I do not waste time on unavailable Issues 

- Given I saved an Issue, when I view my list, then its current state is shown. 

- Given a saved Issue is closed or taken on GitHub, when the regular check runs, then it is flagged and I am notified. 

### **FR-8 Manage Progress** 

|Progress dashboard<br>Story|
|---|



#### As a developer 

I need a dashboard of my selected Issues with their status and a summary So that I see how far I have come 

- Given I have selected Issues, when I open the dashboard, then each shows In Progress, PR Open, Merged, or Ignored. 

- Given the dashboard loads, when I view the summary, then I see counts per status and the time since each Issue was selected. 

Update status and attach PR Story 

#### As a developer 

I need to update an Issue's status manually and attach my Pull Request link So that my progress is accurate 

- Given a selected Issue, when I change its status, then the new status is saved. 

- Given I paste my Pull Request link, when I save, then it is attached to the Issue. 

#### Automatic GitHub sync 

|Story|
|---|



#### As a developer 

I need my status to sync automatically from GitHub So that I do not update it by hand 

- Given I open a Pull Request, when the sync runs, then the status changes to PR Open within 5 minutes. 

- Given my Pull Request is merged, when the sync runs, then the status changes to Merged. 

- Given a status changes, when it is saved, then it is added to a dated history and made available to the Admin Dashboard and Gamification. 

### **FR-9 Manage Repository Onboarding** 

Repository overview Story As a developer I need an overview of the selected Issue's repository So that I understand its purpose and structure 

- Given I selected an Issue, when I open repository onboarding, then I see its purpose, structure, main technologies, and files to read first. 

Setup instructions Story As a developer I need instructions to clone, set up, run, and test the repository So that I can work locally 

- Given the repository has documentation, when I open setup, then I see steps to clone, set up, run, and test it. 

|Branch and PR guidance<br>Story|
|---|



#### As a developer 

I need branch instructions, contribution guidelines, and Pull Request rules So that my contribution follows the project's process 

- Given the repository has a CONTRIBUTING.md, when I open guidelines, then it is displayed. 

- Given I open PR guidance, when it loads, then it matches the repository's guidelines. 

- Given another user already selected an Issue from the same repository, when I open onboarding, then stored guidance is reused. 

### **FR-10 Manage Issue Onboarding** 

|Plain-language issue summary<br>Story|
|---|



#### As a developer 

I need a plain-language description of my Issue and its discussion So that I understand what is asked 

- Given I selected an Issue, when I open its onboarding, then I see a clear summary of the description and discussion. 

#### Requirements and related code 

#### Story 

#### As a developer 

I need the required technologies, related files, and research topics So that I know where to start 

- Given an Issue onboarding page, when it loads, then I see required technologies, knowledge, and level. 

- Given the page loads, when I scroll, then I see related files and directories and topics to research. 

#### Resources without solutions 

#### Story 

#### As a developer 

I need documentation and learning links without a ready solution So that I complete the contribution myself 

- Given I open the resources, when the page loads, then I see links to relevant documentation and learning material. 

- Given any onboarding content, when it is generated, then it contains no complete solution or implementation code. 

### **FR-11 Manage AI Guide** 

#### Chat with the AI guide 

|Story|
|---|



As a developer I need to chat with an AI guide about my selected Issue So that I understand the Issue, repository, and concepts 

- Given I selected an Issue, when I start a chat, then it is linked to that Issue and uses its context. 

- Given I ask how to investigate or what a concept means, when the AI replies, then I receive explanations and investigation steps within 10 seconds for most requests. 

#### Ask for resources 

Story 

#### As a developer 

I need to ask the AI guide for documentation and learning resources So that I can learn what I need 

- Given I ask for resources, when the AI replies, then it provides relevant documentation and learning links. 

|No solutions<br>Story|
|---|



As the platform owner I need the AI guide to refuse full solutions and implementation code So that developers complete the work themselves 

- Given I ask the AI to solve the Issue or write the code, when it replies, then it refuses and offers guidance instead. 

- Given I rephrase or follow up with the same request, when it replies, then it still refuses. 

|Chat history and AI limits<br>Story|
|---|



#### As a developer 

I need to continue a previous conversation, and be told when a limit is reached So that I can resume and understand restrictions 

- Given I had a chat on an Issue, when I reopen it, then the history is restored and I can continue. 

- Given the Admin's AI limit is reached, when I send a message, then I am told that the limit was reached. 

### **FR-12 Manage Learning Resources** 

|Git, GitHub, and PR guides<br>Story|
|---|



As a developer I need guides on Git, branches, Pull Requests, and testing So that I can submit a proper contribution 

- Given I open the learning section, when it loads, then I see guides for branches, creating a Pull Request and its description, and running tests. 

|Etiquette and search<br>Story|
|---|



#### As a developer 

I need open-source etiquette guidelines and a way to search resources by topic So that I find help quickly 

- Given I open the guidelines, when the page loads, then I see general contribution guidelines and etiquette. 

- Given I search a topic, when I submit, then matching resources are shown. 

- Given nothing matches, when I search, then I see a "no results" message. 

### **FR-13 Manage Notifications** 

|Receive notifications|Story|
|---|---|



As a developer I need notifications about new matches, Pull Request activity, closed saved Issues, badges, and outreach requests So that I do not miss anything 

- Given a new matching Issue or Pull Request review, comment, or merge occurs, when it is detected, then I receive a notification. 

- Given a saved Issue is closed or taken, I earn a badge, or I get an outreach request, when it happens, then I receive a notification. 

Choose channels and frequency Story As a developer I need to choose channels, frequency, and which types are on 

#### So that I only get what I want 

- Given I choose in-app or email and instant, daily, or weekly, when an event occurs, then it is delivered accordingly. 

- Given I turn a type off, when that event occurs, then no notification is sent. 

#### View and mark as read Story As a developer I need to view my notifications and mark them read So that I can manage them 

- Given I have notifications, when I open the list, then I see them with their read state. ● Given I mark one as read, when I reload, then it stays read. 

### **FR-14 Manage Profile** 

Edit profile and password Story As a developer I need to update my name, username, bio, avatar, and password So that my account information is correct 

- Given I edit my profile with a unique username, when I save, then the changes are stored and displayed. 

- Given I choose a username that already exists, when I save, then I see an error and nothing changes. 

- ● Given I enter a valid new password, when I save, then the password is updated. 

View history and statistics Story As a developer I need to view my Issue history, the AI guide chats of each Issue, and my contribution statistics So that I can review my past work 

- Given I have past Issues, when I open my history, then I see all Issues associated with my account and their chats. 

- Given I open my statistics, when the page loads, then I see counts of Issues selected, merged, and ignored. 

- Given another user tries to open my history, when the request is made, then access is denied. 

|Delete my account<br>Story|
|---|
|As a developer<br>I need to delete my account and data|
|So that my personal information is removed|
|● Given I request account deletion and confirm, when the request is processed, then my<br>account and personal data are deleted.|
|● Given my account is deleted, when I try to log in, then login fails.|



### **FR-15 Manage Public Contribution Profile** 

Publish a public profile Story As a developer I need a shareable public contribution profile So that I can show my work to others 

- Given I publish my profile, when it is created, then it is generated from my platform and GitHub activity with a unique link. 

- ● Given my profile is public, when I press copy link, then the link is copied. 

Control visibility Story As a developer I need to choose which parts show and set the profile public or private So that I control my privacy 

- Given I select parts (skills, merged contributions, badges, streaks), when others view my profile, then only those parts show. 

- Given I set it to private, when someone opens the link, then the profile is hidden. 

Opt in as mentor Story As a developer I need to opt in or out of being discoverable as a mentor So that I decide if others can find me 

- Given I opt in, when someone searches contributors, then I can be listed. 

- Given I opt out, when someone searches, then I am not listed. 

### **FR-16 Manage Gamification** 

|Earn badges<br>Story|
|---|



As a developer I need to earn badges for milestones So that I stay motivated 

- Given I reach a milestone such as first Pull Request, first merge, or five contributions, when progress is checked, then the badge is awarded once and stored. 

- Given a badge is awarded, when it happens, then I am notified. 

|View badges and streaks<br>Story|
|---|



#### As a developer 

I need to see my badges, what is needed for the others, and my streaks So that I know my next goal 

- Given I open my achievements, when the page loads, then I see earned badges and the requirements of unearned ones. 

- Given I have contribution activity, when I view streaks, then I see my current and longest streak. 

Show badges on public profile Story 

As a developer I need to choose which badges appear on my public profile So that I showcase what I want 

- Given I select badges, when others view my public profile, then only the chosen badges and streaks appear. 

### **FR-17 Manage Mentor & Contributor Search** 

Search contributors Story 

As a developer or maintainer 

I need to search contributors by organization or repository and filter by language or topic So that I can find people to learn from or recruit 

- Given I enter an organization or repository, when I search, then contributor data is retrieved from public GitHub data. 

- Given I add a language or topic filter, when I search, then the results are narrowed. 

Ranked list with activity Story As a developer or maintainer I need a ranked list of active contributors with their activity and expertise So that I choose the right person 

- Given search results exist, when they are shown, then contributors are ranked by activity. 

- Given I view a contributor, when I open them, then I see merged Pull Requests, commits, reviews, and areas of expertise. 

Open a contributor profile Story As a developer or maintainer I need to open a contributor's GitHub or platform profile So that I learn more about them ● Given a contributor has a public platform profile, when I open it, then I reach that profile. ● Given they do not, when I open the profile, then I am taken to their GitHub profile. 

### **FR-18 Manage Contributor Outreach** 

- Send a request Story As a developer or maintainer I need to send a mentorship or recruitment request with a message So that I can start a conversation ● Given the contributor opted in, when I send a request, then it is delivered through a notification. 

- ● Given the contributor did not opt in, when I try to contact them, then I see their GitHub link instead. 

   - Given I exceeded the sending limit, when I send another request, then it is blocked with a message. 

Respond to a request Story As a user who receives a request I need to accept, decline, or block it So that I control who contacts me 

- Given I received a request, when I accept or decline, then its status is recorded. ● Given I block a sender, when they try to contact me again, then it is prevented. 

Message and view requests Story As a user I need to view my sent and received requests and message accepted contacts So that I can continue the conversation 

- Given I open my requests, when the page loads, then I see sent and received requests with their statuses. 

- Given a request was accepted, when we exchange messages, then the conversation is stored. 

### **FR-19 Manage Admin Dashboard** 

|View usage figures<br>Story|
|---|
|As an Admin|



I need a dashboard of users, suggested and regenerated Issues, and Issue statuses So that I can track platform usage 

- Given I am an Admin, when I open the dashboard, then I see logged-in and registered users, Issues suggested and regenerated, and counts per status. 

- Given I am not an Admin, when I try to open it, then access is denied. 

#### View AI usage and period filter Story As an Admin 

I need to see AI usage for a selected period with fresh data So that I can monitor consumption 

- Given I open AI usage, when it loads, then I see total tokens consumed across all AI features. 

- Given I select a period, when I apply it, then all figures are filtered to that period. 

- Given the dashboard is open, when figures are shown, then they are no more than 5 

minutes old. 

### **FR-20 Manage AI Settings** 

#### Edit AI settings 

#### Story 

#### As an Admin 

I need to edit the maximum tokens per user, the temperature, and the usage limit So that I keep AI usage within budget 

- Given I enter valid values, when I save, then the settings are stored. 

- Given I enter an invalid value, when I save, then I see an error and nothing changes. 

#### View settings against usage 

#### Story 

#### As an Admin 

I need to see the current settings and AI usage against the limit So that I know how close we are 

- Given I open AI settings, when the page loads, then I see current values and usage against the limit. 

Enforce AI settings Story 

#### As an Admin 

I need the settings applied to every AI feature starting from the next request So that the budget is protected 

- Given I changed the settings, when the next AI request is made, then the new values apply to CV extraction, matching, onboarding, and the AI guide. 

- Given the usage limit is reached, when a user makes an AI request, then it is blocked and the user is informed. 
