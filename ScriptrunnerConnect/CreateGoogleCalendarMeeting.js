import { IssueCreatedEvent } from '@stitch-it/jira-cloud/events';
import GoogleCalendar from './api/google/calendar';

/**
 * The function creates a Google Calandar invite using data from JSM IssueCreated event.
 * Connections needed: Google Calendr and Jira Conn
 * Event listener: Issue Created
 *
 * @param event Object that holds Issue Created event data
 * @param context Object that holds function invocation context data
 */

export default async function (event: IssueCreatedEvent, context: Context): Promise<void> {
	if (Object.keys(event).length === 0) {
		console.error('This script is designed to be triggered externally or manually from the Event Listener. Please consider using Event Listener Test Event Payload if you need to trigger this script manually.');
		return;
	}
	
	//custom field that contains the recepient's email address
	let emailTo = event.issue.fields['customfield_10128'];
    let anotherEmailTo = event.issue.fields['customfield_10130'];

    //contains the email address of the person who owns the calndar
    const calendarId = event.issue.fields['customfield_10129'];

    const summary = event.issue.fields['customfield_10131'];
    const description = event.issue.fields['customfield_10132'];

    //// Google Calendar expects the time to be in ISO 8601 format
    const meetingStart = event.issue.fields['customfield_10133'];
    const meetingDuration = event.issue.fields['customfield_10134'];
    const meetingEnd = meetingStart + meetingDuration;

	const attendees = [{
		email: emailTo ?? ''
	},
	{
		email: anotherEmailTo ?? ''
	}];

	// Schedule the meeting
	const response = await GoogleCalendar.Event.createEvent({
		calendarId: calendarId,
		body: {
			start: {
				dateTime: meetingStart
			},
			end: {
				dateTime: meetingEnd
			},
			summary: summary ?? '',
			description: description ?? '',
			attendees
		},
	});

	// Print out a confirmation message
	console.log(`Scheduled a meeting for ${response.start.dateTime ?? response.start.date ?? ''}`);

}
