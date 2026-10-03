import React from "react";

interface ManageTierNotificationPanelProps {
  sendEmail: boolean;
  setSendEmail: (send: boolean) => void;
  emailSender: string;
  setEmailSender: (sender: string) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailMessage: string;
  setEmailMessage: (msg: string) => void;
}

export const ManageTierNotificationPanel: React.FC<ManageTierNotificationPanelProps> = ({
  sendEmail,
  setSendEmail,
  emailSender,
  setEmailSender,
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 accent-[#111111] rounded"
            />
            Send Email Notification
          </label>
          <span className="text-[10px] text-[#726F6D] font-bold">Via Zoho Mail</span>
        </div>

        {sendEmail && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[10px] font-bold text-[#726F6D] block mb-0.5">Sender</label>
              <input
                type="text"
                value={emailSender}
                onChange={(e) => setEmailSender(e.target.value)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111] font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#726F6D] block mb-0.5">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111] font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#726F6D] block mb-0.5">Custom Message Body</label>
              <textarea
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs text-[#111111] font-medium leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
