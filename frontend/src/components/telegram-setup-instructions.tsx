import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TelegramSetupInstructions() {
  return (
    <Alert>
      <AlertTitle>How to enable Telegram notifications</AlertTitle>
      <AlertDescription>
        <ol className="list-decimal list-inside space-y-1 mt-2 text-sm">
          <li>
            Open Telegram and search for the platform bot (
            <strong>@FormSaaSBot</strong> — replace with your actual bot username).
          </li>
          <li>
            Send <code>/start</code> to the bot to initiate a conversation.
          </li>
          <li>
            Find your personal Telegram chat ID. You can get it by messaging{" "}
            <strong>@userinfobot</strong> on Telegram — it will reply with your chat
            ID.
          </li>
          <li>
            For group notifications: add the bot to your group, then use a negative
            number like <code>-100XXXXXXXXXX</code> as the chat ID.
          </li>
          <li>Paste the chat ID in the field below and click Save.</li>
        </ol>
      </AlertDescription>
    </Alert>
  )
}
