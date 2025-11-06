import { google } from "googleapis";

export const makeOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export const getAuthUrl = () => {
  const oauth2 = makeOAuthClient();
  return oauth2.generateAuthUrl({
    access_type: "offline", // để lấy refresh_token
    prompt: "consent", // buộc hỏi lại quyền lần đầu
    scope: SCOPES,
  });
};

export const setCredentialsAndGetCalendar = (tokens) => {
  const oauth2 = makeOAuthClient();
  oauth2.setCredentials(tokens);
  return google.calendar({ version: "v3", auth: oauth2 });
};
