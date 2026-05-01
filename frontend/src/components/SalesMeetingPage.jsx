import { MeetingRoom } from "./MeetingRoom";

export function SalesMeetingPage({ meetingId }) {
  return (
    <MeetingRoom
      meetingId={meetingId}
      initialRole="sales"
      allowRoleSwitch={false}
      clientJoinLink={`${window.location.origin}/meet/${meetingId}`}
    />
  );
}