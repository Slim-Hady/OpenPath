# **2. Functional Requirements** 

### **FR-1: Manage Authentication** 

_Owner:_ All users. _Linked to:_ CR-4 

#### **User Requirements** 

- 1.1 The user shall be able to create an account using their name, email address, and password, or by signing up with their GitHub account. 

- 1.2 The user shall be able to log in using their email address and password, or with GitHub. 

- 1.3 The user shall be able to log out of their account. 

- 1.4 The user shall be able to reset their password using their registered email address. 

- 1.5 The user shall be able to connect or disconnect their GitHub account from their account settings. 

#### **System Requirements** 

- 1.6 The system shall create an account when the user submits valid credentials or completes GitHub OAuth authorization. 

- 1.7 The system shall authenticate the user by email and password or by GitHub OAuth and start a session. 

- 1.8 The system shall end the session when the user logs out. 

- 1.9 The system shall send a password reset link to the user's registered email address. 

- 1.10 The system shall link or unlink the GitHub account through OAuth, store the access token securely, and use it to read repository, issue, and Pull Request data. 

- 1.11 The system shall enforce role-based access for the Developer, Maintainer, and Admin roles. 

### **FR-2: Manage Developer Information** 

_Owner:_ Developer. _Linked to:_ CR-1 

#### **User Requirements** 

- 2.1 The user shall be able to describe their skills, experience, and technical interests. 

- 2.2 The user shall be able to select their open-source experience level (Beginner, Intermediate, or Advanced). 

- 2.3 The user shall be able to select their preferred programming languages and technologies. 

2.4 The user shall be able to update this information at any time. 

#### **System Requirements** 

- 2.5 The system shall store the user's description of skills, experience, and interests. 

- 2.6 The system shall store the user's experience level. 

- 2.7 The system shall store the user's preferred programming languages and technologies. 

- 2.8 The system shall require an experience level and at least one language before issue recommendations are requested. 

- 2.9 The system shall make this information available to Issue Discovery and Issue Matching. 

### **FR-3: Manage CV Extraction** 

_Owner:_ Developer. _Linked to:_ CR-7, CR-1 

#### **User Requirements** 

- 3.1 The user shall be able to upload a CV in a supported file format. 

- 3.2 The user shall be able to see the status of the extraction. 

- 3.3 The user shall be able to review the skills, technologies, and experience level extracted from the CV. 

- 3.4 The user shall be able to correct, add, or remove extracted skills. 

- 3.5 The user shall be able to replace their CV with a new one. 

#### **System Requirements** 

3.6 The system shall accept an uploaded CV only if its file type and size are supported. 

3.7 The system shall extract the text from the uploaded CV. 

3.8 The system shall send the CV text to the AI to identify skills, technologies, and experience level. 

- 3.9 The system shall display the extracted results to the user for review. 

- 3.10 The system shall save the user's corrections to the developer information. 

- 3.11 The system shall replace the previous extraction when a new CV is uploaded. 

### **FR-4: Manage Issue Discovery** 

_Owner:_ Developer. _Linked to:_ CR-1 

#### **User Requirements** 

- 4.1 The user shall be able to request an issue search based on their profile. 

4.2 The user shall be able to narrow the search by programming language, label (such as good first issue), or repository activity. 

- 4.3 The user shall be able to restrict the search to a specific organization or repository. 

4.4 The user shall be told when no suitable Issues were found and be offered broader filters. 

#### **System Requirements** 

- 4.5 The system shall build the search from the user's languages, technologies, experience level, and chosen filters. 

- 4.6 The system shall retrieve open Issues from GitHub that match the search. 

- 4.7 The system shall exclude Issues that are closed, assigned, inactive, or already selected or ignored by the user. 

4.8 The system shall collect repository context (description, labels, activity) for each candidate Issue. 

- 4.9 The system shall pass the candidate pool to Issue Matching. 

- 4.10 The system shall report when the candidate pool is empty. 

### **FR-5: Manage Issue Matching** 

_Owner:_ Developer. _Linked to:_ CR-1 

#### **User Requirements** 

- 5.1 The user shall be able to receive the three Issues that best match their skills, knowledge, and experience level. 

5.2 The user shall be able to view the repository name, description, and link of each recommended Issue. 

5.3 The user shall be able to view the required technologies, languages, knowledge, experience level, and prerequisites of each Issue. 

- 5.4 The user shall be able to see why each Issue was recommended for them. 

- 5.5 The user shall be able to regenerate the recommendations and receive three different 

#### Issues. 

#### **System Requirements** 

5.6 The system shall use AI to rank the candidate pool against the user's profile. 

5.7 The system shall return the three highest-ranked Issues. 

5.8 The system shall display the repository details and requirements of each recommended Issue. 

5.9 The system shall generate a short explanation of the fit for each recommended Issue. 

5.10 The system shall return three different Issues each time the user regenerates. 

- 5.11 The system shall record suggested and regenerated Issues for the Admin Dashboard. 

### **FR-6: Manage Issue Selection** 

_Owner:_ Developer. _Linked to:_ CR-2 

#### **User Requirements** 

6.1 The user shall be able to select one Issue from the recommended Issues. 

6.2 The user shall be able to view the complete details of an Issue before selecting it. 

6.3 The user shall be able to confirm an Issue as their selected Issue. 

6.4 The user shall be able to ignore an Issue they do not want. 

6.5 The user shall be able to select an Issue from their saved items. 

#### **System Requirements** 

6.6 The system shall record the Issue the user selects. 

6.7 The system shall display the complete details of an Issue on request. 

6.8 The system shall finalize the selection only after the user confirms it. 

6.9 The system shall associate the selected Issue with the user's account. 

6.10 The system shall record ignored Issues so they are not recommended again. 

### **FR-7: Manage Saved Items** 

_Owner:_ Developer. _Linked to:_ CR-8 

#### **User Requirements** 

7.1 The user shall be able to bookmark repositories and Issues. 

7.2 The user shall be able to organize bookmarks into named lists. 

7.3 The user shall be able to move or remove saved items. 

7.4 The user shall be able to see whether each saved Issue is still open, closed, or taken. 

#### **System Requirements** 

7.5 The system shall store the user's saved items and lists. 

7.6 The system shall restrict saved lists to their owner. 

7.7 The system shall check the state of saved Issues on GitHub regularly. 

7.8 The system shall flag a saved Issue that was closed or taken and alert the user through Manage Notifications (FR-13). 

### **FR-8: Manage Progress** 

_Owner:_ Developer. _Linked to:_ CR-2 

#### **User Requirements** 

- 8.1 The user shall be able to view their selected Issues on a progress dashboard with the status In Progress, PR Open, Merged, or Ignored. 

8.2 The user shall be able to update the status of a selected Issue manually. 

8.3 The user shall be able to attach the link of their Pull Request to the Issue. 

8.4 The user shall be able to view a summary of their progress, with counts per status and the time since each Issue was selected. 

#### **System Requirements** 

8.5 The system shall save and display the status of each selected Issue. 

8.6 The system shall sync Issue and Pull Request status from GitHub automatically. 

8.7 The system shall change the status to PR Open when a Pull Request is detected and to Merged when it is merged. 

8.8 The system shall calculate the progress summary for each user. 

8.9 The system shall keep a dated history of status changes. 

8.10 The system shall provide status data to the Admin Dashboard and to Gamification. 

### **FR-9: Manage Repository Onboarding** 

_Owner:_ Developer. _Linked to:_ CR-3 

#### **User Requirements** 

9.1 The user shall be able to view an overview of the repository of the selected Issue: its purpose, structure, main technologies, and the files and directories to read first. 9.2 The user shall be able to view instructions for cloning the repository, setting it up locally, and running and testing it. 

9.3 The user shall be able to view instructions for creating a branch and access the repository's contribution guidelines, including its CONTRIBUTING.md file when available. 

9.4 The user shall be able to view the repository's Pull Request submission guidelines, including branch requirements, testing, and Pull Request creation. 

#### **System Requirements** 

9.5 The system shall generate the repository overview from the repository's README, structure, and metadata. 

9.6 The system shall generate setup, run, and test instructions from the repository's documentation. 

9.7 The system shall retrieve and display the repository's contribution guidelines when they exist. 

9.8 The system shall generate Pull Request submission guidance consistent with those guidelines. 

9.9 The system shall reuse stored guidance when another user selects an Issue from the same repository. 

### **FR-10: Manage Issue Onboarding** 

_Owner:_ Developer. _Linked to:_ CR-3 

#### **User Requirements** 

10.1 The user shall be able to view a plain-language description of the selected Issue. 10.2 The user shall be able to view the technologies, knowledge, and experience level the Issue requires. 

10.3 The user shall be able to view the areas of the codebase related to the Issue and recommended topics to research before starting. 

10.4 The user shall be able to access documentation and external learning resources related to the Issue. 

#### **System Requirements** 

10.5 The system shall summarize the Issue description and its discussion. 

10.6 The system shall display the required technologies, knowledge, and experience level. 10.7 The system shall identify the related files and directories and generate research topics for the Issue. 

10.8 The system shall provide links to relevant documentation and learning resources. 10.9 The system shall exclude complete solutions and implementation code from all onboarding content. 

### **FR-11: Manage AI Guide** 

_Owner:_ Developer. _Linked to:_ CR-3 

#### **User Requirements** 

11.1 The user shall be able to start a conversation with the AI guide about their selected Issue. 11.2 The user shall be able to ask about the Issue, the repository structure, and the technologies and concepts it requires. 

11.3 The user shall be able to ask how to investigate the Issue and ask for clarification of the onboarding instructions. 

11.4 The user shall be able to ask the AI guide for documentation or learning resources. 

11.5 The user shall be able to continue a previous conversation and view the chat history of the Issue. 

#### **System Requirements** 

11.6 The system shall start a conversation linked to the selected Issue and give the AI the Issue, repository, and onboarding context. 

11.7 The system shall answer with explanations, investigation steps, clarifications, and resources. 

11.8 The system shall refuse to provide complete solutions or implementation code, in every conversation and follow-up. 

11.9 The system shall store and restore the conversation for each selected Issue. 

11.10 The system shall apply the Admin's AI limits and tell the user when a limit is reached. 

### **FR-12: Manage Learning Resources** 

_Owner:_ Developer. _Linked to:_ CR-3 

#### **User Requirements** 

12.1 The user shall be able to view general Git and GitHub guidance, including creating and managing branches. 

12.2 The user shall be able to view instructions for creating a Pull Request and writing its description. 

12.3 The user shall be able to view instructions for running tests before submitting a Pull Request. 

12.4 The user shall be able to view general open-source contribution guidelines and etiquette. 12.5 The user shall be able to search the resources by topic. 

#### **System Requirements** 

12.6 The system shall display general Git and GitHub guidance. 

12.7 The system shall display Pull Request creation and description instructions. 

12.8 The system shall display testing instructions. 

12.9 The system shall display open-source contribution guidelines. 

12.10 The system shall return the resources that match the user's search. 

### **FR-13: Manage Notifications** 

_Owner:_ Developer. _Linked to:_ CR-8 

#### **User Requirements** 

13.1 The user shall be able to receive notifications about new matching Issues and Pull Request activity such as reviews, comments, and merges. 

13.2 The user shall be able to receive notifications when a saved Issue is closed or taken, when they earn a badge, and when they receive an outreach request. 

13.3 The user shall be able to choose the notification channels (in-app or email) and the frequency (instant, daily, or weekly). 

13.4 The user shall be able to turn each type of notification on or off. 

13.5 The user shall be able to view their notifications and mark them as read. 

#### **System Requirements** 

13.6 The system shall detect new matching Issues and Pull Request activity from GitHub. 

13.7 The system shall create notifications for events raised by other subsystems. 

13.8 The system shall deliver each notification through the user's chosen channel and 

frequency. 

13.9 The system shall store notifications and their read state. 

13.10 The system shall not send notification types the user turned off. 

### **FR-14: Manage Profile** 

_Owner:_ Developer. _Linked to:_ CR-2, CR-4 

#### **User Requirements** 

14.1 The user shall be able to view and update their name, username, bio, and avatar. 

14.2 The user shall be able to update their password. 

14.3 The user shall be able to view the history of all Issues associated with their account. 14.4 The user shall be able to view the AI guide chat history of each Issue in their history. 14.5 The user shall be able to view their contribution statistics, such as Issues selected, merged, and ignored. 

14.6 The user shall be able to delete their account and data. 

#### **System Requirements** 

14.7 The system shall save profile updates and keep usernames unique. 

14.8 The system shall save the updated password. 

14.9 The system shall display the Issue history and chat history to their owner only. 

14.10 The system shall calculate the contribution statistics from the user's history. 

14.11 The system shall delete the user's data when the account is deleted. 

### **FR-15: Manage Public Contribution Profile** 

_Owner:_ Developer. _Linked to:_ CR-9, CR-10 

#### **User Requirements** 

15.1 The user shall be able to publish a shareable public contribution profile. 

15.2 The user shall be able to choose which parts it shows, such as skills, merged contributions, badges, and streaks. 

15.3 The user shall be able to make the profile public or private at any time. 

15.4 The user shall be able to opt in or out of being discoverable as a mentor or contributor. 15.5 The user shall be able to copy the profile's link to share it. 

#### **System Requirements** 

15.6 The system shall generate the public profile from the user's platform and GitHub activity. 15.7 The system shall show only the parts the user chose. 

15.8 The system shall hide the profile from everyone else when it is private. 

15.9 The system shall list a user in Mentor & Contributor Search only if the user opted in. 

15.10 The system shall give each public profile a unique shareable link. 

### **FR-16: Manage Gamification** 

_Owner:_ Developer. _Linked to:_ CR-9 

#### **User Requirements** 

16.1 The user shall be able to earn badges for milestones such as their first Pull Request, first merge, and five contributions. 

16.2 The user shall be able to view their earned badges and what is needed to earn the others. 16.3 The user shall be able to view their current and longest contribution streaks. 16.4 The user shall be able to choose which badges appear on their public profile. 

#### **System Requirements** 

16.5 The system shall check milestones against the user's progress and award each badge 

once. 

16.6 The system shall calculate current and longest streaks from the user's contribution activity. 

16.7 The system shall store earned badges. 

16.8 The system shall notify the user when a badge is earned. 

16.9 The system shall provide the chosen badges and streaks to the public profile. 

### **FR-17: Manage Mentor & Contributor Search** 

_Owner:_ Developer, Maintainer. _Linked to:_ CR-10 

#### **User Requirements** 

17.1 The user shall be able to search for contributors by organization or repository. 

17.2 The user shall be able to filter the search by programming language or topic. 

17.3 The user shall be able to view a ranked list of the most active contributors and maintainers. 17.4 The user shall be able to view each person's contribution activity (such as merged Pull Requests, commits, and reviews) and areas of expertise. 

17.5 The user shall be able to open a person's GitHub or platform profile. 

#### **System Requirements** 

17.6 The system shall retrieve contributor data for the chosen organization or repository from GitHub. 

17.7 The system shall rank contributors by their contribution activity. 

17.8 The system shall derive each person's areas of expertise from the languages and repositories they contribute to. 

17.9 The system shall use public GitHub data only. 

17.10 The system shall link a contributor to their platform profile when one exists and is public. 

### **FR-18: Manage Contributor Outreach** 

_Owner:_ Developer, Maintainer. _Linked to:_ CR-11 

#### **User Requirements** 

18.1 The user shall be able to send a mentorship or recruitment request with a message to a contributor. 

18.2 The user shall be able to accept, decline, or block a request they receive. 18.3 The user shall be able to exchange messages with a contributor once a request is accepted. 

18.4 The user shall be able to view their sent and received requests and their statuses. 

#### **System Requirements** 

18.5 The system shall deliver each request to the recipient through Manage Notifications (FR-13). 

18.6 The system shall allow platform requests only to users who opted in under FR-15 and otherwise show the person's GitHub profile link. 

18.7 The system shall limit how many requests a user can send. 

18.8 The system shall record the status of each request. 

18.9 The system shall prevent a blocked sender from contacting the recipient again. 

18.10 The system shall store the conversation of each accepted request. 

### **FR-19: Manage Admin Dashboard** 

_Owner:_ Admin. _Linked to:_ CR-5 

#### **User Requirements** 

19.1 The Admin shall be able to access the Admin Dashboard. 

19.2 The Admin shall be able to view the number of logged-in users and registered users. 19.3 The Admin shall be able to view the number of Issues suggested and regenerated. 19.4 The Admin shall be able to view the number of Issues in each status (In Progress, PR Open, Merged, and Ignored). 

19.5 The Admin shall be able to view AI usage, such as tokens consumed. 

19.6 The Admin shall be able to view the figures for a selected period. 

#### **System Requirements** 

19.7 The system shall restrict the dashboard to users with the Admin role. 19.8 The system shall display the user, Issue, and status counts. 

19.9 The system shall display figures that are no more than 5 minutes old. 

19.10 The system shall total AI usage across all AI features. 

19.11 The system shall filter the figures by the selected period. 

### **FR-20: Manage AI Settings** 

_Owner:_ Admin. _Linked to:_ CR-6 

#### **User Requirements** 

20.1 The Admin shall be able to edit the maximum number of tokens available to each user. 20.2 The Admin shall be able to edit the temperature setting of the AI. 

20.3 The Admin shall be able to edit the AI usage limit. 

20.4 The Admin shall be able to view the current settings and the AI usage measured against the limit. 

#### **System Requirements** 

20.5 The system shall validate and store the settings the Admin saves. 

20.6 The system shall apply the maximum token limit to each user's AI requests. 

20.7 The system shall apply the temperature value to AI requests. 

20.8 The system shall enforce the AI usage limit and inform the user when it is reached. 20.9 The system shall apply these settings to every AI feature: CV extraction, issue matching, onboarding content, and the AI guide. 

20.10 The system shall apply changed settings from the next AI request. 


## **4. Subsystems & Traceability** 

### **4.1 Subsystems and Their Functional Requirements** 

|**Subsystem**|**High-level FRs**|**Low-level FRs**|
|---|---|---|
|Account Management|FR-1 Manage Authentication,<br>FR-14 Manage Profile|FR-1.1 to 1.11, FR-14.1 to<br>14.11|
|Developer Profile|FR-2 Manage Developer<br>Information, FR-3 Manage CV<br>Extraction|FR-2.1 to 2.9, FR-3.1 to 3.11|
|Issue Search|FR-4 Manage Issue Discovery<br>(Phase 1), FR-5 Manage<br>Issue Matching (Phase 2)|FR-4.1 to 4.10, FR-5.1 to 5.11|
|Contribution Tracking|FR-6 Manage Issue Selection,<br>FR-7 Manage Saved Items,<br>FR-8 Manage Progress|FR-6.1 to 6.10, FR-7.1 to 7.8,<br>FR-8.1 to 8.10|
|Onboarding & Learning|FR-9 Manage Repository<br>Onboarding, FR-10 Manage<br>Issue Onboarding, FR-12<br>Manage Learning Resources|FR-9.1 to 9.9, FR-10.1 to<br>10.9, FR-12.1 to 12.10|
|AI Guide|FR-11 Manage AI Guide|FR-11.1 to 11.10|
|Notification|FR-13 Manage Notifications|FR-13.1 to 13.10|
|Community & Recognition|FR-15 Manage Public<br>Contribution Profile, FR-16<br>Manage Gamification|FR-15.1 to 15.10, FR-16.1 to<br>16.9|
|Mentor Network|FR-17 Manage Mentor &<br>Contributor Search, FR-18<br>Manage Contributor Outreach|FR-17.1 to 17.10, FR-18.1 to<br>18.10|
|Admin & AI Settings|FR-19 Manage Admin<br>Dashboard, FR-20 Manage AI<br>Settings|FR-19.1 to 19.11, FR-20.1 to<br>20.10|



### **4.2 Interfaces** 

|**Interface**|**Type**|**Description**|
|---|---|---|
|IAccount|Provided by Account<br>Management|Authentication, roles, GitHub<br>connection, profile<br>management, and account<br>deletion.|



|ISkillProfile|Provided by Developer Profile|Stores and returns the user's<br>skills, experience level,<br>preferences, and<br>CV-extracted skills.|
|---|---|---|
|IIssueSearch|Provided by Issue Search|Runs Phase 1 discovery and<br>Phase 2 matching, and<br>regenerates<br>recommendations.|
|IContributionTracking|Provided by Contribution<br>Tracking|Records selected Issues,<br>saved lists, and progress<br>status, including GitHub status<br>sync.|
|IOnboarding|Provided by Onboarding &<br>Learning|Returns onboarding guidance<br>for the selected Issue and<br>general learning resources.|
|IAIGuide|Provided by AI Guide|Handles AI guide<br>conversations and chat<br>history.|
|INotification|Provided by Notification|Creates and delivers in-app<br>and email notifications and<br>stores preferences.|
|ICommunity|Provided by Community &<br>Recognition|Returns public contribution<br>profiles, badges, and streaks.|
|IMentorNetwork|Provided by Mentor Network|Searches contributors and<br>manages outreach requests.|
|IAdminDashboard|Provided by Admin & AI<br>Settings|Returns usage figures to the<br>Admin.|
|IAISettings|Provided by Admin & AI<br>Settings|Stores and returns maximum<br>tokens, temperature, and AI<br>usage limit.|
|IGitHubAPI|External system (GitHub)|Issue, repository, Pull<br>Request, and contributor data,<br>and account connection.|
|IEmailService|External system (email<br>provider)|Sends password reset,<br>notification, and outreach<br>emails.|
|ICVParser|External system (document<br>text extraction)|Extracts plain text from an<br>uploaded CV file.|
|ILLMService|External system (language|Extracts CV skills, ranks|



|model service)|Issues, generates onboarding|
|---|---|
||content, and answers AI guide|
||questions.|



### **4.3 Traceability Matrix** 

|**Subsystem**|**High-level FRs**|**Provided interface**|**Required interfaces**|
|---|---|---|---|
|Account Management|FR-1, FR-14|IAccount|IGitHubAPI,<br>IEmailService,<br>IContributionTracking,<br>IAIGuide|
|Developer Profile|FR-2, FR-3|ISkillProfile|ICVParser,<br>ILLMService,<br>IAISettings|
|Issue Search|FR-4, FR-5|IIssueSearch|ISkillProfile,<br>IContributionTracking,<br>IAISettings,<br>IGitHubAPI,<br>ILLMService|
|Contribution Tracking|FR-6, FR-7, FR-8|IContributionTracking|IIssueSearch,<br>IGitHubAPI,<br>INotification|
|Onboarding &<br>Learning|FR-9, FR-10, FR-12|IOnboarding|IContributionTracking,<br>IAISettings,<br>IGitHubAPI,<br>ILLMService|
|AI Guide|FR-11|IAIGuide|IContributionTracking,<br>IOnboarding,<br>IAISettings,<br>ILLMService|
|Notification|FR-13|INotification|IAccount,<br>IEmailService|
|Community &<br>Recognition|FR-15, FR-16|ICommunity|IAccount,<br>IContributionTracking,<br>IGitHubAPI,<br>INotification|
|Mentor Network|FR-17, FR-18|IMentorNetwork|IAccount,<br>ICommunity,<br>IGitHubAPI,|



||||INotification|
|---|---|---|---|
|Admin & AI Settings|FR-19, FR-20|IAdminDashboard,<br>IAISettings|IAccount,<br>IIssueSearch,|
||||IContributionTracking,<br>IAIGuide|



### **4.4 FR to CR to BR Traceability** 

|**FR**|**Customer Requirement**|**Business Requirement**|
|---|---|---|
|FR-1|CR-4|BR-1|
|FR-2|CR-1|BR-1|
|FR-3|CR-7, CR-1|BR-1|
|FR-4, FR-5|CR-1|BR-1|
|FR-6|CR-2|BR-1|
|FR-7|CR-8|BR-5|
|FR-8|CR-2|BR-2|
|FR-9, FR-10, FR-11, FR-12|CR-3|BR-2|
|FR-13|CR-8|BR-5|
|FR-14|CR-2, CR-4|BR-1, BR-2|
|FR-15|CR-9, CR-10|BR-5, BR-6|
|FR-16|CR-9|BR-5|
|FR-17, FR-18|CR-10, CR-11|BR-6|
|FR-19|CR-5|BR-3|
|FR-20|CR-6|BR-4|
