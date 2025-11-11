# Schedule Interview Feature

## Overview
Added a Schedule Interview feature to the Applications view modal that allows clients to send interview invitations to developers who have applied to their projects.

## Features Implemented

### 1. Auto-Generated Email Template
- Personalized greeting using developer's name
- Project title and details
- Proposed rate (if available)
- Professional interview invitation message
- Discussion points for the interview
- Sender's name from session

### 2. Schedule Interview Button
- Added to the Applications modal for each application
- Blue button with calendar icon
- Located between Accept and Message buttons
- Opens email modal when clicked

### 3. Email Modal
- **Recipient Information**: Displays developer's name and email
- **Subject Field**: Editable subject line (pre-filled with "Interview Invitation - [Project Title]")
- **Message Field**: Large textarea with auto-generated message (fully editable)
- **Send Button**: Sends the email invitation
- **Cancel Button**: Closes the modal without sending

### 4. API Endpoint
- **Route**: `/api/interviews/schedule`
- **Method**: POST
- **Authentication**: Required (checks session)
- **Validation**: Validates required fields (email, name, subject, message)
- **Logging**: Logs email details to console (for development)
- **Ready for Integration**: Includes commented example for SendGrid integration

## Files Modified/Created

### Created Files
1. `src/app/api/interviews/schedule/route.ts` - API endpoint for sending interview emails

### Modified Files
1. `src/app/client/projects/page.tsx` - Added Schedule Interview functionality

## How It Works

1. **User clicks "Schedule Interview"** on an application
2. **Email template is generated** with:
   - Developer's name and email
   - Project title
   - Proposed rate (if available)
   - Professional invitation message
3. **Modal opens** showing the pre-filled email
4. **User can edit** the subject and message
5. **User clicks "Send Interview Invitation"**
6. **API processes the request** and logs the email details
7. **Success message** is displayed to the user

## Email Template Structure

```
Dear [Developer Name],

Thank you for your application to the "[Project Title]" project. We were impressed with your profile and would like to invite you for an interview to discuss the project further.

Project Details:
- Title: [Project Title]
- Your Proposed Rate: $[Amount] (if available)

We would like to schedule a video call or phone interview at your earliest convenience. Please let us know your availability for the coming week, and we'll arrange a suitable time.

During the interview, we'll discuss:
- Project requirements and scope
- Your experience and approach
- Timeline and deliverables
- Any questions you may have

Please reply to this email with your available time slots, or feel free to reach out if you have any questions.

We look forward to speaking with you!

Best regards,
[Client Name]
```

## Future Enhancements

### Email Service Integration
The API endpoint is ready for integration with email services. To enable actual email sending:

1. **Install email service package** (e.g., SendGrid, AWS SES, Resend)
2. **Add environment variables** for API keys
3. **Uncomment and configure** the email sending code in the API route

Example for SendGrid:
```bash
npm install @sendgrid/mail
```

Add to `.env`:
```
SENDGRID_API_KEY=your_api_key_here
VERIFIED_SENDER_EMAIL=your_verified_email@domain.com
```

### Additional Features to Consider
- Email templates library
- Schedule specific date/time for interview
- Calendar integration (Google Calendar, Outlook)
- Email tracking (opened, clicked)
- Follow-up reminders
- Interview status tracking in database

## Testing

To test the feature:
1. Log in as a client
2. Navigate to "My Projects"
3. Click on a project with applications
4. Click "Schedule Interview" on any application
5. Review the auto-generated email
6. Edit if needed
7. Click "Send Interview Invitation"
8. Check console logs for email details

## Notes

- Currently logs email details to console (development mode)
- No actual emails are sent until email service is integrated
- All email data is validated before processing
- Error handling is in place for failed requests
- Success/error messages are displayed to the user
