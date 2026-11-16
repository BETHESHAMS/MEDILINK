
import { useState } from "react";
import {
  MessageCircle,
  UserRound,
  Search,
  LogOut,
  ArrowLeft,
} from "lucide-react";

function PatientDashboard({ user, onLogout }) {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">
          MediLink
        </h1>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="mx-auto max-w-6xl p-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Patient Messages
        </h2>

        <p className="mb-6 text-slate-500">
          Communicate with your doctors securely.
        </p>

        <div className="grid min-h-[550px] overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-3">

          {/* Conversation List */}
          <section className="border-r border-slate-200">
            <div className="border-b p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <MessageCircle size={19} />
                Conversations
              </h3>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  placeholder="Search conversations"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="p-6 text-center text-sm text-slate-500">
              No conversations loaded yet.
            </div>
          </section>

          {/* Chat Window */}
          <section className="flex flex-col md:col-span-2">
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <MessageCircle
                  size={48}
                  className="mx-auto mb-4 text-blue-300"
                />
                <h3 className="text-lg font-semibold text-slate-800">
                  Your messages
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Select a conversation to start chatting.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
