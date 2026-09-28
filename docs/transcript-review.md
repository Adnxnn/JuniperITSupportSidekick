# Transcript review

Reviewed sources: the supplied `Pasted markdown.md`, containing excerpts from Recordings 1–5, and the additional training excerpt pasted in chat. These are the only sources for support knowledge. Screenshot text is visual reference only.

| Home topic | Reviewed records | Transcript passages |
| --- | --- | --- |
| User Validation | Verification questions; alternate ID wording | Recording 1, 0:14–0:54 |
| AD Password Reset | AD Manager; 24-hour password-change wait and follow-up; validation | Recording 3, 31:55–32:29; Recording 2, 41:24–42:57; Recording 1, 0:14–0:54 |
| Mac Password & Recovery | Local Mac password recap; recovery-key lookup; validation | Recording 1, 0:54 and 45:53–47:53; Recording 3, 0:03–0:19 |
| BitLocker Recovery | Intune identification; recovery-screen scenarios; validation | Recording 3, 1:31–1:38; Recording 2, 38:20–40:35 |
| MFA & Authentication | Azure registration, revocation, setup failure, admin access; validation | Recording 3, 18:12–25:57 |
| iPhone Passcode & Compliance | Intune passcode removal and compliance checks | Recording 3, 26:31–32:29 |
| My Groups & VPN Roles | Contractor standard roles; manager-owned dedicated roles; application groups | Recording 4, 1:30–3:45 and 5:07–5:27; Recording 5, 0:45–2:49 |
| Zscaler Site Access | Employee connection and site-access checks | Recording 5, 2:53–3:15 |
| P3 / P4 Incidents | Incident entry point, caller/user ID and category | Recording 2, 0:15–1:09 |
| Mobile Teams & Outlook | Contractor mobile group mention | Recording 5, 4:08–4:26 |
| Software & Self-Service | Software Center, self-service portal, and networking template introduction | New training excerpt, 1:53–2:05 |
| Ticket Assignment Groups | CI/global-search routing; networking, SAP Basis, Concur, ADP BI, SAP Security, GTM Ops, SAP quotation, demand/supply | New training excerpt, 1:42:34–1:46:34 |
| iOS & Zoom Recap | HPE account/iOS enrollment, Zoom licence/expiry and Zoom Global Service group mentions | New training excerpt, 0:31–0:50 |

## Interpretation decisions

- Do not treat the Mac recovery-key lookup as either an AD password-reset walkthrough or a BitLocker retrieval walkthrough.
- Keep local Mac password reset as a partial recap, separate from personal recovery-key lookup.
- BitLocker prompt scenarios are statements from the lesson, not a diagnosis or hardware-repair procedure.
- For VPN eligibility, use the trainer's explicit correction: ITIO assigns standard roles only to contractors. Dedicated-role assignment belongs to the manager. The later use of “employees” while reading a description does not override this correction.
- Preserve uncertain HP directory wording, EUD/EOD spellings, ticket-menu labels, and escalation-address spellings as uncertainties.
- The mobile Teams/Outlook group name is a trainee response at the end of the excerpt; do not turn it into a confirmed assignment procedure.
- The isolated “Okta” utterance and configuration-item recap have no usable procedure. They do not become support-topic cards.
- No generic laptop, blue-screen, Android, printer, or hardware-repair topic is introduced.
- The additional excerpt jumps from 2:05 to 1:42:34. Software Center, self-service, networking template, iOS enrollment, and Zoom are mentioned but their demonstrations are absent. Do not invent their steps or treat a trainee recap as a confirmed walkthrough.
- Assignment-group routing uses the configuration item and global search. Application-specific groups still require checking the CI and issue type; transcription of some exact names is uncertain.
- Existing configured public Microsoft links are tool destinations, not support evidence. Missing organization-specific portal addresses are never inferred from screenshot mockups.

## Knowledge lifecycle

`data/training.json` holds the reviewed records and their source passages. Every record is mapped to at least one appropriate topic. JSON is authoritative after restart, so legacy SQLite procedure rows cannot supply stale answers. Newly ingested raw transcripts remain unreviewed until their procedures and supporting excerpts are added to the reviewed file.

The assistant returns reviewed record fields, never model-written steps. Topic pages submit questions to `/api/topics/:id/ask` and filter the allowed procedure IDs before answering on that page; the general assistant has a separate endpoint and conversation scope. Unsupported issues and ambiguous cases return an explicit gap or a clarification. If optional model selection is unavailable, local reviewed routing continues to work.
