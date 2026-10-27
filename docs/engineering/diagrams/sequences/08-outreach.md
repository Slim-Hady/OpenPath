# Sequence — outreach lifecycle

```mermaid
sequenceDiagram
  autonumber
  actor S as Sender (Developer/Maintainer)
  actor R as Recipient
  participant W as Requests page
  participant A as OutreachService
  participant DB as Postgres
  participant N as Notifications

  S->>W: Community → contributor → Send request
  W->>A: POST /outreach {recipientId,type,message}
  A->>DB: recipient PublicProfile published + mentorOptIn?
  alt not opted in
    A-->>W: 403 with GitHub link
  else opted in
    A->>DB: blocked? daily limit (5)? pending duplicate?
    A->>DB: create OutreachRequest PENDING
    A->>N: OUTREACH_REQUEST notification
    A-->>W: request sent
  end

  R->>W: Requests → Accept / Decline / Block
  W->>A: PATCH /outreach/:id {action}
  A->>DB: status ACCEPTED/DECLINED/BLOCKED
  alt accepted
    A->>DB: create OutreachConversation
  else blocked
    A->>DB: BlockedUser(blocker=recipient, blocked=sender)
  end
  A->>N: notify sender of the outcome

  R->>W: Open conversation → message
  W->>A: POST /outreach/:id/conversation/messages
  A->>DB: participant + ACCEPTED check; insert OutreachMessage
  A->>N: OUTREACH_MESSAGE notification
  A-->>W: conversation
```

A block prevents future requests; the prior record remains for audit. Only the
recipient can answer, and only participants can read a conversation. See FR-18
and NFR-6.2.
