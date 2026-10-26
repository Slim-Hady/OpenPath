# **3. Non-Functional Requirements** 

**NFR-1: Performance** 

NFR-1.1 The system shall return 95% of standard API requests within 500 milliseconds under normal load. 

NFR-1.2 The system shall display the three recommended Issues within 10 seconds for at least 95% of recommendation requests, excluding external service failures. NFR-1.3 The system shall generate an AI guide response within 10 seconds for at least 90% of chat requests under normal operating conditions. 

NFR-1.4 The system shall show extracted CV skills within 30 seconds for at least 95% of uploads. 

**NFR-2: Availability** 

NFR-2.1 The system shall maintain at least 99.5% monthly availability. NFR-2.2 The system shall preserve user Issue history for at least 99.9% of completed operations. 

**NFR-3: Security** 

NFR-3.1 The system shall enforce authentication and authorization for 100% of protected operations. 

NFR-3.2 The system shall prevent unauthorized access to 100% of tested users' Issue history and chat history. 

NFR-3.3 The system shall use HTTPS/TLS for 100% of communication between client and server. 

NFR-3.4 The system shall store passwords hashed and GitHub access tokens encrypted. 

**NFR-4: AI Guardrails** 

NFR-4.1 The AI guide shall prevent the generation of complete solutions or implementation code for 100% of prompts in the defined guardrail test suite. 

NFR-4.2 The AI guide shall provide guidance, explanations, investigation steps, and learning resources instead of implementing the selected Issue. 

NFR-4.3 The AI guide shall maintain the same restrictions across 100% of conversations and follow-up questions. 

**NFR-5: Data Freshness** 

NFR-5.1 The system shall reflect GitHub Issue and Pull Request status changes within 5 minutes for at least 95% of changes. 

NFR-5.2 The system shall deliver at least 95% of notifications within 5 minutes of the triggering event, subject to the user's chosen frequency. 

#### **NFR-6: Privacy and Safety** 

NFR-6.1 The system shall make 100% of public profiles and mentor listings opt-in. NFR-6.2 The system shall let 100% of outreach recipients decline or block a sender. NFR-6.3 The system shall remove a user's personal data within 30 days of an account deletion request. 
