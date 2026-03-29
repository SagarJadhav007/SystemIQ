export default function Topbar() {
  return (
    <div className="h-11 bg-gray-900 border-b border-gray-800 flex items-center px-5 gap-3 shrink-0">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="font-semibold text-white text-sm tracking-wide">
        System Design Interviewer
      </span>
      <span className="text-gray-500 text-sm">·</span>
      <span className="text-gray-400 text-sm">Design a Chat App like WhatsApp</span>
    </div>
  );
}